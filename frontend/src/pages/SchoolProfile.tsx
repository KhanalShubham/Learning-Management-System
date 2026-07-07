import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Landmark, Palette, Users, SlidersHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ImageUpload } from '@/components/common/ImageUpload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import {
  useSchoolProfile,
  useUpdateSchoolProfile,
  useBranding,
  useUpdateBranding,
  useUploadBrandingImage,
  useLeadership,
  useUpdateLeadership,
  useUploadLeadershipImage,
  useSchoolSettings,
  useUpdateSchoolSettings,
} from '@/features/school/hooks/useSchool';
import type { LeadershipRole } from '@/features/school/types';

const optionalUrl = z.string().url('Must be a valid URL').optional().or(z.literal(''));
const optionalEmail = z.string().email('Invalid email address').optional().or(z.literal(''));

const errorMessage = (err: unknown, fallback: string) => {
  const error = err as AxiosError<{ message?: string }>;
  return error.response?.data?.message || fallback;
};

// ── Profile Tab ──────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  shortName: z.string().optional().or(z.literal('')),
  motto: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  email: optionalEmail,
  phone: z.string().optional().or(z.literal('')),
  website: optionalUrl,
  address: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  municipality: z.string().optional().or(z.literal('')),
  ward: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  googleMapLink: optionalUrl,
});

type ProfileFields = z.infer<typeof profileSchema>;

function ProfileTab() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useSchoolProfile();
  const updateProfile = useUpdateSchoolProfile();
  const hasHydrated = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFields>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile && !hasHydrated.current) {
      hasHydrated.current = true;
      reset({
        name: profile.name,
        shortName: profile.shortName ?? '',
        motto: profile.motto ?? '',
        description: profile.description ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        website: profile.website ?? '',
        address: profile.address ?? '',
        province: profile.province ?? '',
        district: profile.district ?? '',
        municipality: profile.municipality ?? '',
        ward: profile.ward ?? '',
        postalCode: profile.postalCode ?? '',
        googleMapLink: profile.googleMapLink ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFields) => {
    try {
      await updateProfile.mutateAsync(data);
      toast({ title: 'School Profile Updated', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could Not Save Changes',
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">School Identity</CardTitle>
          <CardDescription>Core contact and location information for the school.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="School Name" error={errors.name?.message} {...register('name')} />
            <Input label="Short Name" error={errors.shortName?.message} {...register('shortName')} />
            <Input label="Motto" error={errors.motto?.message} {...register('motto')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
            <Input label="Website" error={errors.website?.message} {...register('website')} />
          </div>

          <Textarea label="Description" error={errors.description?.message} {...register('description')} />
          <Textarea label="Address" error={errors.address?.message} {...register('address')} />

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Location Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input placeholder="Province" error={errors.province?.message} {...register('province')} />
              <Input placeholder="District" error={errors.district?.message} {...register('district')} />
              <Input placeholder="Municipality" error={errors.municipality?.message} {...register('municipality')} />
              <Input placeholder="Ward" error={errors.ward?.message} {...register('ward')} />
              <Input placeholder="Postal Code" error={errors.postalCode?.message} {...register('postalCode')} />
              <Input placeholder="Google Maps Link" error={errors.googleMapLink?.message} {...register('googleMapLink')} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// ── Branding Tab ─────────────────────────────────────────────────────────

const brandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color')
    .optional()
    .or(z.literal('')),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color')
    .optional()
    .or(z.literal('')),
});

type BrandingFields = z.infer<typeof brandingSchema>;

function BrandingTab() {
  const { toast } = useToast();
  const { data: branding, isLoading } = useBranding();
  const updateBranding = useUpdateBranding();
  const uploadLogo = useUploadBrandingImage('logo');
  const uploadFavicon = useUploadBrandingImage('favicon');
  const uploadStamp = useUploadBrandingImage('stamp');
  const uploadSignature = useUploadBrandingImage('signature');
  const uploadReportHeader = useUploadBrandingImage('reportHeader');
  const uploadReportFooter = useUploadBrandingImage('reportFooter');
  const hasHydrated = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandingFields>({ resolver: zodResolver(brandingSchema) });

  useEffect(() => {
    if (branding && !hasHydrated.current) {
      hasHydrated.current = true;
      reset({
        primaryColor: branding.primaryColor ?? '',
        secondaryColor: branding.secondaryColor ?? '',
      });
    }
  }, [branding, reset]);

  const onSubmit = async (data: BrandingFields) => {
    try {
      await updateBranding.mutateAsync(data);
      toast({ title: 'Branding Updated', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could Not Save Branding',
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (
    uploader: { mutateAsync: (file: File) => Promise<unknown> },
    successMessage: string
  ) => {
    return async (file: File) => {
      try {
        await uploader.mutateAsync(file);
        toast({ title: successMessage, variant: 'success' });
      } catch (err) {
        toast({
          title: 'Upload Failed',
          description: errorMessage(err, 'Could not upload image.'),
          variant: 'destructive',
        });
      }
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Branding & Documents</CardTitle>
        <CardDescription>Visual identity used across the ERP and generated documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-6">
          <ImageUpload
            label="School Logo"
            value={branding?.logoUrl}
            onUpload={handleImageUpload(uploadLogo, 'Logo Updated')}
          />
          <ImageUpload
            label="Favicon"
            value={branding?.faviconUrl}
            onUpload={handleImageUpload(uploadFavicon, 'Favicon Updated')}
          />
          <ImageUpload
            label="School Stamp"
            value={branding?.stampUrl}
            onUpload={handleImageUpload(uploadStamp, 'Stamp Updated')}
          />
          <ImageUpload
            label="Principal Signature"
            value={branding?.principalSignatureUrl}
            onUpload={handleImageUpload(uploadSignature, 'Signature Updated')}
          />
          <ImageUpload
            label="Report Header"
            value={branding?.reportHeaderImageUrl}
            onUpload={handleImageUpload(uploadReportHeader, 'Report Header Updated')}
          />
          <ImageUpload
            label="Report Footer"
            value={branding?.reportFooterImageUrl}
            onUpload={handleImageUpload(uploadReportFooter, 'Report Footer Updated')}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Color"
              placeholder="#3B82F6"
              error={errors.primaryColor?.message}
              {...register('primaryColor')}
            />
            <Input
              label="Secondary Color"
              placeholder="#10B981"
              error={errors.secondaryColor?.message}
              {...register('secondaryColor')}
            />
          </div>
          <Button type="submit" isLoading={isSubmitting}>
            Save Colors
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Leadership Tab ───────────────────────────────────────────────────────

const LEADERSHIP_ROLES: { role: LeadershipRole; label: string }[] = [
  { role: 'PRINCIPAL', label: 'Principal' },
  { role: 'VICE_PRINCIPAL', label: 'Vice Principal' },
  { role: 'ADMINISTRATOR', label: 'Administrator' },
  { role: 'ACCOUNT_OFFICER', label: 'Account Officer' },
];

const leadershipEntrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().optional().or(z.literal('')),
});

type LeadershipEntryFields = z.infer<typeof leadershipEntrySchema>;

function LeadershipEntryRow({ role, label }: { role: LeadershipRole; label: string }) {
  const { toast } = useToast();
  const { data: entries } = useLeadership();
  const entry = entries?.find((e) => e.role === role);
  const updateLeadership = useUpdateLeadership();
  const uploadPhoto = useUploadLeadershipImage('photo');
  const uploadSignature = useUploadLeadershipImage('signature');
  const hasHydrated = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadershipEntryFields>({ resolver: zodResolver(leadershipEntrySchema) });

  useEffect(() => {
    if (entry && !hasHydrated.current) {
      hasHydrated.current = true;
      reset({ name: entry.name, designation: entry.designation ?? '' });
    }
  }, [entry, reset]);

  const onSubmit = async (data: LeadershipEntryFields) => {
    try {
      await updateLeadership.mutateAsync({ role, payload: data });
      toast({ title: `${label} Updated`, variant: 'success' });
    } catch (err) {
      toast({
        title: `Could Not Update ${label}`,
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (
    uploader: { mutateAsync: (args: { role: LeadershipRole; file: File }) => Promise<unknown> },
    successMessage: string
  ) => {
    return async (file: File) => {
      try {
        await uploader.mutateAsync({ role, file });
        toast({ title: successMessage, variant: 'success' });
      } catch (err) {
        toast({
          title: 'Upload Failed',
          description: errorMessage(err, 'Could not upload image.'),
          variant: 'destructive',
        });
      }
    };
  };

  return (
    <div className="border border-border/60 rounded-xl p-4 space-y-4">
      <h4 className="text-sm font-bold text-foreground">{label}</h4>
      <div className="flex flex-wrap gap-6">
        <ImageUpload
          label="Photo"
          shape="circle"
          value={entry?.photoUrl}
          onUpload={handleImageUpload(uploadPhoto, `${label} Photo Updated`)}
        />
        <ImageUpload
          label="Signature"
          value={entry?.signatureUrl}
          onUpload={handleImageUpload(uploadSignature, `${label} Signature Updated`)}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Designation" error={errors.designation?.message} {...register('designation')} />
        </div>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Save {label}
        </Button>
      </form>
    </div>
  );
}

function LeadershipTab() {
  const { isLoading } = useLeadership();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leadership Directory</CardTitle>
        <CardDescription>Names, designations, photos, and signatures for key staff.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {LEADERSHIP_ROLES.map(({ role, label }) => (
          <LeadershipEntryRow key={role} role={role} label={label} />
        ))}
      </CardContent>
    </Card>
  );
}

// ── Settings Tab ─────────────────────────────────────────────────────────

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (NPT)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'UTC', label: 'UTC' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'Nepali' },
];

const CURRENCY_OPTIONS = [
  { value: 'NPR', label: 'NPR - Nepalese Rupee' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
];

const ATTENDANCE_METHOD_OPTIONS = [
  { value: 'ADMIN_ONLY', label: 'Admin Only' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'BIOMETRIC', label: 'Biometric' },
];

const settingsSchema = z.object({
  timezone: z.string(),
  language: z.string(),
  currency: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  weekStartsOn: z.coerce.number().int().min(0).max(6),
  defaultPassword: z.string().min(6, 'Default password must be at least 6 characters'),
  attendanceMethod: z.enum(['ADMIN_ONLY', 'TEACHER', 'BIOMETRIC']),
});

type SettingsFields = z.infer<typeof settingsSchema>;

function SettingsTab() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSchoolSettings();
  const updateSettings = useUpdateSchoolSettings();
  const hasHydrated = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFields>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (settings && !hasHydrated.current) {
      hasHydrated.current = true;
      reset({
        timezone: settings.timezone,
        language: settings.language,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        weekStartsOn: settings.weekStartsOn,
        defaultPassword: settings.defaultPassword,
        attendanceMethod: settings.attendanceMethod,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFields) => {
    try {
      await updateSettings.mutateAsync(data);
      toast({ title: 'Settings Updated', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could Not Save Settings',
        description: errorMessage(err, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regional & Operational Settings</CardTitle>
          <CardDescription>Defaults used across the ERP and generated documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Timezone" options={TIMEZONE_OPTIONS} {...register('timezone')} />
            <Select label="Language" options={LANGUAGE_OPTIONS} {...register('language')} />
            <Select label="Currency" options={CURRENCY_OPTIONS} {...register('currency')} />
            <Select label="Date Format" options={DATE_FORMAT_OPTIONS} {...register('dateFormat')} />
            <Input label="Time Format" error={errors.timeFormat?.message} {...register('timeFormat')} />
            <Select
              label="Week Starts On"
              options={[
                { value: '0', label: 'Sunday' },
                { value: '1', label: 'Monday' },
              ]}
              {...register('weekStartsOn')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Password"
              helperText="Assigned to newly admitted students/staff by default."
              error={errors.defaultPassword?.message}
              {...register('defaultPassword')}
            />
            <Select
              label="Attendance Method"
              options={ATTENDANCE_METHOD_OPTIONS}
              {...register('attendanceMethod')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" isLoading={isSubmitting}>
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function SchoolProfile() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">School Profile</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Identity, branding, and settings shared across every module and generated document.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <Landmark className="h-3.5 w-3.5 mr-1.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-3.5 w-3.5 mr-1.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="leadership">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Leadership
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="branding">
          <BrandingTab />
        </TabsContent>
        <TabsContent value="leadership">
          <LeadershipTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
