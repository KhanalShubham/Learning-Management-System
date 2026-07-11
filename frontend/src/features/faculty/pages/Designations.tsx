import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Archive, IdCard, Pencil, Plus, Trash2 } from 'lucide-react';
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
  useDesignations,
  useCreateDesignation,
  useUpdateDesignation,
  useArchiveDesignation,
  useDeleteDesignation,
} from '../hooks/useDesignations';
import type { Designation } from '../types';

const designationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayOrder: z.coerce.number().int().positive('Display order must be a positive number'),
  description: z.string().optional(),
});
type DesignationFormInput = z.input<typeof designationSchema>;
type DesignationFields = z.output<typeof designationSchema>;

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

export default function Designations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canCreate = !!user?.permissions.includes('teachers.create') || !!user?.permissions.includes('*');
  const canUpdate = !!user?.permissions.includes('teachers.update') || !!user?.permissions.includes('*');
  const canArchive = !!user?.permissions.includes('teachers.archive') || !!user?.permissions.includes('*');
  const { data: designations, isLoading } = useDesignations();
  const createDesignation = useCreateDesignation();
  const updateDesignation = useUpdateDesignation();
  const archiveDesignation = useArchiveDesignation();
  const deleteDesignation = useDeleteDesignation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Designation | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DesignationFormInput, unknown, DesignationFields>({ resolver: zodResolver(designationSchema) });

  const openCreateModal = () => {
    setEditingDesignation(null);
    reset({ name: '', displayOrder: (designations?.length ?? 0) + 1, description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (designation: Designation) => {
    setEditingDesignation(designation);
    reset({ name: designation.name, displayOrder: designation.displayOrder, description: designation.description ?? '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: DesignationFields) => {
    const payload = { name: data.name, displayOrder: data.displayOrder, description: data.description || undefined };
    try {
      if (editingDesignation) {
        await updateDesignation.mutateAsync({ id: editingDesignation.id, payload });
        toast({ title: 'Designation Updated', variant: 'success' });
      } else {
        await createDesignation.mutateAsync(payload);
        toast({ title: 'Designation Created', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Designation', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveDesignation.mutateAsync(archiveTarget.id);
      toast({ title: 'Designation Archived', variant: 'success' });
      setArchiveTarget(null);
    } catch (err) {
      toast({ title: 'Could Not Archive Designation', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (designation: Designation) => {
    if (!window.confirm(`Permanently delete designation "${designation.name}"? Prefer Archive unless this was created by mistake.`)) return;
    try {
      await deleteDesignation.mutateAsync(designation.id);
      toast({ title: 'Designation Deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Delete Designation', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Designations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage job titles and their hierarchy order (Principal, Vice Principal, HOD, ...).
          </p>
        </div>
        {canCreate && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add Designation
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !designations || designations.length === 0 ? (
        <EmptyState
          icon={IdCard}
          title="No designations yet"
          description="Add your first designation to get started."
          actionLabel={canCreate ? 'Add Designation' : undefined}
          onAction={canCreate ? openCreateModal : undefined}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.map((designation) => (
              <TableRow key={designation.id}>
                <TableCell className="font-mono text-xs">{designation.displayOrder}</TableCell>
                <TableCell className="font-semibold text-foreground">{designation.name}</TableCell>
                <TableCell>
                  <Badge variant={designation.status === 'ACTIVE' ? 'success' : 'secondary'}>{designation.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canUpdate && (
                      <button
                        onClick={() => openEditModal(designation)}
                        aria-label={`Edit ${designation.name}`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canArchive && (
                      <>
                        <button
                          onClick={() => setArchiveTarget(designation)}
                          aria-label={`Archive ${designation.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors cursor-pointer"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(designation)}
                          aria-label={`Delete ${designation.name}`}
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
        title={editingDesignation ? 'Edit Designation' : 'Add Designation'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Senior Teacher" error={errors.name?.message} {...register('name')} />
          <Input
            label="Display Order"
            type="number"
            error={errors.displayOrder?.message}
            {...register('displayOrder')}
          />
          <Input label="Description (optional)" {...register('description')} />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingDesignation ? 'Save Changes' : 'Create Designation'}
          </Button>
        </form>
      </Modal>

      <Dialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Designation?"
        description={`"${archiveTarget?.name}" will be hidden from new registrations but existing history is kept.`}
        type="warning"
        confirmText="Archive"
        onConfirm={handleArchive}
        isLoading={archiveDesignation.isPending}
      />
    </div>
  );
}
