import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { useAcademicYears } from '@/features/school/hooks/useAcademicYears';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useSubjects } from '@/features/academic-structure/hooks/useSubjects';
import {
  useClassSubjects,
  useCreateClassSubject,
  useUpdateClassSubject,
  useDeleteClassSubject,
} from '@/features/academic-structure/hooks/useClassSubjects';
import type { ClassSubject } from '@/features/academic-structure/types';

const optionalPositive = z.union([z.coerce.number().int().positive(), z.literal('')]).optional();

const classSubjectSchema = z
  .object({
    subjectId: z.string().uuid('Select a subject'),
    fullMarks: z.coerce.number().int().positive('Full marks is required'),
    passMarks: z.coerce.number().int().positive('Pass marks is required'),
    hasPractical: z.boolean(),
    theoryMarks: optionalPositive,
    practicalMarks: optionalPositive,
    practicalPassMarks: optionalPositive,
  })
  .refine((data) => data.passMarks <= data.fullMarks, {
    message: 'Pass marks cannot exceed full marks',
    path: ['passMarks'],
  })
  .refine(
    (data) =>
      !data.hasPractical ||
      (data.theoryMarks !== '' &&
        data.practicalMarks !== '' &&
        data.theoryMarks !== undefined &&
        data.practicalMarks !== undefined &&
        Number(data.theoryMarks) + Number(data.practicalMarks) === data.fullMarks),
    { message: 'Theory + practical marks must equal full marks', path: ['practicalMarks'] }
  )
  .refine((data) => !data.hasPractical || (data.theoryMarks !== '' && data.passMarks <= Number(data.theoryMarks)), {
    message: 'Pass marks cannot exceed theory marks',
    path: ['passMarks'],
  })
  .refine(
    (data) =>
      !data.hasPractical ||
      (data.practicalPassMarks !== '' &&
        data.practicalPassMarks !== undefined &&
        data.practicalMarks !== '' &&
        Number(data.practicalPassMarks) <= Number(data.practicalMarks)),
    { message: 'Practical pass marks is required and cannot exceed practical marks', path: ['practicalPassMarks'] }
  );
type ClassSubjectFields = z.infer<typeof classSubjectSchema>;

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

export default function ClassSubjects() {
  const { toast } = useToast();
  const { data: years, isLoading: yearsLoading } = useAcademicYears();
  const [academicYearId, setAcademicYearId] = useState('');
  const effectiveYearId = academicYearId || years?.find((y) => y.isCurrent)?.id || years?.[0]?.id || '';

  const { data: classes, isLoading: classesLoading } = useClasses(effectiveYearId);
  const [classId, setClassId] = useState('');
  const effectiveClassId = classId || classes?.[0]?.id || '';

  const { data: subjects } = useSubjects();
  const { data: classSubjects, isLoading: classSubjectsLoading } = useClassSubjects(effectiveClassId);
  const createClassSubject = useCreateClassSubject();
  const updateClassSubject = useUpdateClassSubject();
  const deleteClassSubject = useDeleteClassSubject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassSubject, setEditingClassSubject] = useState<ClassSubject | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClassSubjectFields>({ resolver: zodResolver(classSubjectSchema) });

  const hasPractical = watch('hasPractical');

  const openCreateModal = () => {
    setEditingClassSubject(null);
    reset({
      subjectId: '',
      fullMarks: 100,
      passMarks: 35,
      hasPractical: false,
      theoryMarks: '',
      practicalMarks: '',
      practicalPassMarks: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (classSubject: ClassSubject) => {
    setEditingClassSubject(classSubject);
    reset({
      subjectId: classSubject.subjectId,
      fullMarks: classSubject.fullMarks,
      passMarks: classSubject.passMarks,
      hasPractical: classSubject.hasPractical,
      theoryMarks: classSubject.theoryMarks ?? '',
      practicalMarks: classSubject.practicalMarks ?? '',
      practicalPassMarks: classSubject.practicalPassMarks ?? '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ClassSubjectFields) => {
    const payload = {
      fullMarks: data.fullMarks,
      passMarks: data.passMarks,
      hasPractical: data.hasPractical,
      theoryMarks: data.hasPractical && data.theoryMarks !== '' ? Number(data.theoryMarks) : undefined,
      practicalMarks:
        data.hasPractical && data.practicalMarks !== '' ? Number(data.practicalMarks) : undefined,
      practicalPassMarks:
        data.hasPractical && data.practicalPassMarks !== '' ? Number(data.practicalPassMarks) : undefined,
    };
    try {
      if (editingClassSubject) {
        await updateClassSubject.mutateAsync({ id: editingClassSubject.id, payload });
        toast({ title: 'Allocation Updated', variant: 'success' });
      } else {
        await createClassSubject.mutateAsync({
          classId: effectiveClassId,
          subjectId: data.subjectId,
          ...payload,
        });
        toast({ title: 'Subject Allocated', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Allocation', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (classSubject: ClassSubject) => {
    if (!window.confirm(`Remove "${classSubject.subject.name}" from this class?`)) return;
    try {
      await deleteClassSubject.mutateAsync(classSubject.id);
      toast({ title: 'Allocation Removed', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Remove Allocation', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Subject Allocation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assign subjects to a class and configure their marks structure.
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openCreateModal}
          disabled={!effectiveClassId}
        >
          Allocate Subject
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
        <Select
          label="Academic Year"
          value={effectiveYearId}
          onChange={(e) => {
            setAcademicYearId(e.target.value);
            setClassId('');
          }}
          options={(years ?? []).map((y) => ({ value: y.id, label: y.label }))}
        />
        <Select
          label="Class"
          value={effectiveClassId}
          onChange={(e) => setClassId(e.target.value)}
          options={(classes ?? []).map((c) => ({ value: c.id, label: c.name }))}
          disabled={!effectiveYearId}
        />
      </div>

      {yearsLoading || classesLoading || classSubjectsLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !effectiveClassId ? (
        <EmptyState
          icon={ClipboardList}
          title="No classes yet"
          description="Create a class first under Classes & Sections."
        />
      ) : !classSubjects || classSubjects.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No subjects allocated yet"
          description="Allocate a subject to this class to get started."
          actionLabel="Allocate Subject"
          onAction={openCreateModal}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Full Marks</TableHead>
              <TableHead>Pass Marks</TableHead>
              <TableHead>Practical</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classSubjects.map((classSubject) => (
              <TableRow key={classSubject.id}>
                <TableCell className="font-semibold text-foreground">{classSubject.subject.name}</TableCell>
                <TableCell>{classSubject.fullMarks}</TableCell>
                <TableCell>
                  {classSubject.passMarks}
                  {classSubject.hasPractical && classSubject.practicalPassMarks != null
                    ? ` + ${classSubject.practicalPassMarks} (practical)`
                    : ''}
                </TableCell>
                <TableCell>
                  {classSubject.hasPractical ? (
                    <Badge variant="info">{classSubject.practicalMarks} marks</Badge>
                  ) : (
                    <Badge variant="secondary">None</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(classSubject)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(classSubject)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClassSubject ? 'Edit Allocation' : 'Allocate Subject'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Subject"
            error={errors.subjectId?.message}
            disabled={!!editingClassSubject}
            options={(subjects ?? []).map((s) => ({ value: s.id, label: s.name }))}
            {...register('subjectId')}
          />
          <Input label="Full Marks" type="number" error={errors.fullMarks?.message} {...register('fullMarks')} />
          <Input
            label={hasPractical ? 'Theory Pass Marks' : 'Pass Marks'}
            type="number"
            error={errors.passMarks?.message}
            {...register('passMarks')}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" className="h-4 w-4" {...register('hasPractical')} />
            Has Practical
          </label>
          {hasPractical && (
            <>
              <Input
                label="Theory Marks"
                type="number"
                error={errors.theoryMarks?.message as string | undefined}
                {...register('theoryMarks')}
              />
              <Input
                label="Practical Marks"
                type="number"
                error={errors.practicalMarks?.message as string | undefined}
                {...register('practicalMarks')}
              />
              <Input
                label="Practical Pass Marks"
                type="number"
                error={errors.practicalPassMarks?.message as string | undefined}
                {...register('practicalPassMarks')}
              />
            </>
          )}
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingClassSubject ? 'Save Changes' : 'Allocate Subject'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
