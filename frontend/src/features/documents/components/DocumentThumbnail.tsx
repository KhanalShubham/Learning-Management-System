import { useEffect, useState } from 'react';
import { FileWarning, Loader2 } from 'lucide-react';
import { documentService } from '../services/document.service';
import type { DocumentTemplate } from '../types';

const SAMPLE_VARIABLES: Record<string, string> = {
  'student.fullName': 'Ram Bahadur Thapa',
  'student.admissionNumber': 'REG-2083-4819',
  'student.rollNumber': '12',
  'student.class': 'Class 10',
  'student.section': 'Section A',
  'student.guardianName': 'Hari Bahadur Thapa',
  'academicYear.label': '2082/2083',
};

const buildDummyVariables = (template: DocumentTemplate): Record<string, string> => {
  const dummy: Record<string, string> = { ...SAMPLE_VARIABLES };
  (template.variables || []).forEach((v) => {
    dummy[v.name] = v.defaultValue || `[${v.label}]`;
  });
  return dummy;
};

/** Renders a live, scaled-down preview of a template's actual design — a "mini certificate" thumbnail. */
export function TemplateThumbnail({ template, className = '' }: { template: DocumentTemplate; className?: string }) {
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    documentService
      .getPreviewHtml(template.htmlTemplate, template.cssTemplate, buildDummyVariables(template))
      .then((content) => {
        if (!cancelled) {
          setHtml(content);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [template.id, template.htmlTemplate, template.cssTemplate]);

  const isLandscape = template.orientation === 'LANDSCAPE';

  return (
    <div className={`relative w-full h-full overflow-hidden bg-white ${className}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/40">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-secondary/40 text-muted-foreground">
          <FileWarning className="h-6 w-6 opacity-50" />
          <span className="text-[10px] font-medium">Preview unavailable</span>
        </div>
      )}
      {status === 'ready' && (
        <iframe
          srcDoc={html}
          title={`${template.name} preview`}
          tabIndex={-1}
          className="pointer-events-none absolute top-0 left-0 border-0"
          style={{
            width: isLandscape ? '297mm' : '210mm',
            height: isLandscape ? '210mm' : '297mm',
            transform: 'scale(0.34)',
            transformOrigin: 'top left',
          }}
        />
      )}
    </div>
  );
}

/** Renders a mini thumbnail of an already-generated document from its stored HTML snapshot. Cheaper than TemplateThumbnail — no API call. */
export function SnapshotThumbnail({ htmlSnapshot, landscape = false }: { htmlSnapshot: string; landscape?: boolean }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      <iframe
        srcDoc={htmlSnapshot}
        title="Document snapshot thumbnail"
        tabIndex={-1}
        className="pointer-events-none absolute top-0 left-0 border-0"
        style={{
          width: landscape ? '297mm' : '210mm',
          height: landscape ? '210mm' : '297mm',
          transform: 'scale(0.22)',
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}
