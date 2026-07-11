import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, ShieldAlert, BadgeCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { useAcademicYears } from '@/features/school/hooks/useAcademicYears';
import { useExamTerms, useCreateExamTerm, usePublishExamTerm } from '../hooks/useExams';
import type { ExamTerm } from '../types';
import { type AxiosError } from '@/services/api';

const examTermSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  weightage: z.coerce.number().min(0).max(1).default(1.0),
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: 'Start date must be less than or equal to end date', path: ['endDate'] }
);


export default function ExamTerms() {
  const { toast } = useToast();
  const { data: years } = useAcademicYears();
  const { data: terms, isLoading } = useExamTerms();
  const createTerm = useCreateExamTerm();
  const publishTerm = usePublishExamTerm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(examTermSchema),
  });

  const openCreateModal = () => {
    reset({ name: '', startDate: '', endDate: '', weightage: 1.0 });
    // Pre-select current academic year if available
    const currentYear = years?.find((y) => y.isCurrent);
    if (currentYear) {
      setValue('academicYearId', currentYear.id);
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        weightage: Number(data.weightage),
      };
      await createTerm.mutateAsync(payload);
      toast({ title: 'Exam Term Scheduled', variant: 'success' });
      setIsModalOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Could Not Schedule Term',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublication = async (term: ExamTerm) => {
    const nextStatus = term.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const confirmMsg =
      nextStatus === 'PUBLISHED'
        ? `Publish results for "${term.name}"? This compiles all student GPAs, class/subject rankings, and locks scores entry.`
        : `Revert results for "${term.name}" to Draft? This will unlock marks sheets entries for updates.`;
        
    if (!window.confirm(confirmMsg)) return;

    try {
      await publishTerm.mutateAsync({ termId: term.id, status: nextStatus });
      toast({
        title: nextStatus === 'PUBLISHED' ? 'Results Published & Locked' : 'Results Reverted to Draft',
        variant: 'success',
      });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Operation Failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Terms Cycles</h1>
          <p className="text-gray-500 text-sm">Create and publish terminal cycles for classes assessments.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Term Cycle
        </Button>
      </div>

      {/* Rules Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
        <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <div>
          <span className="font-semibold">Result Publication Warnings:</span> Publishing an exam term compiles final GPA report cards, calculates subject and class rankings, and locks all subject marks sheets under read-only mode. Reverting to draft status unlocks edit capabilities.
        </div>
      </div>

      {/* Terms Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
          </div>
        ) : !terms || terms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No exam term cycles scheduled yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term Name</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-semibold text-gray-900">{term.name}</TableCell>
                  <TableCell>{term.academicYear?.label ?? 'N/A'}</TableCell>
                  <TableCell>{term.startDate.slice(0, 10)}</TableCell>
                  <TableCell>{term.endDate.slice(0, 10)}</TableCell>
                  <TableCell>{term.weightage * 100}%</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        term.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {term.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={term.status === 'PUBLISHED' ? 'outline' : 'default'}
                      className="flex items-center gap-1.5 ml-auto"
                      onClick={() => handleTogglePublication(term)}
                    >
                      {term.status === 'PUBLISHED' ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Revert to Draft
                        </>
                      ) : (
                        <>
                          <BadgeCheck className="h-4 w-4" />
                          Publish & Lock
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Exam Term Cycle">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term Name</label>
            <Input
              type="text"
              placeholder="e.g. First Terminal Examination"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('academicYearId')}
            >
              {years?.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label} {y.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
            {errors.academicYearId && (
              <p className="mt-1 text-xs text-red-600">{errors.academicYearId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input type="date" {...register('startDate')} error={errors.startDate?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input type="date" {...register('endDate')} error={errors.endDate?.message} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yearly Weightage Coefficient (0.0 to 1.0)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="e.g. 0.20 for 20%"
              {...register('weightage')}
              error={errors.weightage?.message}
            />
            <p className="mt-1 text-xs text-gray-500">
              Weights represent the coefficient contributing to the year-end cumulative GPA.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Cycle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
