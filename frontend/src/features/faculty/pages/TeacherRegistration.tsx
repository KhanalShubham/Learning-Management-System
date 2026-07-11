import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDepartments } from '../hooks/useDepartments';
import { useDesignations } from '../hooks/useDesignations';
import {
  useRegisterTeacher,
  useUploadTeacherPhoto,
  useUploadTeacherDocumentFile,
} from '../hooks/useTeacherMutations';
import type { RegisterTeacherPayload } from '../types';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING'] as const;
const DOCUMENT_TYPES = [
  'CITIZENSHIP',
  'ACADEMIC_CERTIFICATE',
  'EXPERIENCE_LETTER',
  'APPOINTMENT_LETTER',
  'PAN_CARD',
  'PHOTO',
  'OTHER',
] as const;

const optionalString = z.string().optional();

const qualificationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: optionalString,
  institution: z.string().min(1, 'Institution is required'),
  yearCompleted: z.coerce.number().int().min(1950).max(new Date().getFullYear()),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  relation: z.string().min(1, 'Relation is required'),
  phone: z.string().min(1, 'Contact phone is required'),
  isPrimary: z.boolean().optional(),
});

const documentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES),
  fileUrl: z.string().url(),
});

const registrationSchema = z.object({
  departmentId: z.string().uuid('Select a department'),
  designationId: z.string().uuid('Select a designation'),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  joiningDate: z.string().min(1, 'Joining date is required'),

  firstName: z.string().min(1, 'First name is required'),
  middleName: optionalString,
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  photoUrl: optionalString,
  bloodGroup: optionalString,

  phone: z.string().min(1, 'Phone is required'),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),

  address: optionalString,
  province: optionalString,
  district: optionalString,
  municipality: optionalString,
  ward: optionalString,

  basicSalary: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional(),

  qualifications: z.array(qualificationSchema),
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
  documents: z.array(documentSchema),
});

type RegistrationFormInput = z.input<typeof registrationSchema>;
type RegistrationFields = z.output<typeof registrationSchema>;

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

export default function TeacherRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canSetSalary = !!user?.permissions.includes('teachers.salary') || !!user?.permissions.includes('*');

  const registerTeacher = useRegisterTeacher();
  const uploadPhoto = useUploadTeacherPhoto();
  const uploadDocumentFile = useUploadTeacherDocumentFile();

  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();

  const [newDocumentType, setNewDocumentType] = useState<(typeof DOCUMENT_TYPES)[number]>('CITIZENSHIP');
  const documentInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormInput, unknown, RegistrationFields>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      departmentId: '',
      designationId: '',
      employmentType: 'FULL_TIME',
      joiningDate: '',
      gender: 'MALE',
      basicSalary: '',
      qualifications: [],
      emergencyContacts: [{ name: '', relation: '', phone: '', isPrimary: true }],
      documents: [],
    },
  });

  const photoUrl = watch('photoUrl');
  const documents = watch('documents');

  const qualificationFields = useFieldArray({ control, name: 'qualifications' });
  const contactFields = useFieldArray({ control, name: 'emergencyContacts' });
  const documentFields = useFieldArray({ control, name: 'documents' });

  const handlePhotoUpload = async (file: File) => {
    const url = await uploadPhoto.mutateAsync(file);
    setValue('photoUrl', url, { shouldValidate: true });
    return url;
  };

  const handleAddDocument = async (file: File) => {
    try {
      const url = await uploadDocumentFile.mutateAsync(file);
      documentFields.append({ documentType: newDocumentType, fileUrl: url });
    } catch (err) {
      toast({ title: 'Upload Failed', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const onSubmit = async (data: RegistrationFields) => {
    const payload: RegisterTeacherPayload = {
      ...data,
      middleName: data.middleName || undefined,
      photoUrl: data.photoUrl || undefined,
      bloodGroup: data.bloodGroup || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      province: data.province || undefined,
      district: data.district || undefined,
      municipality: data.municipality || undefined,
      ward: data.ward || undefined,
      basicSalary: data.basicSalary === '' || data.basicSalary === undefined ? undefined : Number(data.basicSalary),
      qualifications: data.qualifications.map((q) => ({ ...q, fieldOfStudy: q.fieldOfStudy || undefined })),
      emergencyContacts: data.emergencyContacts,
      documents: data.documents,
    };

    try {
      const teacher = await registerTeacher.mutateAsync(payload);
      toast({ title: 'Teacher Registered', description: `Employee ID ${teacher.employeeId}`, variant: 'success' });
      navigate(`/dashboard/teachers/${teacher.id}`);
    } catch (err) {
      toast({ title: 'Registration Failed', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Faculty Registration</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Register a new teacher and set up their HR profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employment</CardTitle>
          <CardDescription>Department, designation, and employment terms.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Department"
            error={errors.departmentId?.message}
            options={[{ value: '', label: 'Select department' }, ...(departments ?? []).map((d) => ({ value: d.id, label: d.name }))]}
            {...register('departmentId')}
          />
          <Select
            label="Designation"
            error={errors.designationId?.message}
            options={[{ value: '', label: 'Select designation' }, ...(designations ?? []).map((d) => ({ value: d.id, label: d.name }))]}
            {...register('designationId')}
          />
          <Select
            label="Employment Type"
            error={errors.employmentType?.message}
            options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: t.replace('_', ' ') }))}
            {...register('employmentType')}
          />
          <Input label="Joining Date" type="date" error={errors.joiningDate?.message} {...register('joiningDate')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <ImageUpload label="Teacher Photo" value={photoUrl} onUpload={handlePhotoUpload} />
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
          <Input label="Blood Group" {...register('bloodGroup')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact & Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {canSetSalary && (
        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
            <CardDescription>Only visible to roles with salary access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input label="Basic Salary" type="number" step="0.01" {...register('basicSalary')} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Qualifications</CardTitle>
          <CardDescription>Academic degrees and certifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qualificationFields.fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border/60 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Qualification {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => qualificationFields.remove(index)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                  label="Degree"
                  error={errors.qualifications?.[index]?.degree?.message}
                  {...register(`qualifications.${index}.degree`)}
                />
                <Input label="Field of Study" {...register(`qualifications.${index}.fieldOfStudy`)} />
                <Input
                  label="Institution"
                  error={errors.qualifications?.[index]?.institution?.message}
                  {...register(`qualifications.${index}.institution`)}
                />
                <Input
                  label="Year Completed"
                  type="number"
                  error={errors.qualifications?.[index]?.yearCompleted?.message as string | undefined}
                  {...register(`qualifications.${index}.yearCompleted`)}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => qualificationFields.append({ degree: '', fieldOfStudy: '', institution: '', yearCompleted: new Date().getFullYear() })}
          >
            Add Qualification
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>At least one emergency contact is required.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeof errors.emergencyContacts?.message === 'string' && (
            <p className="text-xs text-destructive font-medium">{errors.emergencyContacts.message}</p>
          )}
          {contactFields.fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border/60 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact {index + 1}
                </span>
                {contactFields.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => contactFields.remove(index)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Name"
                  error={errors.emergencyContacts?.[index]?.name?.message}
                  {...register(`emergencyContacts.${index}.name`)}
                />
                <Input
                  label="Relation"
                  error={errors.emergencyContacts?.[index]?.relation?.message}
                  {...register(`emergencyContacts.${index}.relation`)}
                />
                <Input
                  label="Phone"
                  error={errors.emergencyContacts?.[index]?.phone?.message}
                  {...register(`emergencyContacts.${index}.phone`)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" className="h-4 w-4" {...register(`emergencyContacts.${index}.isPrimary`)} />
                Primary Contact
              </label>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => contactFields.append({ name: '', relation: '', phone: '', isPrimary: false })}
          >
            Add Contact
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Upload HR documents (images or PDF, 5MB max).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:w-64">
              <Select
                label="Document Type"
                value={newDocumentType}
                onChange={(e) => setNewDocumentType(e.target.value as (typeof DOCUMENT_TYPES)[number])}
                options={DOCUMENT_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') }))}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              isLoading={uploadDocumentFile.isPending}
              onClick={() => documentInputRef.current?.click()}
            >
              Upload Document
            </Button>
            <input
              ref={documentInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAddDocument(file);
                e.target.value = '';
              }}
            />
          </div>
          {documents.length > 0 && (
            <ul className="space-y-2">
              {documents.map((doc, index) => (
                <li
                  key={`${doc.fileUrl}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-xs font-medium">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {doc.documentType.replace(/_/g, ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => documentFields.remove(index)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting} className="min-w-48">
          Register Teacher
        </Button>
      </div>
    </form>
  );
}
