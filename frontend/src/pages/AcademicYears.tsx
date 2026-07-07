import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarRange, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import {
  useAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useSetCurrentAcademicYear,
} from '@/features/school/hooks/useAcademicYears';
import type { AcademicYear } from '@/features/school/types';

const academicYearSchema = z
  .object({
    label: z.string().min(2, 'Label is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });

type AcademicYearFields = z.infer<typeof academicYearSchema>;

const toDateInputValue = (isoDate: string) => isoDate.slice(0, 10);

export default function AcademicYears() {
  const { toast } = useToast();
  const { data: years, isLoading } = useAcademicYears();
  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();
  const deleteYear = useDeleteAcademicYear();
  const setCurrentYear = useSetCurrentAcademicYear();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcademicYearFields>({
    resolver: zodResolver(academicYearSchema),
  });

  const openCreateModal = () => {
    setEditingYear(null);
    reset({ label: '', startDate: '', endDate: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (year: AcademicYear) => {
    setEditingYear(year);
    reset({
      label: year.label,
      startDate: toDateInputValue(year.startDate),
      endDate: toDateInputValue(year.endDate),
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: AcademicYearFields) => {
    try {
      if (editingYear) {
        await updateYear.mutateAsync({ id: editingYear.id, payload: data });
        toast({ title: 'Academic Year Updated', variant: 'success' });
      } else {
        await createYear.mutateAsync(data);
        toast({ title: 'Academic Year Created', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Could Not Save Academic Year',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (year: AcademicYear) => {
    if (!window.confirm(`Delete academic year "${year.label}"? This cannot be undone.`)) return;
    try {
      await deleteYear.mutateAsync(year.id);
      toast({ title: 'Academic Year Deleted', variant: 'success' });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Could Not Delete Academic Year',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSetCurrent = async (year: AcademicYear) => {
    try {
      await setCurrentYear.mutateAsync(year.id);
      toast({ title: `${year.label} set as current academic year`, variant: 'success' });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Could Not Update Current Year',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Academic Years</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage academic year cycles and mark the currently active one.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          Add Academic Year
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !years || years.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No academic years yet"
          description="Add your first academic year to get started."
          actionLabel="Add Academic Year"
          onAction={openCreateModal}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-semibold text-foreground">{year.label}</TableCell>
                <TableCell>{toDateInputValue(year.startDate)}</TableCell>
                <TableCell>{toDateInputValue(year.endDate)}</TableCell>
                <TableCell>
                  <Badge variant={year.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {year.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {year.isCurrent ? (
                    <Badge variant="info">Current</Badge>
                  ) : (
                    <button
                      onClick={() => handleSetCurrent(year)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      Set Current
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(year)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(year)}
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
        title={editingYear ? 'Edit Academic Year' : 'Add Academic Year'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Label"
            placeholder="e.g. 2025/26"
            error={errors.label?.message}
            {...register('label')}
          />
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingYear ? 'Save Changes' : 'Create Academic Year'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
