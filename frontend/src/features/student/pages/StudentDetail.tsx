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
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { useStudent } from '@/features/student/hooks/useStudent';
import {
  useUpdateStudent,
  useUpdateStudentStatus,
  useDeleteStudent,
  useAddGuardian,
  useUpdateGuardian,
  useDeleteGuardian,
  useAddDocument,
  useDeleteDocument,
  useUploadStudentDocumentFile,
} from '@/features/student/hooks/useStudentMutations';
import type { Guardian, GuardianRelation, StudentStatus, DocumentType } from '@/features/student/types';

const STATUS_OPTIONS: StudentStatus[] = ['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED', 'WITHDRAWN'];
const GUARDIAN_RELATIONS: GuardianRelation[] = ['FATHER', 'MOTHER', 'GUARDIAN'];
const DOCUMENT_TYPES: DocumentType[] = [
  'BIRTH_CERTIFICATE',
  'TRANSFER_CERTIFICATE',
  'CHARACTER_CERTIFICATE',
  'PHOTO',
  'OTHER',
];

const statusVariant = (status: StudentStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'GRADUATED':
      return 'info' as const;
    case 'INACTIVE':
    case 'WITHDRAWN':
      return 'secondary' as const;
    case 'TRANSFERRED':
      return 'warning' as const;
  }
};

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  municipality: z.string().optional(),
  ward: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  feeCategory: z.string().optional(),
});
type ProfileFields = z.infer<typeof profileSchema>;

const guardianSchema = z.object({
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN']),
  fullName: z.string().min(1, 'Guardian name is required'),
  phone: z.string().min(1, 'Guardian phone is required'),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
});
type GuardianFields = z.infer<typeof guardianSchema>;

function ProfileTab({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdate = !!user?.permissions.includes('students.update') || !!user?.permissions.includes('*');
  const { data: student } = useStudent(studentId);
  const updateStudent = useUpdateStudent(studentId);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFields>({ resolver: zodResolver(profileSchema) });

  if (!student) return null;

  const startEdit = () => {
    reset({
      firstName: student.firstName,
      middleName: student.middleName ?? '',
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth.slice(0, 10),
      gender: student.gender,
      address: student.address ?? '',
      province: student.province ?? '',
      district: student.district ?? '',
      municipality: student.municipality ?? '',
      ward: student.ward ?? '',
      bloodGroup: student.bloodGroup ?? '',
      allergies: student.allergies ?? '',
      medicalConditions: student.medicalConditions ?? '',
      emergencyContactName: student.emergencyContactName ?? '',
      emergencyContactPhone: student.emergencyContactPhone ?? '',
      feeCategory: student.feeCategory ?? '',
    });
    setIsEditing(true);
  };

  const onSubmit = async (data: ProfileFields) => {
    try {
      await updateStudent.mutateAsync({
        ...data,
        middleName: data.middleName || undefined,
        address: data.address || undefined,
        province: data.province || undefined,
        district: data.district || undefined,
        municipality: data.municipality || undefined,
        ward: data.ward || undefined,
        bloodGroup: data.bloodGroup || undefined,
        allergies: data.allergies || undefined,
        medicalConditions: data.medicalConditions || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        feeCategory: data.feeCategory || undefined,
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
        <Textarea label="Address" {...register('address')} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input label="Province" {...register('province')} />
          <Input label="District" {...register('district')} />
          <Input label="Municipality" {...register('municipality')} />
          <Input label="Ward" {...register('ward')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Blood Group" {...register('bloodGroup')} />
          <Input label="Allergies" {...register('allergies')} />
          <Input label="Emergency Contact Name" {...register('emergencyContactName')} />
          <Input label="Emergency Contact Phone" {...register('emergencyContactPhone')} />
        </div>
        <Textarea label="Medical Conditions" {...register('medicalConditions')} />
        <Input label="Fee Category" {...register('feeCategory')} />
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
    ['Date of Birth', new Date(student.dateOfBirth).toLocaleDateString()],
    ['Gender', student.gender],
    ['Address', student.address],
    ['Province', student.province],
    ['District', student.district],
    ['Municipality', student.municipality],
    ['Ward', student.ward],
    ['Blood Group', student.bloodGroup],
    ['Allergies', student.allergies],
    ['Medical Conditions', student.medicalConditions],
    ['Emergency Contact Name', student.emergencyContactName],
    ['Emergency Contact Phone', student.emergencyContactPhone],
    ['Previous School', student.previousSchoolName],
    ['Previous School Board', student.previousSchoolBoard],
    ['Last Class Completed', student.lastClassCompleted],
    ['Transfer Certificate Number', student.transferCertificateNumber],
    ['Fee Category', student.feeCategory],
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

function GuardiansTab({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdate = !!user?.permissions.includes('students.update') || !!user?.permissions.includes('*');
  const { data: student } = useStudent(studentId);
  const addGuardian = useAddGuardian(studentId);
  const updateGuardian = useUpdateGuardian(studentId);
  const deleteGuardian = useDeleteGuardian(studentId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuardianFields>({ resolver: zodResolver(guardianSchema) });

  if (!student) return null;

  const availableRelations = GUARDIAN_RELATIONS.filter(
    (r) => !student.guardians.some((g) => g.relation === r)
  );

  const openCreateModal = () => {
    setEditingGuardian(null);
    reset({ relation: availableRelations[0] ?? 'GUARDIAN', fullName: '', phone: '', email: '', occupation: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    reset({
      relation: guardian.relation,
      fullName: guardian.fullName,
      phone: guardian.phone,
      email: guardian.email ?? '',
      occupation: guardian.occupation ?? '',
      address: guardian.address ?? '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: GuardianFields) => {
    const payload = {
      ...data,
      email: data.email || undefined,
      occupation: data.occupation || undefined,
      address: data.address || undefined,
    };
    try {
      if (editingGuardian) {
        await updateGuardian.mutateAsync({ guardianId: editingGuardian.id, payload });
        toast({ title: 'Guardian Updated', variant: 'success' });
      } else {
        await addGuardian.mutateAsync(payload);
        toast({ title: 'Guardian Added', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Guardian', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (guardian: Guardian) => {
    if (!window.confirm(`Remove ${guardian.fullName} as ${guardian.relation.toLowerCase()}?`)) return;
    try {
      await deleteGuardian.mutateAsync(guardian.id);
      toast({ title: 'Guardian Removed', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Remove Guardian', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {canUpdate && availableRelations.length > 0 && (
        <div className="flex justify-end">
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add Guardian
          </Button>
        </div>
      )}
      {student.guardians.length === 0 ? (
        <EmptyState title="No guardians" description="No guardians are recorded for this student." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {student.guardians.map((guardian) => (
            <Card key={guardian.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <Badge variant="outline">{guardian.relation}</Badge>
                  <CardTitle className="text-sm mt-2">{guardian.fullName}</CardTitle>
                </div>
                {canUpdate && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(guardian)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(guardian)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-xs space-y-1 text-muted-foreground">
                <p>Phone: {guardian.phone}</p>
                {guardian.email && <p>Email: {guardian.email}</p>}
                {guardian.occupation && <p>Occupation: {guardian.occupation}</p>}
                {guardian.address && <p>Address: {guardian.address}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGuardian ? 'Edit Guardian' : 'Add Guardian'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Relation"
            disabled={!!editingGuardian}
            options={(editingGuardian ? GUARDIAN_RELATIONS : availableRelations).map((r) => ({
              value: r,
              label: r.charAt(0) + r.slice(1).toLowerCase(),
            }))}
            {...register('relation')}
          />
          <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Email" error={errors.email?.message} {...register('email')} />
          <Input label="Occupation" {...register('occupation')} />
          <Input label="Address" {...register('address')} />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingGuardian ? 'Save Changes' : 'Add Guardian'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function DocumentsTab({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdate = !!user?.permissions.includes('students.update') || !!user?.permissions.includes('*');
  const { data: student } = useStudent(studentId);
  const addDocument = useAddDocument(studentId);
  const deleteDocument = useDeleteDocument(studentId);
  const uploadDocumentFile = useUploadStudentDocumentFile();

  const [documentType, setDocumentType] = useState<DocumentType>('BIRTH_CERTIFICATE');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!student) return null;

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
      {canUpdate && (
        <div className="flex flex-col sm:flex-row gap-3 items-end justify-end">
          <div className="w-full sm:w-64">
            <Select
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
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
      {student.documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="No documents have been uploaded for this student." />
      ) : (
        <ul className="space-y-2">
          {student.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium hover:underline">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {doc.documentType.replace(/_/g, ' ')}
              </a>
              {canUpdate && (
                <button
                  onClick={() => handleDelete(doc.id)}
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

function EnrollmentHistoryTab({ studentId }: { studentId: string }) {
  const { data: student } = useStudent(studentId);
  if (!student) return null;

  if (student.enrollments.length === 0) {
    return <EmptyState title="No enrollment history" description="This student has no recorded enrollments." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Academic Year</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Roll #</TableHead>
          <TableHead>Enrolled On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {student.enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell>{enrollment.academicYear.label}</TableCell>
            <TableCell>{enrollment.class.name}</TableCell>
            <TableCell>{enrollment.section.name}</TableCell>
            <TableCell>{enrollment.rollNumber ?? '—'}</TableCell>
            <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const canArchive = !!user?.permissions.includes('students.archive') || !!user?.permissions.includes('*');

  const { data: student, isLoading } = useStudent(id!);
  const updateStatus = useUpdateStudentStatus(id!);
  const deleteStudent = useDeleteStudent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!student) {
    return <EmptyState title="Student not found" description="This student record could not be found." />;
  }

  const handleStatusChange = async (status: StudentStatus) => {
    try {
      await updateStatus.mutateAsync(status);
      toast({ title: 'Status Updated', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Update Status', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${student.firstName} ${student.lastName}? This cannot be undone.`)) return;
    try {
      await deleteStudent.mutateAsync(student.id);
      toast({ title: 'Student Deleted', variant: 'success' });
      navigate('/students');
    } catch (err) {
      toast({ title: 'Could Not Delete Student', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/students')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Students
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt={student.firstName} className="w-16 h-16 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{student.admissionNumber}</p>
          </div>
        </div>

        {canArchive && (
          <div className="flex items-center gap-2">
            <div className="w-40">
              <Select
                value={student.status}
                onChange={(e) => handleStatusChange(e.target.value as StudentStatus)}
                disabled={updateStatus.isPending}
                options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
        {!canArchive && <Badge variant={statusVariant(student.status)}>{student.status}</Badge>}
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment History</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab studentId={student.id} />
        </TabsContent>
        <TabsContent value="guardians">
          <GuardiansTab studentId={student.id} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab studentId={student.id} />
        </TabsContent>
        <TabsContent value="enrollment">
          <EnrollmentHistoryTab studentId={student.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
