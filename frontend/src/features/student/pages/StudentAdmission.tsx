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
import { useAcademicYears } from '@/features/school/hooks/useAcademicYears';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useSections } from '@/features/academic-structure/hooks/useSections';
import { useAdmitStudent, useUploadStudentPhoto, useUploadStudentDocumentFile } from '@/features/student/hooks/useStudentMutations';
import type { AdmitStudentPayload } from '@/features/student/types';

const GUARDIAN_RELATIONS = ['FATHER', 'MOTHER', 'GUARDIAN'] as const;
const DOCUMENT_TYPES = [
  'BIRTH_CERTIFICATE',
  'TRANSFER_CERTIFICATE',
  'CHARACTER_CERTIFICATE',
  'PHOTO',
  'OTHER',
] as const;

const optionalString = z.string().optional();
const optionalRoll = z.union([z.coerce.number().int().positive(), z.literal('')]).optional();

const guardianSchema = z.object({
  relation: z.enum(GUARDIAN_RELATIONS),
  fullName: z.string().min(1, 'Guardian name is required'),
  phone: z.string().min(1, 'Guardian phone is required'),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  occupation: optionalString,
  address: optionalString,
});

const documentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES),
  fileUrl: z.string().url(),
});

const admissionSchema = z
  .object({
    academicYearId: z.string().uuid('Select an academic year'),
    classId: z.string().uuid('Select a class'),
    sectionId: z.string().uuid('Select a section'),
    rollNumber: optionalRoll,

    firstName: z.string().min(1, 'First name is required'),
    middleName: optionalString,
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    photoUrl: optionalString,

    address: optionalString,
    province: optionalString,
    district: optionalString,
    municipality: optionalString,
    ward: optionalString,
    temporaryAddress: optionalString,
    temporaryProvince: optionalString,
    temporaryDistrict: optionalString,
    temporaryMunicipality: optionalString,
    temporaryWard: optionalString,

    bloodGroup: optionalString,
    allergies: optionalString,
    medicalConditions: optionalString,
    emergencyContactName: optionalString,
    emergencyContactPhone: optionalString,

    previousSchoolName: optionalString,
    previousSchoolBoard: optionalString,
    lastClassCompleted: optionalString,
    transferCertificateNumber: optionalString,

    feeCategory: optionalString,

    guardians: z.array(guardianSchema).min(1, 'At least one guardian is required'),
    documents: z.array(documentSchema),
  })
  .refine(
    (data) => new Set(data.guardians.map((g) => g.relation)).size === data.guardians.length,
    { message: 'Each guardian relation can only be added once', path: ['guardians'] }
  );

type AdmissionFormInput = z.input<typeof admissionSchema>;
type AdmissionFields = z.output<typeof admissionSchema>;

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

export default function StudentAdmission() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const admitStudent = useAdmitStudent();
  const uploadPhoto = useUploadStudentPhoto();
  const uploadDocumentFile = useUploadStudentDocumentFile();

  const { data: years } = useAcademicYears();

  const [newDocumentType, setNewDocumentType] = useState<(typeof DOCUMENT_TYPES)[number]>('BIRTH_CERTIFICATE');
  const documentInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdmissionFormInput, unknown, AdmissionFields>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      academicYearId: '',
      classId: '',
      sectionId: '',
      rollNumber: '',
      gender: 'MALE',
      guardians: [{ relation: 'FATHER', fullName: '', phone: '', email: '', occupation: '', address: '' }],
      documents: [],
    },
  });

  const academicYearId = watch('academicYearId');
  const classId = watch('classId');
  const photoUrl = watch('photoUrl');
  const documents = watch('documents');

  const { data: classes } = useClasses(academicYearId);
  const { data: sections } = useSections(classId);

  const guardianFields = useFieldArray({ control, name: 'guardians' });
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

  const onSubmit = async (data: AdmissionFields) => {
    const payload: AdmitStudentPayload = {
      ...data,
      middleName: data.middleName || undefined,
      photoUrl: data.photoUrl || undefined,
      rollNumber: data.rollNumber === '' ? undefined : Number(data.rollNumber),
      address: data.address || undefined,
      province: data.province || undefined,
      district: data.district || undefined,
      municipality: data.municipality || undefined,
      ward: data.ward || undefined,
      temporaryAddress: data.temporaryAddress || undefined,
      temporaryProvince: data.temporaryProvince || undefined,
      temporaryDistrict: data.temporaryDistrict || undefined,
      temporaryMunicipality: data.temporaryMunicipality || undefined,
      temporaryWard: data.temporaryWard || undefined,
      bloodGroup: data.bloodGroup || undefined,
      allergies: data.allergies || undefined,
      medicalConditions: data.medicalConditions || undefined,
      emergencyContactName: data.emergencyContactName || undefined,
      emergencyContactPhone: data.emergencyContactPhone || undefined,
      previousSchoolName: data.previousSchoolName || undefined,
      previousSchoolBoard: data.previousSchoolBoard || undefined,
      lastClassCompleted: data.lastClassCompleted || undefined,
      transferCertificateNumber: data.transferCertificateNumber || undefined,
      feeCategory: data.feeCategory || undefined,
      guardians: data.guardians.map((g) => ({
        ...g,
        email: g.email || undefined,
        occupation: g.occupation || undefined,
        address: g.address || undefined,
      })),
    };

    try {
      const student = await admitStudent.mutateAsync(payload);
      toast({ title: 'Student Admitted', description: `Admission number ${student.admissionNumber}`, variant: 'success' });
      navigate(`/dashboard/students/${student.id}`);
    } catch (err) {
      toast({ title: 'Admission Failed', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Admissions Panel</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Admit a new applicant and allocate an academic placement.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Placement</CardTitle>
          <CardDescription>Where this student will be enrolled.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Academic Year"
            error={errors.academicYearId?.message}
            options={[{ value: '', label: 'Select year' }, ...(years ?? []).map((y) => ({ value: y.id, label: y.label }))]}
            {...register('academicYearId')}
          />
          <Select
            label="Class"
            error={errors.classId?.message}
            disabled={!academicYearId}
            options={[{ value: '', label: 'Select class' }, ...(classes ?? []).map((c) => ({ value: c.id, label: c.name }))]}
            {...register('classId')}
          />
          <Select
            label="Section"
            error={errors.sectionId?.message}
            disabled={!classId}
            options={[{ value: '', label: 'Select section' }, ...(sections ?? []).map((s) => ({ value: s.id, label: s.name }))]}
            {...register('sectionId')}
          />
          <Input label="Roll Number" type="number" error={errors.rollNumber?.message as string | undefined} {...register('rollNumber')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <ImageUpload label="Student Photo" value={photoUrl} onUpload={handlePhotoUpload} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Middle Name" error={errors.middleName?.message} {...register('middleName')} />
            <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
            <Select
              label="Gender"
              error={errors.gender?.message}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
              {...register('gender')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permanent Address</p>
          <Textarea label="Address" {...register('address')} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input label="Province" {...register('province')} />
            <Input label="District" {...register('district')} />
            <Input label="Municipality" {...register('municipality')} />
            <Input label="Ward" {...register('ward')} />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Temporary Address</p>
          <Textarea label="Address" {...register('temporaryAddress')} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input label="Province" {...register('temporaryProvince')} />
            <Input label="District" {...register('temporaryDistrict')} />
            <Input label="Municipality" {...register('temporaryMunicipality')} />
            <Input label="Ward" {...register('temporaryWard')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Blood Group" {...register('bloodGroup')} />
          <Input label="Allergies" {...register('allergies')} />
          <Textarea label="Medical Conditions" className="sm:col-span-2" {...register('medicalConditions')} />
          <Input label="Emergency Contact Name" {...register('emergencyContactName')} />
          <Input label="Emergency Contact Phone" {...register('emergencyContactPhone')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous School</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Previous School Name" {...register('previousSchoolName')} />
          <Input label="Previous School Board" {...register('previousSchoolBoard')} />
          <Input label="Last Class Completed" {...register('lastClassCompleted')} />
          <Input label="Transfer Certificate Number" {...register('transferCertificateNumber')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Input label="Fee Category" placeholder="e.g. Regular" {...register('feeCategory')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Guardians</CardTitle>
            <CardDescription>At least one guardian is required.</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() =>
              guardianFields.append({ relation: 'GUARDIAN', fullName: '', phone: '', email: '', occupation: '', address: '' })
            }
          >
            Add Guardian
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeof errors.guardians?.message === 'string' && (
            <p className="text-xs text-destructive font-medium">{errors.guardians.message}</p>
          )}
          {guardianFields.fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border/60 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Guardian {index + 1}
                </span>
                {guardianFields.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => guardianFields.remove(index)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Relation"
                  options={GUARDIAN_RELATIONS.map((r) => ({ value: r, label: r.charAt(0) + r.slice(1).toLowerCase() }))}
                  {...register(`guardians.${index}.relation`)}
                />
                <Input
                  label="Full Name"
                  error={errors.guardians?.[index]?.fullName?.message}
                  {...register(`guardians.${index}.fullName`)}
                />
                <Input
                  label="Phone"
                  error={errors.guardians?.[index]?.phone?.message}
                  {...register(`guardians.${index}.phone`)}
                />
                <Input
                  label="Email"
                  error={errors.guardians?.[index]?.email?.message}
                  {...register(`guardians.${index}.email`)}
                />
                <Input label="Occupation" {...register(`guardians.${index}.occupation`)} />
                <Input label="Address" {...register(`guardians.${index}.address`)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Upload supporting documents (images or PDF, 5MB max).</CardDescription>
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
          Submit Admission
        </Button>
      </div>
    </form>
  );
}
