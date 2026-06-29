import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Properties contract for the PublicRoute guard.
 */
export interface PublicRouteProps {
  children?: React.ReactNode;
}

/**
 * PublicRoute Component
 * 
 * Intercepts routing access, redirecting logged-in users away from guest pages
 * (like `/login`) back to the dashboard or home screen.
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
export default PublicRoute;
