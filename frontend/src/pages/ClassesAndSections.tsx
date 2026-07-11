import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Archive, BookOpen, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { useAcademicYears } from '@/features/school/hooks/useAcademicYears';
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useArchiveClass,
  useDeleteClass,
} from '@/features/academic-structure/hooks/useClasses';
import {
  useSections,
  useCreateSection,
  useUpdateSection,
  useArchiveSection,
  useDeleteSection,
} from '@/features/academic-structure/hooks/useSections';
import type { Class, Section } from '@/features/academic-structure/types';

const classSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayOrder: z.coerce.number().int(),
  description: z.string().optional(),
});
type ClassFormInput = z.input<typeof classSchema>;
type ClassFields = z.output<typeof classSchema>;

const sectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  capacity: z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
  roomNumber: z.string().optional(),
});
type SectionFormInput = z.input<typeof sectionSchema>;
type SectionFields = z.output<typeof sectionSchema>;

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

function SectionsPanel({ cls, onClose }: { cls: Class; onClose: () => void }) {
  const { toast } = useToast();
  const { data: sections, isLoading } = useSections(cls.id);
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const archiveSection = useArchiveSection();
  const deleteSection = useDeleteSection();

  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Section | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormInput, unknown, SectionFields>({ resolver: zodResolver(sectionSchema) });

  const openCreate = () => {
    setEditingSection(null);
    reset({ name: '', capacity: '', roomNumber: '' });
    setShowForm(true);
  };

  const openEdit = (section: Section) => {
    setEditingSection(section);
    reset({ name: section.name, capacity: section.capacity ?? '', roomNumber: section.roomNumber ?? '' });
    setShowForm(true);
  };

  const onSubmit = async (data: SectionFields) => {
    const payload = {
      name: data.name,
      capacity: data.capacity === '' || data.capacity === undefined ? undefined : Number(data.capacity),
      roomNumber: data.roomNumber || undefined,
    };
    try {
      if (editingSection) {
        await updateSection.mutateAsync({ id: editingSection.id, payload });
        toast({ title: 'Section Updated', variant: 'success' });
      } else {
        await createSection.mutateAsync({ classId: cls.id, ...payload });
        toast({ title: 'Section Added', variant: 'success' });
      }
      setShowForm(false);
    } catch (err) {
      toast({ title: 'Could Not Save Section', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveSection.mutateAsync(archiveTarget.id);
      toast({ title: 'Section Archived', variant: 'success' });
      setArchiveTarget(null);
    } catch (err) {
      toast({ title: 'Could Not Archive Section', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (section: Section) => {
    if (!window.confirm(`Permanently delete section "${section.name}"? Prefer Archive unless this was created by mistake.`)) return;
    try {
      await deleteSection.mutateAsync(section.id);
      toast({ title: 'Section Deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Delete Section', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <Modal isOpen title={`Sections — ${cls.name}`} onClose={onClose} size="md">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : !sections || sections.length === 0 ? (
          <EmptyState icon={Layers} title="No sections yet" description="Add the first section for this class." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell className="font-semibold text-foreground">{section.name}</TableCell>
                  <TableCell>{section.capacity ?? '—'}</TableCell>
                  <TableCell>{section.roomNumber ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(section)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setArchiveTarget(section)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors cursor-pointer"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(section)}
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

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t border-border/40 pt-4">
            <Input label="Section Name" placeholder="e.g. A" error={errors.name?.message} {...register('name')} />
            <Input
              label="Capacity (optional)"
              type="number"
              error={errors.capacity?.message as string | undefined}
              {...register('capacity')}
            />
            <Input label="Room Number (optional)" placeholder="e.g. 204" {...register('roomNumber')} />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                {editingSection ? 'Save Changes' : 'Add Section'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button size="sm" variant="secondary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add Section
          </Button>
        )}
      </div>

      <Dialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Section?"
        description={`"${archiveTarget?.name}" will be hidden from new assignments but its history is kept.`}
        type="warning"
        confirmText="Archive"
        onConfirm={handleArchive}
        isLoading={archiveSection.isPending}
      />
    </Modal>
  );
}

export default function ClassesAndSections() {
  const { toast } = useToast();
  const { data: years, isLoading: yearsLoading } = useAcademicYears();
  const [academicYearId, setAcademicYearId] = useState<string>('');

  const effectiveYearId = academicYearId || years?.find((y) => y.isCurrent)?.id || years?.[0]?.id || '';

  const { data: classes, isLoading: classesLoading } = useClasses(effectiveYearId);
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const archiveClass = useArchiveClass();
  const deleteClass = useDeleteClass();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [sectionsForClass, setSectionsForClass] = useState<Class | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Class | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormInput, unknown, ClassFields>({ resolver: zodResolver(classSchema) });

  const openCreateModal = () => {
    setEditingClass(null);
    reset({ name: '', displayOrder: (classes?.length ?? 0) + 1, description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cls: Class) => {
    setEditingClass(cls);
    reset({ name: cls.name, displayOrder: cls.displayOrder, description: cls.description ?? '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ClassFields) => {
    const payload = { ...data, description: data.description || undefined };
    try {
      if (editingClass) {
        await updateClass.mutateAsync({ id: editingClass.id, payload });
        toast({ title: 'Class Updated', variant: 'success' });
      } else {
        await createClass.mutateAsync({ academicYearId: effectiveYearId, ...payload });
        toast({ title: 'Class Created', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Class', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveClass.mutateAsync(archiveTarget.id);
      toast({ title: 'Class Archived', variant: 'success' });
      setArchiveTarget(null);
    } catch (err) {
      toast({ title: 'Could Not Archive Class', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (cls: Class) => {
    if (!window.confirm(`Permanently delete class "${cls.name}"? Prefer Archive unless this was created by mistake.`)) return;
    try {
      await deleteClass.mutateAsync(cls.id);
      toast({ title: 'Class Deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Delete Class', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Classes & Sections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Establish school grades and their sections for an academic year.
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openCreateModal}
          disabled={!effectiveYearId}
        >
          Add Class
        </Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Academic Year"
          value={effectiveYearId}
          onChange={(e) => setAcademicYearId(e.target.value)}
          options={(years ?? []).map((y) => ({ value: y.id, label: y.label }))}
        />
      </div>

      {yearsLoading || classesLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : !effectiveYearId ? (
        <EmptyState
          icon={BookOpen}
          title="No academic years yet"
          description="Create an academic year first under School Configuration."
        />
      ) : !classes || classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No classes yet"
          description="Add your first class to get started."
          actionLabel="Add Class"
          onAction={openCreateModal}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-semibold text-foreground">{cls.name}</TableCell>
                <TableCell>{cls.displayOrder}</TableCell>
                <TableCell>
                  <Badge variant={cls.status === 'ACTIVE' ? 'success' : 'secondary'}>{cls.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSectionsForClass(cls)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer px-2"
                    >
                      Manage Sections
                    </button>
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setArchiveTarget(cls)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors cursor-pointer"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls)}
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
        title={editingClass ? 'Edit Class' : 'Add Class'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Grade 8" error={errors.name?.message} {...register('name')} />
          <Input label="Order" type="number" error={errors.displayOrder?.message} {...register('displayOrder')} />
          <Input label="Description (optional)" {...register('description')} />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingClass ? 'Save Changes' : 'Create Class'}
          </Button>
        </form>
      </Modal>

      <Dialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Class?"
        description={`"${archiveTarget?.name}" will be hidden from new assignments but its history is kept.`}
        type="warning"
        confirmText="Archive"
        onConfirm={handleArchive}
        isLoading={archiveClass.isPending}
      />

      {sectionsForClass && (
        <SectionsPanel cls={sectionsForClass} onClose={() => setSectionsForClass(null)} />
      )}
    </div>
  );
}
