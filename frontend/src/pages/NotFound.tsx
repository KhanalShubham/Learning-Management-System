import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <GraduationCap className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        The page you are looking for does not exist or has been moved. Please verify the URL.
      </p>
      <button
        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
      >
        {isAuthenticated ? 'Go back to Dashboard' : 'Go back to Homepage'}
      </button>
    </div>
  );
}
