import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import type { AuthContextType } from '../types';

/**
 * Custom React Hook to access the Authentication Context state.
 * 
 * Must be executed within an `<AuthProvider>` ancestor component.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an AuthProvider context parent tree.');
  }
  return context;
};
export default useAuth;
