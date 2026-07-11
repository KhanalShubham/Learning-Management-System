import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MM_TO_PX = 3.7795275591;
const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.1;
const STORAGE_KEY = 'documents:preview-zoom';

type PageSize = 'A4' | 'LETTER' | 'LEGAL' | 'CUSTOM';
type Orientation = 'PORTRAIT' | 'LANDSCAPE';
type ZoomMode = 'fit-page' | 'fit-width' | 'custom';

const PAGE_DIMENSIONS_MM: Record<PageSize, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  LETTER: { w: 215.9, h: 279.4 },
  LEGAL: { w: 215.9, h: 355.6 },
  CUSTOM: { w: 210, h: 297 },
};

interface StoredZoom {
  mode: ZoomMode;
  scale: number;
}

const loadStoredZoom = (): StoredZoom | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveStoredZoom = (value: StoredZoom) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore storage failures (private mode, quota, etc.) */
  }
};

export interface PreviewAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'outline' | 'default';
}

export interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  html: string;
  isLoading?: boolean;
  orientation?: Orientation;
  pageSize?: PageSize;
  primaryAction?: PreviewAction;
  secondaryActions?: PreviewAction[];
}

export const CertificatePreviewModal = ({
  isOpen,
  onClose,
  title,
  html,
  isLoading = false,
  orientation = 'PORTRAIT',
  pageSize = 'A4',
  primaryAction,
  secondaryActions = [],
}: CertificatePreviewModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-page');
  const [scale, setScale] = useState(1);

  const pageDims = PAGE_DIMENSIONS_MM[pageSize] || PAGE_DIMENSIONS_MM.A4;
  const nativeWidthPx = (orientation === 'LANDSCAPE' ? pageDims.h : pageDims.w) * MM_TO_PX;
  const nativeHeightPx = (orientation === 'LANDSCAPE' ? pageDims.w : pageDims.h) * MM_TO_PX;
  const effectiveWidthPx = rotated ? nativeHeightPx : nativeWidthPx;
  const effectiveHeightPx = rotated ? nativeWidthPx : nativeHeightPx;

  // Lock body scroll + Escape handling
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isFullscreen) setIsFullscreen(false);
      else onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, isFullscreen, onClose]);

  // Restore last-used zoom preference on open
  useEffect(() => {
    if (!isOpen) return;
    const stored = loadStoredZoom();
    setZoomMode(stored?.mode || 'fit-page');
    setRotated(false);
    setIsFullscreen(false);
  }, [isOpen]);

  // Measure available preview area
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;
    const measure = () => setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen, isFullscreen]);

  // Recompute scale whenever fit mode, container size, or rotation changes
  useEffect(() => {
    if (zoomMode === 'custom') return;
    const padding = 64;
    const availW = Math.max(containerSize.width - padding, 50);
    const availH = Math.max(containerSize.height - padding, 50);
    const fitPage = Math.min(availW / effectiveWidthPx, availH / effectiveHeightPx);
    const fitWidth = availW / effectiveWidthPx;
    const next = zoomMode === 'fit-width' ? fitWidth : fitPage;
    setScale(Math.min(Math.max(next, MIN_SCALE), MAX_SCALE));
  }, [zoomMode, containerSize, effectiveWidthPx, effectiveHeightPx]);

  // Persist zoom preference
  useEffect(() => {
    if (!isOpen) return;
    saveStoredZoom({ mode: zoomMode, scale });
  }, [isOpen, zoomMode, scale]);

  const zoomIn = () => {
    setZoomMode('custom');
    setScale((s) => Math.min(s + ZOOM_STEP, MAX_SCALE));
  };
  const zoomOut = () => {
    setZoomMode('custom');
    setScale((s) => Math.max(s - ZOOM_STEP, MIN_SCALE));
  };
  const actualSize = () => {
    setZoomMode('custom');
    setScale(1);
  };

  const zoomPercentLabel = `${Math.round(scale * 100)}%`;

  const stageWidth = effectiveWidthPx * scale;
  const stageHeight = effectiveHeightPx * scale;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isFullscreen && onClose()}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className={
              isFullscreen
                ? 'relative z-10 w-screen h-screen flex flex-col bg-[#1E1E1E]'
                : 'relative z-10 w-[92vw] h-[92vh] max-w-[1600px] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden'
            }
          >
            {/* Header */}
            {!isFullscreen && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0">
                <div className="font-bold text-foreground text-base truncate pr-4">{title}</div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div
              className={
                isFullscreen
                  ? 'flex items-center justify-center gap-1.5 px-4 py-2.5 border-b border-white/10 shrink-0 bg-[#252525]'
                  : 'flex items-center justify-center gap-1.5 px-4 py-2 border-b border-border/60 shrink-0 bg-secondary/30'
              }
            >
              <ToolbarButton onClick={zoomOut} label="Zoom out" dark={isFullscreen}>
                <ZoomOut className="h-4 w-4" />
              </ToolbarButton>
              <span
                className={`text-xs font-semibold w-12 text-center select-none ${
                  isFullscreen ? 'text-white/80' : 'text-muted-foreground'
                }`}
              >
                {zoomPercentLabel}
              </span>
              <ToolbarButton onClick={zoomIn} label="Zoom in" dark={isFullscreen}>
                <ZoomIn className="h-4 w-4" />
              </ToolbarButton>

              <Divider dark={isFullscreen} />

              <ToolbarTextButton active={zoomMode === 'fit-page'} onClick={() => setZoomMode('fit-page')} dark={isFullscreen}>
                Fit Page
              </ToolbarTextButton>
              <ToolbarTextButton active={zoomMode === 'fit-width'} onClick={() => setZoomMode('fit-width')} dark={isFullscreen}>
                Fit Width
              </ToolbarTextButton>
              <ToolbarTextButton active={zoomMode === 'custom' && scale === 1} onClick={actualSize} dark={isFullscreen}>
                Actual Size
              </ToolbarTextButton>

              <Divider dark={isFullscreen} />

              <ToolbarButton onClick={() => setRotated((r) => !r)} label="Rotate" dark={isFullscreen}>
                <RotateCw className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setIsFullscreen((f) => !f)}
                label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                dark={isFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </ToolbarButton>
            </div>

            {/* Preview stage */}
            <div
              ref={containerRef}
              className={
                isFullscreen
                  ? 'flex-1 min-h-0 overflow-auto flex items-center justify-center bg-[#1E1E1E] p-8'
                  : 'flex-1 min-h-0 overflow-auto flex items-center justify-center bg-[#DADADA] dark:bg-[#232323] p-8'
              }
            >
              {isLoading || !html ? (
                <Loader2 className={`h-8 w-8 animate-spin ${isFullscreen ? 'text-white/60' : 'text-muted-foreground'}`} />
              ) : (
                <div
                  className="relative bg-white rounded-[2px] shadow-[0_12px_45px_rgba(0,0,0,0.35)] shrink-0"
                  style={{ width: stageWidth, height: stageHeight }}
                >
                  <iframe
                    srcDoc={html}
                    title="Certificate preview"
                    tabIndex={-1}
                    className="pointer-events-none border-0 absolute top-1/2 left-1/2"
                    style={{
                      width: nativeWidthPx,
                      height: nativeHeightPx,
                      transform: `translate(-50%, -50%) rotate(${rotated ? 90 : 0}deg) scale(${scale})`,
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            {(primaryAction || secondaryActions.length > 0) && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60 shrink-0 bg-card">
                <Button variant="outline" onClick={onClose} className="cursor-pointer">
                  Close
                </Button>
                <div className="flex gap-2">
                  {secondaryActions.map((action) => (
                    <Button
                      key={action.label}
                      variant={action.variant || 'outline'}
                      onClick={action.onClick}
                      className="gap-1.5 cursor-pointer"
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                  {primaryAction && (
                    <Button onClick={primaryAction.onClick} className="gap-1.5 cursor-pointer font-semibold">
                      {primaryAction.icon}
                      {primaryAction.label}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

const ToolbarButton = ({
  onClick,
  label,
  children,
  dark,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  dark?: boolean;
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
      dark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

const ToolbarTextButton = ({
  onClick,
  active,
  children,
  dark,
}: {
  onClick: () => void;
  active: boolean;
  children: ReactNode;
  dark?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`h-8 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
      active
        ? dark
          ? 'bg-white/15 text-white'
          : 'bg-primary/10 text-primary'
        : dark
        ? 'text-white/70 hover:bg-white/10 hover:text-white'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

const Divider = ({ dark }: { dark?: boolean }) => (
  <span className={`w-px h-5 mx-1 ${dark ? 'bg-white/15' : 'bg-border'}`} />
);

export default CertificatePreviewModal;
