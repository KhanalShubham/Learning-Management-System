import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Permission } from '../types';

/**
 * Properties contract for the ProtectedRoute guard.
 */
export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Intercepts routing access, granting entrance only to authenticated
 * users who satisfy optional role or permission boundaries.
 */
export const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredPermission,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role matches allowed roles if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has required permissions if specified
  if (requiredPermission) {
    const hasPerm =
      user.permissions.includes(requiredPermission as Permission) || user.permissions.includes('*');
    if (!hasPerm) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
export default ProtectedRoute;
