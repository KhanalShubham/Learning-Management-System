import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredPermission,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isInitialLoading, user } = useAuthStore();

  if (isInitialLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check roles permissions if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permissions if specified
  if (requiredPermission) {
    const hasPerm =
      user.permissions.includes(requiredPermission) || user.permissions.includes('*');
    if (!hasPerm) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
export default ProtectedRoute;
