import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/features/roles/hooks/useRoles';
import type { RoleWithPermissions } from '@/features/roles/types';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  description: z.string().optional().or(z.literal('')),
});

type RoleFields = z.infer<typeof roleSchema>;

const errorMessage = (err: unknown, fallback: string) => {
  const error = err as AxiosError<{ message?: string }>;
  return error.response?.data?.message || fallback;
};

export default function Roles() {
  const { toast } = useToast();
  const { data: roles, isLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFields>({ resolver: zodResolver(roleSchema) });

  const openCreateModal = () => {
    setEditingRole(null);
    reset({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (role: RoleWithPermissions) => {
    setEditingRole(role);
    reset({ name: role.name, description: role.description ?? '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: RoleFields) => {
    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, payload: data });
        toast({ title: 'Role Updated', variant: 'success' });
      } else {
        await createRole.mutateAsync(data);
        toast({ title: 'Role Created', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: 'Could Not Save Role',
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (role: RoleWithPermissions) => {
    if (!window.confirm(`Delete role "${role.name}"? Users assigned to it must be reassigned first.`)) return;
    try {
      await deleteRole.mutateAsync(role.id);
      toast({ title: 'Role Deleted', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could Not Delete Role',
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Roles & Permissions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Roles determine what a user account can access. Permission sets are configured at setup time.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          Add Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !roles || roles.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No roles yet"
          description="Add your first role to get started."
          actionLabel="Add Role"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const hasWildcard = role.permissions.some((p) => p.permission.code === '*');
            return (
              <div key={role.id} className="border border-border/60 rounded-xl p-4 space-y-3 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{role.name}</h4>
                    {role.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {hasWildcard ? (
                    <Badge variant="info">Full System Access</Badge>
                  ) : role.permissions.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No permissions assigned</span>
                  ) : (
                    role.permissions.map((p) => (
                      <Badge key={p.permission.id} variant="secondary">
                        {p.permission.code}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Role' : 'Add Role'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Role Name" error={errors.name?.message} {...register('name')} />
          <Textarea label="Description" error={errors.description?.message} {...register('description')} />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingRole ? 'Save Changes' : 'Create Role'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
