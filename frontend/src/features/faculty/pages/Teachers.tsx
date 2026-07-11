import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Users, Plus, Search } from 'lucide-react';
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
import { useDepartments } from '../hooks/useDepartments';
import { useDesignations } from '../hooks/useDesignations';
import { useTeachers } from '../hooks/useTeachers';
import { facultyService } from '../services/faculty.service';
import type { ListTeachersFilters, TeacherListItem, TeacherStatus, EmploymentType } from '../types';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: TeacherStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'RESIGNED', label: 'Resigned' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'RETIRED', label: 'Retired' },
];

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'VISITING', label: 'Visiting' },
];

const statusVariant = (status: TeacherStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'ON_LEAVE':
      return 'info' as const;
    case 'SUSPENDED':
      return 'warning' as const;
    case 'RESIGNED':
    case 'TERMINATED':
    case 'RETIRED':
      return 'secondary' as const;
  }
};

const EXPORT_PAGE_SIZE = 100;

export default function Teachers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const canCreate = !!user?.permissions.includes('teachers.create') || !!user?.permissions.includes('*');
  const [isExporting, setIsExporting] = useState(false);

  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [status, setStatus] = useState<TeacherStatus | ''>('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('');
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

  const activeFilters: ListTeachersFilters = {
    departmentId: departmentId || undefined,
    designationId: designationId || undefined,
    status: status || undefined,
    employmentType: employmentType || undefined,
    search: search || undefined,
  };

  const { data, isLoading, isFetching } = useTeachers({
    ...activeFilters,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const teachers = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const rows: TeacherListItem[] = [];
      let skip = 0;
      while (true) {
        const result = await facultyService.listTeachers({ ...activeFilters, skip, take: EXPORT_PAGE_SIZE });
        rows.push(...result.data);
        if (rows.length >= result.total || result.data.length === 0) break;
        skip += EXPORT_PAGE_SIZE;
      }

      const csv = toCsv(rows, [
        { label: 'Employee ID', value: (t) => t.employeeId },
        { label: 'First Name', value: (t) => t.firstName },
        { label: 'Middle Name', value: (t) => t.middleName ?? '' },
        { label: 'Last Name', value: (t) => t.lastName },
        { label: 'Department', value: (t) => t.department.name },
        { label: 'Designation', value: (t) => t.designation.name },
        { label: 'Employment Type', value: (t) => t.employmentType },
        { label: 'Phone', value: (t) => t.phone },
        { label: 'Joining Date', value: (t) => new Date(t.joiningDate).toLocaleDateString() },
        { label: 'Status', value: (t) => t.status },
      ]);
      downloadCsv(csv, `teachers-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      toast({ title: 'Export Failed', description: 'Could not export teachers to CSV.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Teachers Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and view all registered teaching staff.</p>
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
          {canCreate && (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/dashboard/teachers/new')}>
              Register Teacher
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          label="Search"
          placeholder="Name, employee #, phone, or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
        <Select
          label="Department"
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setPage(1);
          }}
          options={[{ value: '', label: 'All Departments' }, ...(departments ?? []).map((d) => ({ value: d.id, label: d.name }))]}
        />
        <Select
          label="Designation"
          value={designationId}
          onChange={(e) => {
            setDesignationId(e.target.value);
            setPage(1);
          }}
          options={[{ value: '', label: 'All Designations' }, ...(designations ?? []).map((d) => ({ value: d.id, label: d.name }))]}
        />
        <Select
          label="Employment Type"
          value={employmentType}
          onChange={(e) => {
            setEmploymentType(e.target.value as EmploymentType | '');
            setPage(1);
          }}
          options={EMPLOYMENT_TYPE_OPTIONS}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TeacherStatus | '');
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teachers found"
          description="Adjust your filters or register a new teacher to get started."
          actionLabel={canCreate ? 'Register Teacher' : undefined}
          onAction={canCreate ? () => navigate('/dashboard/teachers/new') : undefined}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee #</TableHead>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Employment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id} className="cursor-pointer" onClick={() => navigate(`/dashboard/teachers/${teacher.id}`)}>
                  <TableCell className="font-mono text-xs">{teacher.employeeId}</TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {[teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(' ')}
                  </TableCell>
                  <TableCell>{teacher.department.name}</TableCell>
                  <TableCell>{teacher.designation.name}</TableCell>
                  <TableCell>{teacher.employmentType.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(teacher.status)}>{teacher.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
        </>
      )}
    </div>
  );
}
