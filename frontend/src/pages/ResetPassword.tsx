import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldAlert } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <Card className="border-border/60 shadow-xl bg-card">
        <CardContent className="text-center space-y-4 pt-6">
          <div className="h-14 w-14 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">Invalid Reset Link</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              This password reset link is missing its token. Please request a new one.
            </p>
          </div>
          <Link to="/forgot-password" className="inline-block pt-2">
            <Button size="sm">Request New Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: ResetPasswordFields) => {
    try {
      await authService.resetPassword(token, data.password);
      toast({
        title: 'Password Reset',
        description: 'Your password has been reset. Please sign in with your new password.',
        variant: 'success',
      });
      navigate('/login');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Reset Failed',
        description: error.response?.data?.message || 'This reset link is invalid or has expired.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-border/60 shadow-xl bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              showPassword ? (
                <EyeOff className="h-4 w-4" onClick={() => setShowPassword(false)} />
              ) : (
                <Eye className="h-4 w-4" onClick={() => setShowPassword(true)} />
              )
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            label="Confirm New Password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            Reset Password
          </Button>
        </form>
        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </CardContent>
    </Card>
  );
}
