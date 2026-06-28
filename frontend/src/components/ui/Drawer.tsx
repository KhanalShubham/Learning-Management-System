import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  size = 'md',
}: DrawerProps) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Layout configs
  const directionStyles = {
    right: 'right-0 top-0 bottom-0 h-full border-l',
    left: 'left-0 top-0 bottom-0 h-full border-r',
    top: 'top-0 left-0 right-0 w-full border-b',
    bottom: 'bottom-0 left-0 right-0 w-full border-t',
  };

  const sizeStyles = {
    right: {
      sm: 'w-80 max-w-full',
      md: 'w-[450px] max-w-full',
      lg: 'w-[640px] max-w-full',
      full: 'w-screen',
    },
    left: {
      sm: 'w-80 max-w-full',
      md: 'w-[450px] max-w-full',
      lg: 'w-[640px] max-w-full',
      full: 'w-screen',
    },
    top: {
      sm: 'h-64 max-h-full',
      md: 'h-[400px] max-h-full',
      lg: 'h-[600px] max-h-full',
      full: 'h-screen',
    },
    bottom: {
      sm: 'h-64 max-h-full',
      md: 'h-[400px] max-h-full',
      lg: 'h-[600px] max-h-full',
      full: 'h-screen',
    },
  };

  // Motion transitions
  const transitionConfig = { type: 'spring', damping: 26, stiffness: 220 } as const;

  const motionVariants = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            variants={motionVariants[side]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionConfig}
            className={cn(
              'fixed bg-card p-6 shadow-2xl flex flex-col border-border/80 outline-none',
              directionStyles[side],
              sizeStyles[side][size]
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4 shrink-0">
              {title && <div className="text-base font-bold text-foreground">{title}</div>}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto min-h-0 text-sm">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
