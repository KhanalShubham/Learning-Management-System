import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const { setSession, clearSession, isInitialLoading } = useAuthStore();

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        // Send a POST request to refresh token (will pass refresh token cookie automatically)
        const response = await api.post('/auth/refresh', {}, { withCredentials: true });
        const { success, data } = response.data;
        if (success && data) {
          const { user, accessToken } = data;
          setSession(user, accessToken);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      }
    };

    bootstrapSession();
  }, [setSession, clearSession]);

  if (isInitialLoading) {
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
