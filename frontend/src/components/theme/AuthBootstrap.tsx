import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider animate-pulse">
            Bootstrapping Session...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
export default AuthBootstrap;
