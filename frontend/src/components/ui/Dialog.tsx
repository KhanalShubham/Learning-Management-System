import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: 'default' | 'danger' | 'success' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  type = 'default',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
}: DialogProps) => {
  const iconMap = {
    default: { icon: Info, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    success: { icon: CheckCircle, color: 'text-success bg-success/10' },
    warning: { icon: AlertTriangle, color: 'text-warning bg-warning/10' },
    danger: { icon: AlertTriangle, color: 'text-destructive bg-destructive/10' },
  };

  const IconConfig = iconMap[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex gap-4 p-1">
        <div className={cn('p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0', IconConfig.color)}>
          <IconConfig.icon className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-base font-bold text-foreground leading-tight">{title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/40">
        <Button variant="ghost" onClick={onClose} disabled={isLoading} size="sm">
          {cancelText}
        </Button>
        <Button
          variant={type === 'danger' ? 'destructive' : type === 'success' ? 'success' : 'default'}
          onClick={onConfirm}
          isLoading={isLoading}
          size="sm"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
