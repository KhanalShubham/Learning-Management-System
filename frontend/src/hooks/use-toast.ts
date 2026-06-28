import { useUIStore, type ToastItem } from '@/store';

export const useToast = () => {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);
  const toasts = useUIStore((state) => state.toasts);

  const toast = (options: Omit<ToastItem, 'id'>) => {
    addToast(options);
  };

  return {
    toast,
    toasts,
    dismiss: removeToast,
  };
};
