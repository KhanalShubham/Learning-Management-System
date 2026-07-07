import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users as UsersIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { type AxiosError } from '@/services/api';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import type { ManagedUser, UserStatus } from '@/features/users/types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

const editUserSchema = createUserSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
});

type UserFields = z.infer<typeof editUserSchema>;

const errorMessage = (err: unknown, fallback: string) => {
  const error = err as AxiosError<{ message?: string }>;
  return error.response?.data?.message || fallback;
};

export default function Users() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const skip = (page - 1) * PAGE_SIZE;

  const { data, isLoading } = useUsers(skip, PAGE_SIZE);
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFields>({
    resolver: zodResolver(editingUser ? editUserSchema : createUserSchema),
  });

  const roleOptions = (roles ?? []).map((r) => ({ value: r.id, label: r.name }));
  const roleNameById = new Map((roles ?? []).map((r) => [r.id, r.name]));

  const openCreateModal = () => {
    setEditingUser(null);
    reset({ fullName: '', email: '', password: '', roleId: roleOptions[0]?.value ?? '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEditModal = (u: ManagedUser) => {
    setEditingUser(u);
    reset({ fullName: u.fullName, email: u.email, password: '', roleId: u.roleId, status: u.status });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: UserFields) => {
    try {
      if (editingUser) {
        const payload = { ...data, password: data.password || undefined };
        await updateUser.mutateAsync({ id: editingUser.id, payload });
        toast({ title: 'User Updated', variant: 'success' });
      } else {
        await createUser.mutateAsync({ ...data, password: data.password! });
        toast({ title: 'User Created', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: 'Could Not Save User',
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (u: ManagedUser) => {
    if (u.id === currentUser?.id) {
      toast({ title: 'Cannot Delete Your Own Account', variant: 'destructive' });
      return;
    }
    if (!window.confirm(`Delete user "${u.fullName}"? This cannot be undone.`)) return;
    try {
      await deleteUser.mutateAsync(u.id);
      toast({ title: 'User Deleted', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could Not Delete User',
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">User Accounts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Staff accounts that can sign in to the ERP.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          description="Add your first staff account to get started."
          actionLabel="Add User"
          onAction={openCreateModal}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-semibold text-foreground">{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleNameById.get(u.roleId) ?? '—'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.status === 'ACTIVE' ? 'success' : u.status === 'SUSPENDED' ? 'destructive' : 'warning'
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add User'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label={editingUser ? 'New Password (optional)' : 'Password'}
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Select label="Role" options={roleOptions} error={errors.roleId?.message} {...register('roleId')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingUser ? 'Save Changes' : 'Create User'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
