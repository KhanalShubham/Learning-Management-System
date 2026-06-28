import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useUIStore, type UserRole } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setSimulatedRole = useUIStore((state) => state.setSimulatedRole);
  
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
    // Map email to simulated role
    let role: UserRole = 'admin';
    if (data.email.includes('teacher')) {
      role = 'teacher';
    } else if (data.email.includes('student')) {
      role = 'student';
    }

    setSimulatedRole(role);
    localStorage.setItem('token', 'mock_jwt_token');
    
    toast({
      title: 'Sign In Successful',
      description: `Welcome to the Deukhuri Digital Campus ERP Dashboard as ${role.toUpperCase()}`,
      variant: 'success',
    });

    navigate('/');
  };

  const autofill = (email: string, role: UserRole) => {
    setValue('email', email);
    setValue('password', 'password123');
    toast({
      title: 'Credentials Prefilled',
      description: `Loaded account details for simulated ${role.toUpperCase()} profile`,
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
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button
            onClick={() => autofill('admin@deukhuri.edu', 'admin')}
            className="p-2 bg-secondary/60 hover:bg-primary/10 border border-border/60 hover:border-primary/30 rounded-lg font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 text-foreground/80 hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            Admin
          </button>
          <button
            onClick={() => autofill('teacher@deukhuri.edu', 'teacher')}
            className="p-2 bg-secondary/60 hover:bg-primary/10 border border-border/60 hover:border-primary/30 rounded-lg font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 text-foreground/80 hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            Teacher
          </button>
          <button
            onClick={() => autofill('student@deukhuri.edu', 'student')}
            className="p-2 bg-secondary/60 hover:bg-primary/10 border border-border/60 hover:border-primary/30 rounded-lg font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 text-foreground/80 hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            Student
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
