import { useUIStore, type SimulatedRole } from '@/store';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Resolves the role that should drive navigation/UI for the current view.
 *
 * In development builds, a developer can preview another role's navigation via
 * the Header's role-simulator control. In production builds (and whenever no
 * override is set) this always reflects the real authenticated user's role —
 * the override never changes actual permissions, only what nav renders.
 */
export const useEffectiveRole = (): SimulatedRole => {
  const { user } = useAuth();
  const devRoleOverride = useUIStore((state) => state.devRoleOverride);

  if (import.meta.env.DEV && devRoleOverride) {
    return devRoleOverride;
  }

  const role = user?.role?.toLowerCase();
  if (role === 'admin' || role === 'super_admin') {
    return role;
  }

  return 'admin';
};
