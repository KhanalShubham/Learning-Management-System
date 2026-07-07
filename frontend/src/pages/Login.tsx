import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { type AxiosError } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    try {
      await login(data.email, data.password, data.rememberMe);
      toast({
        title: 'Sign In Successful',
        description: 'Welcome back to Deukhuri Digital Campus.',
        variant: 'success',
      });
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: 'Sign In Failed',
        description: error.response?.data?.message || 'Invalid credentials or API setup error',
        variant: 'destructive',
      });
    }
  };

  const autofill = (email: string, password: string, role: 'super admin' | 'admin') => {
    setValue('email', email);
    setValue('password', password);
    toast({
      title: 'Credentials Prefilled',
      description: `Loaded account details for the ${role.toUpperCase()} demo profile`,
      variant: 'info',
    });
  };

  return (
    <Card className="border-border/60 shadow-xl bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Portal Access Sign In</CardTitle>
        <CardDescription>Enter details or click demo profiles below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sign In Form */}
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

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
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
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                {...register('rememberMe')}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-2 select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <span className="relative px-3 text-[10px] text-muted-foreground bg-card font-bold uppercase tracking-widest">
            Demo Profiles
          </span>
        </div>

        {/* Demo profiles shortcuts */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <button
            onClick={() => autofill('superadmin@deukhuri.edu.np', 'SuperAdmin@123', 'super admin')}
            className="p-2 bg-secondary/60 hover:bg-primary/10 border border-border/60 hover:border-primary/30 rounded-lg font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 text-foreground/80 hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            Super Admin
          </button>
          <button
            onClick={() => autofill('admin@deukhuri.edu', 'Admin@123', 'admin')}
            className="p-2 bg-secondary/60 hover:bg-primary/10 border border-border/60 hover:border-primary/30 rounded-lg font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 text-foreground/80 hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            Admin
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
