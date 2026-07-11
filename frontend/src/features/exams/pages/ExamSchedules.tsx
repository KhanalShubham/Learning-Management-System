import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useClassSubjects } from '@/features/academic-structure/hooks/useClassSubjects';
import { useExamTerms, useExamsSchedule, useCreateExam } from '../hooks/useExams';
import { type AxiosError } from '@/services/api';

const examScheduleSchema = z.object({
  examTermId: z.string().uuid('Invalid Exam Term ID'),
  classId: z.string().uuid('Invalid Class ID'),
  classSubjectId: z.string().uuid('Invalid Class Subject ID'),
  examDate: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  roomNumber: z.string().max(50, 'Room number is too long').optional().nullable(),
  theoryMaxMarks: z.coerce.number().positive('Theory max marks must be positive'),
  theoryPassMarks: z.coerce.number().positive('Theory pass marks must be positive'),
  practicalMaxMarks: z.coerce.number().nonnegative('Practical max marks cannot be negative').default(0),
  practicalPassMarks: z.coerce.number().nonnegative('Practical pass marks cannot be negative').default(0),
}).refine(
  (data) => data.theoryPassMarks <= data.theoryMaxMarks,
  { message: 'Theory pass marks cannot exceed max marks', path: ['theoryPassMarks'] }
).refine(
  (data) => data.practicalPassMarks <= data.practicalMaxMarks,
  { message: 'Practical pass marks cannot exceed max marks', path: ['practicalPassMarks'] }
);


export default function ExamSchedules() {
  const { toast } = useToast();
  const { data: terms } = useExamTerms();
  
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeTerm = terms?.find((t) => t.id === selectedTermId);
  const { data: classes } = useClasses(activeTerm?.academicYearId);

  const { data: exams, isLoading } = useExamsSchedule({
    examTermId: selectedTermId || undefined,
    classId: selectedClassId || undefined,
  });

  const createExam = useCreateExam();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(examScheduleSchema),
    defaultValues: {
      theoryMaxMarks: 75,
      theoryPassMarks: 26.25,
      practicalMaxMarks: 25,
      practicalPassMarks: 8.75,
    },
  });

  const formClassId = watch('classId');
  const { data: subjects } = useClassSubjects(formClassId);

  const watchExamDate = watch('examDate');

  const openCreateModal = () => {
    reset({
      examTermId: selectedTermId,
      theoryMaxMarks: 75,
      theoryPassMarks: 26.25,
      practicalMaxMarks: 25,
      practicalPassMarks: 8.75,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        theoryMaxMarks: Number(data.theoryMaxMarks),
        theoryPassMarks: Number(data.theoryPassMarks),
        practicalMaxMarks: Number(data.practicalMaxMarks),
        practicalPassMarks: Number(data.practicalPassMarks),
      };
      await createExam.mutateAsync(payload);
      toast({ title: 'Exam scheduled successfully', variant: 'success' });
      setIsModalOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Could Not Schedule Exam',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const dateOutOfBounds =
    !!(activeTerm &&
    watchExamDate &&
    (watchExamDate < activeTerm.startDate.slice(0, 10) ||
      watchExamDate > activeTerm.endDate.slice(0, 10)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Schedules Planner</h1>
          <p className="text-gray-500 text-sm">Schedule class-wise subjects assessments timetables.</p>
        </div>
        <Button onClick={openCreateModal} disabled={!selectedTermId} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Subject Exam
        </Button>
      </div>

      {/* Filters selectors */}
      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam Term</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedTermId}
            onChange={(e) => {
              setSelectedTermId(e.target.value);
              setSelectedClassId('');
            }}
          >
            <option value="">-- Choose Exam Term --</option>
            {terms?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Class Tier (Optional)</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={!selectedTermId}
          >
            <option value="">-- All Classes --</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
          </div>
        ) : !selectedTermId ? (
          <div className="p-8 text-center text-gray-500">Please choose an exam term to display scheduled listings.</div>
        ) : !exams || exams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No subjects scheduled for this exam term yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Timings</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Max Theory (Pass)</TableHead>
                <TableHead>Max Practical (Pass)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-semibold">{exam.classSubject?.class?.name ?? 'N/A'}</TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {exam.classSubject?.subject?.name ?? 'N/A'}
                  </TableCell>
                  <TableCell>{exam.examDate.slice(0, 10)}</TableCell>
                  <TableCell>
                    {exam.startTime} - {exam.endTime}
                  </TableCell>
                  <TableCell>{exam.roomNumber || '-'}</TableCell>
                  <TableCell>
                    {exam.theoryMaxMarks} ({exam.theoryPassMarks})
                  </TableCell>
                  <TableCell>
                    {exam.practicalMaxMarks > 0
                      ? `${exam.practicalMaxMarks} (${exam.practicalPassMarks})`
                      : 'None'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {exam.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Scheduler Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Subject Exam">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Tier</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                {...register('classId')}
                onChange={(e) => {
                  setValue('classId', e.target.value);
                  setValue('classSubjectId', '');
                }}
              >
                <option value="">-- Select Class --</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.classId && <p className="mt-1 text-xs text-red-600">{errors.classId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject mapping</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                {...register('classSubjectId')}
                disabled={!formClassId}
              >
                <option value="">-- Choose Subject --</option>
                {subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subject?.name} {s.hasPractical ? '(Has Practical)' : ''}
                  </option>
                ))}
              </select>
              {errors.classSubjectId && (
                <p className="mt-1 text-xs text-red-600">{errors.classSubjectId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input type="date" {...register('examDate')} error={errors.examDate?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (HH:MM)</label>
              <Input type="text" placeholder="09:00" {...register('startTime')} error={errors.startTime?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time (HH:MM)</label>
              <Input type="text" placeholder="12:00" {...register('endTime')} error={errors.endTime?.message} />
            </div>
          </div>

          {/* Date bounds warning */}
          {dateOutOfBounds && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 flex gap-2 text-rose-800 text-xs">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <div>
                Warning: The exam date falls outside the term boundaries ({activeTerm?.startDate.slice(0, 10)} to {activeTerm?.endDate.slice(0, 10)}).
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room / Hall Allocation</label>
            <Input type="text" placeholder="e.g. Hall B / Room 102" {...register('roomNumber')} error={errors.roomNumber?.message} />
          </div>

          {/* Marks config */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Theory Marks</label>
              <Input type="number" step="0.5" {...register('theoryMaxMarks')} error={errors.theoryMaxMarks?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pass Theory Marks</label>
              <Input type="number" step="0.5" {...register('theoryPassMarks')} error={errors.theoryPassMarks?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Practical Marks</label>
              <Input type="number" step="0.5" {...register('practicalMaxMarks')} error={errors.practicalMaxMarks?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pass Practical Marks</label>
              <Input type="number" step="0.5" {...register('practicalPassMarks')} error={errors.practicalPassMarks?.message} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || dateOutOfBounds}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Exam'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
