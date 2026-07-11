import { useState, useEffect, useRef } from 'react';
import { FileSpreadsheet, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { useExamTerms, useExamsSchedule, useExamRoster, useSubmitExamMarks } from '../hooks/useExams';
import { type AxiosError } from '@/services/api';
import type { StudentLedgerItem } from '../types';

export default function MarksEntryLedger() {
  const { toast } = useToast();
  const { data: terms } = useExamTerms();

  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const activeTerm = terms?.find((t) => t.id === selectedTermId);
  
  // Fetch classes and exams list based on selections
  const { data: exams } = useExamsSchedule({
    examTermId: selectedTermId || undefined,
    classId: selectedClassId || undefined,
  });

  // Extract unique classes from term schedules
  const classesMap = new Map<string, string>();
  exams?.forEach((e) => {
    if (e.classSubject?.class) {
      classesMap.set(e.classSubject.class.id, e.classSubject.class.name);
    }
  });
  const classesList = Array.from(classesMap.entries()).map(([id, name]) => ({ id, name }));

  // Get active exam details
  const activeExam = exams?.find((e) => e.id === selectedExamId);

  // Fetch roster
  const { data: rosterData, isLoading: rosterLoading } = useExamRoster(selectedExamId);
  const submitMarks = useSubmitExamMarks();

  // Local state holding current ledger rows
  const [localRows, setLocalRows] = useState<any[]>([]);
  const [errorsMap, setErrorsMap] = useState<Map<string, string>>(new Map());

  // Refs for keyboard navigation
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (rosterData?.roster) {
      const rows = rosterData.roster.map((r: StudentLedgerItem) => ({
        studentId: r.studentId,
        rollNumber: r.rollNumber,
        firstName: r.firstName,
        middleName: r.middleName,
        lastName: r.lastName,
        admissionNumber: r.admissionNumber,
        status: r.marksEntry?.status ?? 'PRESENT',
        theoryObtained: r.marksEntry?.theoryObtained !== null ? String(r.marksEntry?.theoryObtained) : '',
        practicalObtained: r.marksEntry?.practicalObtained !== null ? String(r.marksEntry?.practicalObtained) : '',
        remarks: r.marksEntry?.remarks ?? '',
      }));
      setLocalRows(rows);
      setErrorsMap(new Map());
    } else {
      setLocalRows([]);
      setErrorsMap(new Map());
    }
  }, [rosterData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Check locks
  const isLocked = activeTerm?.status === 'PUBLISHED';

  // Keyboard navigation keydown handler
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colType: 'theory' | 'practical' | 'remarks'
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputRefs.current.get(`input-${colType}-${rowIndex + 1}`);
      nextInput?.focus();
      nextInput?.select();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = inputRefs.current.get(`input-${colType}-${rowIndex - 1}`);
      prevInput?.focus();
      prevInput?.select();
    }
  };

  const handleCellChange = (rowIndex: number, field: string, val: string) => {
    const updated = [...localRows];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [field]: val,
    };
    
    // Auto status checks: if they type numeric marks, auto-set status to PRESENT
    if ((field === 'theoryObtained' || field === 'practicalObtained') && val !== '') {
      updated[rowIndex].status = 'PRESENT';
    }

    setLocalRows(updated);
    validateRow(rowIndex, updated[rowIndex]);
  };

  const validateRow = (rowIndex: number, row: any) => {
    const newErrors = new Map(errorsMap);
    const key = String(rowIndex);
    newErrors.delete(key);

    if (row.status === 'PRESENT') {
      if (activeExam) {
        const theory = Number(row.theoryObtained);
        if (isNaN(theory) || row.theoryObtained.trim() === '') {
          newErrors.set(key, 'Theory mark is required');
        } else if (theory < 0 || theory > activeExam.theoryMaxMarks) {
          newErrors.set(key, `Theory must be between 0 and ${activeExam.theoryMaxMarks}`);
        }

        if (activeExam.practicalMaxMarks > 0) {
          const practical = Number(row.practicalObtained);
          if (isNaN(practical) || row.practicalObtained.trim() === '') {
            newErrors.set(key, 'Practical mark is required');
          } else if (practical < 0 || practical > activeExam.practicalMaxMarks) {
            newErrors.set(key, `Practical must be between 0 and ${activeExam.practicalMaxMarks}`);
          }
        }
      }
    }
    setErrorsMap(newErrors);
  };

  const handleBulkSetStatus = (status: 'PRESENT' | 'ABSENT') => {
    const updated = localRows.map((r) => ({
      ...r,
      status,
      theoryObtained: status === 'PRESENT' ? '0' : '',
      practicalObtained: status === 'PRESENT' ? '0' : '',
    }));
    setLocalRows(updated);
    setErrorsMap(new Map());
  };

  const handleSave = async () => {
    // Run final validation on all rows
    const finalErrors = new Map<string, string>();
    localRows.forEach((row, index) => {
      if (row.status === 'PRESENT') {
        const theory = Number(row.theoryObtained);
        if (row.theoryObtained.trim() === '' || isNaN(theory) || theory < 0 || theory > (activeExam?.theoryMaxMarks ?? 0)) {
          finalErrors.set(String(index), 'Invalid theory marks');
        }
        if ((activeExam?.practicalMaxMarks ?? 0) > 0) {
          const practical = Number(row.practicalObtained);
          if (row.practicalObtained.trim() === '' || isNaN(practical) || practical < 0 || practical > (activeExam?.practicalMaxMarks ?? 0)) {
            finalErrors.set(String(index), 'Invalid practical marks');
          }
        }
      }
    });

    if (finalErrors.size > 0) {
      setErrorsMap(finalErrors);
      toast({
        title: 'Validation Errors Present',
        description: 'Please correct highlighting errors before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const records = localRows.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        theoryObtained: r.status === 'PRESENT' ? Number(r.theoryObtained) : null,
        practicalObtained: r.status === 'PRESENT' && (activeExam?.practicalMaxMarks ?? 0) > 0 ? Number(r.practicalObtained) : null,
        remarks: r.remarks || null,
      }));

      await submitMarks.mutateAsync({
        examId: selectedExamId,
        records,
      });

      toast({ title: 'Marks ledger saved successfully', variant: 'success' });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Could Not Save Ledger',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks Entry Ledger</h1>
          <p className="text-gray-500 text-sm">Enter obtained marks grids for scheduled exam courses.</p>
        </div>
        {selectedExamId && !isLocked && (
          <Button onClick={handleSave} className="flex items-center gap-2" disabled={submitMarks.isPending}>
            <CheckCircle2 className="h-4 w-4" />
            {submitMarks.isPending ? 'Saving...' : 'Save Marks Ledger'}
          </Button>
        )}
      </div>

      {/* Selectors panel */}
      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam Term</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedTermId}
            onChange={(e) => {
              setSelectedTermId(e.target.value);
              setSelectedClassId('');
              setSelectedExamId('');
            }}
          >
            <option value="">-- Choose Exam Term --</option>
            {terms?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Class Tier</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedExamId('');
            }}
            disabled={!selectedTermId}
          >
            <option value="">-- Choose Class Tier --</option>
            {classesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Scheduled Subject Exam</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            disabled={!selectedClassId}
          >
            <option value="">-- Choose Exam Subject --</option>
            {exams
              ?.filter((e) => e.classSubject?.classId === selectedClassId)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.classSubject?.subject?.name} (Max Th: {e.theoryMaxMarks} | Max Pr: {e.practicalMaxMarks})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Locked Warning */}
      {isLocked && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3 text-rose-800 text-sm">
          <Lock className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Ledger Locked:</span> This exam term cycle has been officially published. Marks are frozen under read-only mode. Contact a Super Admin to revert status to Draft for corrections.
          </div>
        </div>
      )}

      {/* Ledger Table */}
      {selectedExamId && (
        <div className="bg-white border rounded-lg overflow-hidden space-y-4">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              {activeExam?.classSubject?.class?.name} - {activeExam?.classSubject?.subject?.name} Marks Ledger
            </h3>
            {!isLocked && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkSetStatus('PRESENT')}>
                  Set All Present
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkSetStatus('ABSENT')}>
                  Set All Absent
                </Button>
              </div>
            )}
          </div>

          {rosterLoading ? (
            <div className="flex justify-center p-8">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
            </div>
          ) : localRows.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No students are currently enrolled in this class section.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Roll</TableHead>
                    <TableHead className="w-32">Adm Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-36">Status</TableHead>
                    <TableHead className="w-40">Theory Obtained ({activeExam?.theoryMaxMarks})</TableHead>
                    <TableHead className="w-40">Practical Obtained ({activeExam?.practicalMaxMarks})</TableHead>
                    <TableHead className="w-64">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localRows.map((row, index) => {
                    const hasError = errorsMap.has(String(index));
                    return (
                      <TableRow key={row.studentId} className={hasError ? 'bg-red-50/50' : ''}>
                        <TableCell>{row.rollNumber ?? '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{row.admissionNumber}</TableCell>
                        <TableCell className="font-semibold text-gray-800">
                          {row.firstName} {row.middleName ? `${row.middleName} ` : ''}
                          {row.lastName}
                        </TableCell>
                        <TableCell>
                          <select
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none w-full"
                            value={row.status}
                            onChange={(e) => handleCellChange(index, 'status', e.target.value)}
                            disabled={isLocked}
                          >
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                            <option value="DISQUALIFIED">DISQUALIFIED</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            className="text-center font-semibold"
                            value={row.theoryObtained}
                            ref={(el: HTMLInputElement | null) => { inputRefs.current.set(`input-theory-${index}`, el); }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCellChange(index, 'theoryObtained', e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index, 'theory')}
                            disabled={isLocked || row.status !== 'PRESENT'}
                            error={hasError ? ' ' : undefined} // highlights cell border red
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            className="text-center font-semibold"
                            value={row.practicalObtained}
                            ref={(el: HTMLInputElement | null) => { inputRefs.current.set(`input-practical-${index}`, el); }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCellChange(index, 'practicalObtained', e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index, 'practical')}
                            disabled={isLocked || row.status !== 'PRESENT' || !(activeExam && activeExam.practicalMaxMarks > 0)}
                            error={hasError ? ' ' : undefined}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={row.remarks}
                            ref={(el: HTMLInputElement | null) => { inputRefs.current.set(`input-remarks-${index}`, el); }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCellChange(index, 'remarks', e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index, 'remarks')}
                            disabled={isLocked}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
