import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { useTeacher } from '../hooks/useTeacher';
import {
  useUpdateTeacher,
  useUpdateTeacherStatus,
  useDeleteTeacher,
  useAddQualification,
  useDeleteQualification,
  useAddEmergencyContact,
  useUpdateEmergencyContact,
  useDeleteEmergencyContact,
  useAddDocument,
  useDeleteDocument,
  useUploadTeacherDocumentFile,
  useAdjustLeaveBalance,
} from '../hooks/useTeacherMutations';
import { useDepartments } from '../hooks/useDepartments';
import { useDesignations } from '../hooks/useDesignations';
import type { TeacherStatus, TeacherDocumentType, TeacherEmergencyContact } from '../types';

const STATUS_OPTIONS: TeacherStatus[] = ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED'];
const NON_TERMINAL_STATUSES: TeacherStatus[] = ['ACTIVE', 'ON_LEAVE', 'SUSPENDED'];
const TERMINAL_STATUSES: TeacherStatus[] = ['RESIGNED', 'TERMINATED', 'RETIRED'];
const DOCUMENT_TYPES: TeacherDocumentType[] = [
  'CITIZENSHIP',
  'ACADEMIC_CERTIFICATE',
  'EXPERIENCE_LETTER',
  'APPOINTMENT_LETTER',
  'PAN_CARD',
  'PHOTO',
  'OTHER',
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

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

const profileSchema = z.object({
  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING']),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  municipality: z.string().optional(),
  ward: z.string().optional(),
  basicSalary: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional(),
});
type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFields = z.output<typeof profileSchema>;

const qualificationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  yearCompleted: z.coerce.number().int().min(1950).max(new Date().getFullYear()),
});
type QualificationFormInput = z.input<typeof qualificationSchema>;
type QualificationFields = z.output<typeof qualificationSchema>;

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  phone: z.string().min(1, 'Phone is required'),
  isPrimary: z.boolean().optional(),
});
type ContactFields = z.infer<typeof contactSchema>;

const leaveBalanceSchema = z.object({
  annualEntitlement: z.coerce.number().int().min(0),
  sickEntitlement: z.coerce.number().int().min(0),
  casualEntitlement: z.coerce.number().int().min(0),
  annualUsed: z.coerce.number().int().min(0),
  sickUsed: z.coerce.number().int().min(0),
  casualUsed: z.coerce.number().int().min(0),
});
type LeaveBalanceFormInput = z.input<typeof leaveBalanceSchema>;
type LeaveBalanceFields = z.output<typeof leaveBalanceSchema>;

function ProfileTab({ teacherId }: { teacherId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdate = !!user?.permissions.includes('teachers.update') || !!user?.permissions.includes('*');
  const canSeeSalary = !!user?.permissions.includes('teachers.salary') || !!user?.permissions.includes('*');
  const { data: teacher } = useTeacher(teacherId);
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const updateTeacher = useUpdateTeacher(teacherId);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFields>({ resolver: zodResolver(profileSchema) });

  if (!teacher) return null;

  const startEdit = () => {
    reset({
      departmentId: teacher.departmentId,
      designationId: teacher.designationId,
      employmentType: teacher.employmentType,
      firstName: teacher.firstName,
      middleName: teacher.middleName ?? '',
      lastName: teacher.lastName,
      dateOfBirth: teacher.dateOfBirth.slice(0, 10),
      gender: teacher.gender,
      bloodGroup: teacher.bloodGroup ?? '',
      phone: teacher.phone,
      email: teacher.email ?? '',
      address: teacher.address ?? '',
      province: teacher.province ?? '',
      district: teacher.district ?? '',
      municipality: teacher.municipality ?? '',
      ward: teacher.ward ?? '',
      basicSalary: teacher.basicSalary ?? '',
    });
    setIsEditing(true);
  };

  const onSubmit = async (data: ProfileFields) => {
    try {
      await updateTeacher.mutateAsync({
        ...data,
        middleName: data.middleName || undefined,
        bloodGroup: data.bloodGroup || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        province: data.province || undefined,
        district: data.district || undefined,
        municipality: data.municipality || undefined,
        ward: data.ward || undefined,
        basicSalary: data.basicSalary === '' || data.basicSalary === undefined ? undefined : Number(data.basicSalary),
      });
      toast({ title: 'Profile Updated', variant: 'success' });
      setIsEditing(false);
    } catch (err) {
      toast({ title: 'Could Not Update Profile', description: errorMessage(err), variant: 'destructive' });
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Department"
            options={(departments ?? []).map((d) => ({ value: d.id, label: d.name }))}
            {...register('departmentId')}
          />
          <Select
            label="Designation"
            options={(designations ?? []).map((d) => ({ value: d.id, label: d.name }))}
            {...register('designationId')}
          />
          <Select
            label="Employment Type"
            options={['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING'].map((t) => ({ value: t, label: t.replace('_', ' ') }))}
            {...register('employmentType')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Middle Name" {...register('middleName')} />
          <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
          <Select
            label="Gender"
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
            {...register('gender')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Email" error={errors.email?.message} {...register('email')} />
        </div>
        <Textarea label="Address" {...register('address')} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input label="Province" {...register('province')} />
          <Input label="District" {...register('district')} />
          <Input label="Municipality" {...register('municipality')} />
          <Input label="Ward" {...register('ward')} />
        </div>
        <Input label="Blood Group" {...register('bloodGroup')} />
        {canSeeSalary && <Input label="Basic Salary" type="number" step="0.01" {...register('basicSalary')} />}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    );
  }

  const fields: Array<[string, string | null]> = [
    ['Department', teacher.department.name],
    ['Designation', teacher.designation.name],
    ['Employment Type', teacher.employmentType.replace('_', ' ')],
    ['Date of Birth', new Date(teacher.dateOfBirth).toLocaleDateString()],
    ['Gender', teacher.gender],
    ['Blood Group', teacher.bloodGroup],
    ['Phone', teacher.phone],
    ['Email', teacher.email],
    ['Address', teacher.address],
    ['Province', teacher.province],
    ['District', teacher.district],
    ['Municipality', teacher.municipality],
    ['Ward', teacher.ward],
    ['Joining Date', new Date(teacher.joiningDate).toLocaleDateString()],
    ['Leaving Date', teacher.leavingDate ? new Date(teacher.leavingDate).toLocaleDateString() : null],
    ...(canSeeSalary ? ([['Basic Salary', teacher.basicSalary != null ? String(teacher.basicSalary) : null]] as Array<[string, string | null]>) : []),
  ];

  return (
    <div className="space-y-4">
      {canUpdate && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={startEdit}>
            Edit Profile
          </Button>
        </div>
      )}
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</dt>
            <dd className="text-sm text-foreground mt-0.5">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function QualificationsTab({ teacherId }: { teacherId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdate = !!user?.permissions.includes('teachers.update') || !!user?.permissions.includes('*');
  const { data: teacher } = useTeacher(teacherId);
  const addQualification = useAddQualification(teacherId);
  const deleteQualification = useDeleteQualification(teacherId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QualificationFormInput, unknown, QualificationFields>({ resolver: zodResolver(qualificationSchema) });

  if (!teacher) return null;

  const openCreateModal = () => {
    reset({ degree: '', fieldOfStudy: '', institution: '', yearCompleted: new Date().getFullYear() });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: QualificationFields) => {
    try {
      await addQualification.mutateAsync({ ...data, fieldOfStudy: data.fieldOfStudy || undefined });
      toast({ title: 'Qualification Added', variant: 'success' });
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Add Qualification', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this qualification?')) return;
    try {
      await deleteQualification.mutateAsync(id);
      toast({ title: 'Qualification Removed', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Remove Qualification', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {canUpdate && (
        <div className="flex justify-end">
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add Qualification
          </Button>
        </div>
      )}
      {teacher.qualifications.length === 0 ? (
        <EmptyState title="No qualifications" description="No qualifications are recorded for this teacher." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teacher.qualifications.map((q) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm">{q.degree}</CardTitle>
                  {q.fieldOfStudy && <p className="text-xs text-muted-foreground mt-0.5">{q.fieldOfStudy}</p>}
                </div>
                {canUpdate && (
                  <button
                    onClick={() => handleDelete(q.id)}
                    aria-label={`Remove ${q.degree} qualification`}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </CardHeader>
              <CardContent className="text-xs space-y-1 text-muted-foreground">
                <p>Institution: {q.institution}</p>
                <p>Year Completed: {q.yearCompleted}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Qualification" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Degree" error={errors.degree?.message} {...register('degree')} />
          <Input label="Field of Study" {...register('fieldOfStudy')} />
          <Input label="Institution" error={errors.institution?.message} {...register('institution')} />
          <Input
            label="Year Completed"
            type="number"
            error={errors.yearCompleted?.message as string | undefined}
            {...register('yearCompleted')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Add Qualification
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function EmergencyContactsTab({ teacherId }: { teacherId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdate = !!user?.permissions.includes('teachers.update') || !!user?.permissions.includes('*');
  const { data: teacher } = useTeacher(teacherId);
  const addContact = useAddEmergencyContact(teacherId);
  const updateContact = useUpdateEmergencyContact(teacherId);
  const deleteContact = useDeleteEmergencyContact(teacherId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TeacherEmergencyContact | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFields>({ resolver: zodResolver(contactSchema) });

  if (!teacher) return null;

  const openCreateModal = () => {
    setEditingContact(null);
    reset({ name: '', relation: '', phone: '', isPrimary: false });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: TeacherEmergencyContact) => {
    setEditingContact(contact);
    reset({ name: contact.name, relation: contact.relation, phone: contact.phone, isPrimary: contact.isPrimary });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ContactFields) => {
    try {
      if (editingContact) {
        await updateContact.mutateAsync({ contactId: editingContact.id, payload: data });
        toast({ title: 'Contact Updated', variant: 'success' });
      } else {
        await addContact.mutateAsync(data);
        toast({ title: 'Contact Added', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Contact', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (contact: TeacherEmergencyContact) => {
    if (!window.confirm(`Remove ${contact.name} as an emergency contact?`)) return;
    try {
      await deleteContact.mutateAsync(contact.id);
      toast({ title: 'Contact Removed', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Remove Contact', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {canUpdate && (
        <div className="flex justify-end">
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add Contact
          </Button>
        </div>
      )}
      {teacher.emergencyContacts.length === 0 ? (
        <EmptyState title="No emergency contacts" description="No emergency contacts are recorded for this teacher." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teacher.emergencyContacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  {contact.isPrimary && <Badge variant="outline">Primary</Badge>}
                  <CardTitle className="text-sm mt-2">{contact.name}</CardTitle>
                </div>
                {canUpdate && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(contact)}
                      aria-label={`Edit ${contact.name}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact)}
                      aria-label={`Remove ${contact.name}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-xs space-y-1 text-muted-foreground">
                <p>Relation: {contact.relation}</p>
                <p>Phone: {contact.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Relation" error={errors.relation?.message} {...register('relation')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" className="h-4 w-4" {...register('isPrimary')} />
            Primary Contact
          </label>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingContact ? 'Save Changes' : 'Add Contact'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function DocumentsTab({ teacherId }: { teacherId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canManage = !!user?.permissions.includes('teachers.documents') || !!user?.permissions.includes('*');
  const { data: teacher } = useTeacher(teacherId);
  const addDocument = useAddDocument(teacherId);
  const deleteDocument = useDeleteDocument(teacherId);
  const uploadDocumentFile = useUploadTeacherDocumentFile();

  const [documentType, setDocumentType] = useState<TeacherDocumentType>('CITIZENSHIP');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!teacher) return null;

  const handleUpload = async (file: File) => {
    try {
      const fileUrl = await uploadDocumentFile.mutateAsync(file);
      await addDocument.mutateAsync({ documentType, fileUrl });
      toast({ title: 'Document Added', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Add Document', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Remove this document?')) return;
    try {
      await deleteDocument.mutateAsync(documentId);
      toast({ title: 'Document Removed', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Remove Document', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex flex-col sm:flex-row gap-3 items-end justify-end">
          <div className="w-full sm:w-64">
            <Select
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as TeacherDocumentType)}
              options={DOCUMENT_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') }))}
            />
          </div>
          <Button
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            isLoading={uploadDocumentFile.isPending || addDocument.isPending}
            onClick={() => inputRef.current?.click()}
          >
            Upload Document
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      )}
      {teacher.documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="No documents have been uploaded for this teacher." />
      ) : (
        <ul className="space-y-2">
          {teacher.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium hover:underline">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {doc.documentType.replace(/_/g, ' ')}
              </a>
              {canManage && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  aria-label={`Remove ${doc.documentType.replace(/_/g, ' ')} document`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LeaveBalanceTab({ teacherId }: { teacherId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canManage = !!user?.permissions.includes('teachers.leave') || !!user?.permissions.includes('*');
  const { data: teacher } = useTeacher(teacherId);
  const adjustLeaveBalance = useAdjustLeaveBalance(teacherId);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LeaveBalanceFormInput, unknown, LeaveBalanceFields>({ resolver: zodResolver(leaveBalanceSchema) });

  if (!teacher) return null;

  const balance = teacher.leaveBalance;
  if (!balance) {
    return <EmptyState title="No leave balance" description="No leave balance ledger exists for this teacher." />;
  }

  const startEdit = () => {
    reset(balance);
    setIsEditing(true);
  };

  const onSubmit = async (data: LeaveBalanceFields) => {
    try {
      await adjustLeaveBalance.mutateAsync(data);
      toast({ title: 'Leave Balance Updated', variant: 'success' });
      setIsEditing(false);
    } catch (err) {
      toast({ title: 'Could Not Update Leave Balance', description: errorMessage(err), variant: 'destructive' });
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Annual Entitlement" type="number" {...register('annualEntitlement')} />
          <Input label="Annual Used" type="number" {...register('annualUsed')} />
          <Input label="Sick Entitlement" type="number" {...register('sickEntitlement')} />
          <Input label="Sick Used" type="number" {...register('sickUsed')} />
          <Input label="Casual Entitlement" type="number" {...register('casualEntitlement')} />
          <Input label="Casual Used" type="number" {...register('casualUsed')} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    );
  }

  const rows: Array<[string, number, number]> = [
    ['Annual Leave', balance.annualEntitlement, balance.annualUsed],
    ['Sick Leave', balance.sickEntitlement, balance.sickUsed],
    ['Casual Leave', balance.casualEntitlement, balance.casualUsed],
  ];

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={startEdit}>
            Adjust Balance
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {rows.map(([label, entitlement, used]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>Entitlement: {entitlement} days</p>
              <p>Used: {used} days</p>
              <p className="font-semibold text-foreground">Remaining: {entitlement - used} days</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function TeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageStatus =
    !!user?.permissions.includes('teachers.update') ||
    !!user?.permissions.includes('teachers.archive') ||
    !!user?.permissions.includes('*');
  const canArchive = !!user?.permissions.includes('teachers.archive') || !!user?.permissions.includes('*');

  const { data: teacher, isLoading } = useTeacher(id!);
  const updateStatus = useUpdateTeacherStatus(id!);
  const deleteTeacher = useDeleteTeacher();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!teacher) {
    return <EmptyState title="Teacher not found" description="This teacher record could not be found." />;
  }

  const handleStatusChange = async (status: TeacherStatus) => {
    try {
      await updateStatus.mutateAsync({ status });
      toast({ title: 'Status Updated', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Update Status', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${teacher.firstName} ${teacher.lastName}? This cannot be undone.`)) return;
    try {
      await deleteTeacher.mutateAsync(teacher.id);
      toast({ title: 'Teacher Deleted', variant: 'success' });
      navigate('/dashboard/teachers/list');
    } catch (err) {
      toast({ title: 'Could Not Delete Teacher', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard/teachers/list')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Teachers
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {teacher.photoUrl ? (
            <img src={teacher.photoUrl} alt={teacher.firstName} className="w-16 h-16 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
              {teacher.firstName[0]}
              {teacher.lastName[0]}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {[teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(' ')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{teacher.employeeId}</p>
          </div>
        </div>

        {canManageStatus ? (
          <div className="flex items-center gap-2">
            <div className="w-40">
              <Select
                value={teacher.status}
                onChange={(e) => handleStatusChange(e.target.value as TeacherStatus)}
                disabled={updateStatus.isPending || (TERMINAL_STATUSES.includes(teacher.status) && !canArchive)}
                options={(canArchive ? STATUS_OPTIONS : NON_TERMINAL_STATUSES.includes(teacher.status) ? NON_TERMINAL_STATUSES : [teacher.status]).map((s) => ({
                  value: s,
                  label: s.replace('_', ' '),
                }))}
              />
            </div>
            {canArchive && (
              <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        ) : (
          <Badge variant={statusVariant(teacher.status)}>{teacher.status}</Badge>
        )}
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="leave">Leave Balance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab teacherId={teacher.id} />
        </TabsContent>
        <TabsContent value="qualifications">
          <QualificationsTab teacherId={teacher.id} />
        </TabsContent>
        <TabsContent value="contacts">
          <EmergencyContactsTab teacherId={teacher.id} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab teacherId={teacher.id} />
        </TabsContent>
        <TabsContent value="leave">
          <LeaveBalanceTab teacherId={teacher.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
