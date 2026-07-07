import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch {
      // Backend intentionally always returns success to avoid leaking account existence;
      // a real failure here means the request itself couldn't be sent (network/server error).
      toast({
        title: 'Something went wrong',
        description: 'Could not send the reset link right now. Please try again shortly.',
        variant: 'destructive',
      });
    }
  };

  if (submitted) {
    return (
      <Card className="border-border/60 shadow-xl bg-card">
        <CardContent className="text-center space-y-4 pt-6">
          <div className="h-14 w-14 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
            <MailCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">Check your inbox</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              If an account exists for that email, we&apos;ve sent a link to reset your password.
              The link expires in 30 minutes.
            </p>
          </div>
          <Link to="/login" className="inline-block pt-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xl bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Forgot Password</CardTitle>
        <CardDescription>Enter your account email and we&apos;ll send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="e.g. admin@deukhuri.edu"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            Send Reset Link
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
