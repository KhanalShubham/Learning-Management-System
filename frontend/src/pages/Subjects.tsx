import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Archive, BookMarked, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useArchiveSubject,
  useDeleteSubject,
} from '@/features/academic-structure/hooks/useSubjects';
import type { Subject } from '@/features/academic-structure/types';

const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  isOptional: z.boolean().optional(),
});
type SubjectFields = z.infer<typeof subjectSchema>;

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

export default function Subjects() {
  const { toast } = useToast();
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const archiveSubject = useArchiveSubject();
  const deleteSubject = useDeleteSubject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Subject | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFields>({ resolver: zodResolver(subjectSchema) });

  const openCreateModal = () => {
    setEditingSubject(null);
    reset({ name: '', code: '', description: '', isOptional: false });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    reset({
      name: subject.name,
      code: subject.code ?? '',
      description: subject.description ?? '',
      isOptional: subject.isOptional,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SubjectFields) => {
    const payload = {
      name: data.name,
      code: data.code || undefined,
      description: data.description || undefined,
      isOptional: data.isOptional,
    };
    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({ id: editingSubject.id, payload });
        toast({ title: 'Subject Updated', variant: 'success' });
      } else {
        await createSubject.mutateAsync(payload);
        toast({ title: 'Subject Created', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Subject', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveSubject.mutateAsync(archiveTarget.id);
      toast({ title: 'Subject Archived', variant: 'success' });
      setArchiveTarget(null);
    } catch (err) {
      toast({ title: 'Could Not Archive Subject', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!window.confirm(`Permanently delete subject "${subject.name}"? Prefer Archive unless this was created by mistake.`)) return;
    try {
      await deleteSubject.mutateAsync(subject.id);
      toast({ title: 'Subject Deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Delete Subject', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Subjects</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage the reusable subject catalog shared across all classes and years.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          Add Subject
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !subjects || subjects.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No subjects yet"
          description="Add your first subject to get started."
          actionLabel="Add Subject"
          onAction={openCreateModal}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-semibold text-foreground">{subject.name}</TableCell>
                <TableCell>{subject.code ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={subject.isOptional ? 'info' : 'secondary'}>
                    {subject.isOptional ? 'Optional' : 'Compulsory'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={subject.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {subject.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setArchiveTarget(subject)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors cursor-pointer"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject)}
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
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Mathematics" error={errors.name?.message} {...register('name')} />
          <Input label="Code (optional)" placeholder="e.g. MATH" error={errors.code?.message} {...register('code')} />
          <Input label="Description (optional)" {...register('description')} />
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" className="h-4 w-4" {...register('isOptional')} />
            Optional / Elective Subject
          </label>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingSubject ? 'Save Changes' : 'Create Subject'}
          </Button>
        </form>
      </Modal>

      <Dialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Subject?"
        description={`"${archiveTarget?.name}" will be hidden from new allocations but existing history is kept.`}
        type="warning"
        confirmText="Archive"
        onConfirm={handleArchive}
        isLoading={archiveSubject.isPending}
      />
    </div>
  );
}
