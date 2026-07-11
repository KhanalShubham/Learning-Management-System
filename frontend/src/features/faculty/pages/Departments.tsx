import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Archive, Building2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useArchiveDepartment,
  useDeleteDepartment,
} from '../hooks/useDepartments';
import type { Department } from '../types';

const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
});
type DepartmentFields = z.infer<typeof departmentSchema>;

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

export default function Departments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canCreate = !!user?.permissions.includes('teachers.create') || !!user?.permissions.includes('*');
  const canUpdate = !!user?.permissions.includes('teachers.update') || !!user?.permissions.includes('*');
  const canArchive = !!user?.permissions.includes('teachers.archive') || !!user?.permissions.includes('*');
  const { data: departments, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const archiveDepartment = useArchiveDepartment();
  const deleteDepartment = useDeleteDepartment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Department | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFields>({ resolver: zodResolver(departmentSchema) });

  const openCreateModal = () => {
    setEditingDepartment(null);
    reset({ name: '', code: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    reset({ name: department.name, code: department.code ?? '', description: department.description ?? '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: DepartmentFields) => {
    const payload = { name: data.name, code: data.code || undefined, description: data.description || undefined };
    try {
      if (editingDepartment) {
        await updateDepartment.mutateAsync({ id: editingDepartment.id, payload });
        toast({ title: 'Department Updated', variant: 'success' });
      } else {
        await createDepartment.mutateAsync(payload);
        toast({ title: 'Department Created', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Department', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveDepartment.mutateAsync(archiveTarget.id);
      toast({ title: 'Department Archived', variant: 'success' });
      setArchiveTarget(null);
    } catch (err) {
      toast({ title: 'Could Not Archive Department', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (department: Department) => {
    if (!window.confirm(`Permanently delete department "${department.name}"? Prefer Archive unless this was created by mistake.`)) return;
    try {
      await deleteDepartment.mutateAsync(department.id);
      toast({ title: 'Department Deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Delete Department', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Departments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage the academic and administrative department catalog.</p>
        </div>
        {canCreate && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add Department
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !departments || departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Add your first department to get started."
          actionLabel={canCreate ? 'Add Department' : undefined}
          onAction={canCreate ? openCreateModal : undefined}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-semibold text-foreground">{department.name}</TableCell>
                <TableCell>{department.code ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={department.status === 'ACTIVE' ? 'success' : 'secondary'}>{department.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canUpdate && (
                      <button
                        onClick={() => openEditModal(department)}
                        aria-label={`Edit ${department.name}`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canArchive && (
                      <>
                        <button
                          onClick={() => setArchiveTarget(department)}
                          aria-label={`Archive ${department.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors cursor-pointer"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(department)}
                          aria-label={`Delete ${department.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
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
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Mathematics" error={errors.name?.message} {...register('name')} />
          <Input label="Code (optional)" placeholder="e.g. MATH" error={errors.code?.message} {...register('code')} />
          <Input label="Description (optional)" {...register('description')} />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingDepartment ? 'Save Changes' : 'Create Department'}
          </Button>
        </form>
      </Modal>

      <Dialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Department?"
        description={`"${archiveTarget?.name}" will be hidden from new registrations but existing history is kept.`}
        type="warning"
        confirmText="Archive"
        onConfirm={handleArchive}
        isLoading={archiveDepartment.isPending}
      />
    </div>
  );
}
