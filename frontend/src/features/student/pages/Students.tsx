import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, GraduationCap, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { toCsv, downloadCsv } from '@/utils/csv';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAcademicYears } from '@/features/school/hooks/useAcademicYears';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useSections } from '@/features/academic-structure/hooks/useSections';
import { useStudents } from '@/features/student/hooks/useStudents';
import { studentService } from '@/features/student/services/student.service';
import type { ListStudentsFilters, StudentListItem, StudentStatus } from '@/features/student/types';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: StudentStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

const statusVariant = (status: StudentStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'GRADUATED':
      return 'info' as const;
    case 'INACTIVE':
    case 'WITHDRAWN':
      return 'secondary' as const;
    case 'TRANSFERRED':
      return 'warning' as const;
  }
};

const EXPORT_PAGE_SIZE = 100;

export default function Students() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const canAdmit = !!user?.permissions.includes('students.admit') || !!user?.permissions.includes('*');
  const [isExporting, setIsExporting] = useState(false);

  const { data: years } = useAcademicYears();
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [status, setStatus] = useState<StudentStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data: classes } = useClasses(academicYearId);
  const { data: sections } = useSections(classId);

  const activeFilters: ListStudentsFilters = {
    academicYearId: academicYearId || undefined,
    classId: classId || undefined,
    sectionId: sectionId || undefined,
    status: status || undefined,
    search: search || undefined,
  };

  const { data, isLoading, isFetching } = useStudents({
    ...activeFilters,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const students = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const rows: StudentListItem[] = [];
      let skip = 0;
      while (true) {
        const result = await studentService.listStudents({ ...activeFilters, skip, take: EXPORT_PAGE_SIZE });
        rows.push(...result.data);
        if (rows.length >= result.total || result.data.length === 0) break;
        skip += EXPORT_PAGE_SIZE;
      }

      const csv = toCsv(rows, [
        { label: 'Admission Number', value: (s) => s.admissionNumber },
        { label: 'First Name', value: (s) => s.firstName },
        { label: 'Middle Name', value: (s) => s.middleName ?? '' },
        { label: 'Last Name', value: (s) => s.lastName },
        { label: 'Class', value: (s) => s.enrollments[0]?.class.name ?? '' },
        { label: 'Section', value: (s) => s.enrollments[0]?.section.name ?? '' },
        { label: 'Roll Number', value: (s) => s.enrollments[0]?.rollNumber ?? '' },
        { label: 'Admission Date', value: (s) => new Date(s.admissionDate).toLocaleDateString() },
        { label: 'Status', value: (s) => s.status },
      ]);
      downloadCsv(csv, `students-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      toast({ title: 'Export Failed', description: 'Could not export students to CSV.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Students Registry</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and view all students currently enrolled.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
            isLoading={isExporting}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          {canAdmit && (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/dashboard/students/admission')}>
              Admit Student
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          label="Search"
          placeholder="Name, admission #, guardian, or phone"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
        <Select
          label="Academic Year"
          value={academicYearId}
          onChange={(e) => {
            setAcademicYearId(e.target.value);
            setClassId('');
            setSectionId('');
            setPage(1);
          }}
          options={[{ value: '', label: 'All Years' }, ...(years ?? []).map((y) => ({ value: y.id, label: y.label }))]}
        />
        <Select
          label="Class"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setSectionId('');
            setPage(1);
          }}
          disabled={!academicYearId}
          options={[{ value: '', label: 'All Classes' }, ...(classes ?? []).map((c) => ({ value: c.id, label: c.name }))]}
        />
        <Select
          label="Section"
          value={sectionId}
          onChange={(e) => {
            setSectionId(e.target.value);
            setPage(1);
          }}
          disabled={!classId}
          options={[{ value: '', label: 'All Sections' }, ...(sections ?? []).map((s) => ({ value: s.id, label: s.name }))]}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StudentStatus | '');
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Adjust your filters or admit a new student to get started."
          actionLabel={canAdmit ? 'Admit Student' : undefined}
          onAction={canAdmit ? () => navigate('/dashboard/students/admission') : undefined}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission #</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class / Section</TableHead>
                <TableHead>Roll #</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const enrollment = student.enrollments[0];
                return (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/dashboard/students/${student.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{student.admissionNumber}</TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')}
                    </TableCell>
                    <TableCell>
                      {enrollment ? `${enrollment.class.name} - ${enrollment.section.name}` : '—'}
                    </TableCell>
                    <TableCell>{enrollment?.rollNumber ?? '—'}</TableCell>
                    <TableCell>{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(student.status)}>{student.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
        </>
      )}
    </div>
  );
}
