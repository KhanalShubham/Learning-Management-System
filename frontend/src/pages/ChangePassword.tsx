import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFields = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFields>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFields) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
        variant: 'success',
      });
      reset();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Could Not Change Password',
        description: error.response?.data?.message || 'Please check your current password and try again.',
        variant: 'destructive',
      });
    }
  };

  const eyeToggle = showPasswords ? (
    <EyeOff className="h-4 w-4" onClick={() => setShowPasswords(false)} />
  ) : (
    <Eye className="h-4 w-4" onClick={() => setShowPasswords(true)} />
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Change Password</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Update the password used to sign in to your account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Update Credentials
          </CardTitle>
          <CardDescription>You&apos;ll stay signed in on this device after changing your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="currentPassword"
              type={showPasswords ? 'text' : 'password'}
              label="Current Password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={eyeToggle}
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              id="newPassword"
              type={showPasswords ? 'text' : 'password'}
              label="New Password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              id="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              label="Confirm New Password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" isLoading={isSubmitting}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
