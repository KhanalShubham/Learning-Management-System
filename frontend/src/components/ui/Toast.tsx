import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, type ToastItem } from '@/store';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ToastContainer = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastProps {
  toast: ToastItem;
  onClose: () => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  const iconMap = {
    default: Info,
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    destructive: AlertCircle,
  };

  const Icon = iconMap[toast.variant || 'default'];

  const variants = {
    default: 'bg-card text-foreground border-border',
    info: 'bg-info/10 text-info border-info/20 dark:border-info/30 dark:bg-info/95 dark:text-info-foreground',
    success: 'bg-success text-success-foreground border-transparent dark:bg-success dark:text-success-foreground',
    warning: 'bg-warning text-warning-foreground border-transparent dark:bg-warning dark:text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground border-transparent dark:bg-destructive dark:text-destructive-foreground',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={cn(
        'flex gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto items-start relative overflow-hidden backdrop-blur-md',
        variants[toast.variant || 'default']
      )}
    >
      <div className="flex shrink-0 pt-0.5">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 space-y-1 pr-6">
        {toast.title && <h6 className="text-xs font-bold leading-tight tracking-wide">{toast.title}</h6>}
        {toast.description && <p className="text-xs opacity-90 leading-snug">{toast.description}</p>}
      </div>
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};
