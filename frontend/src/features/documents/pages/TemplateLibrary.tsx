import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Copy,
  Edit,
  Sparkles,
  Layout,
  Star,
  RectangleHorizontal,
  RectangleVertical,
  FileText,
  Printer,
  Eye,
  Check,
  Wand2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { documentService } from '../services/document.service';
import type { DocumentTemplate } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TemplateThumbnail } from '../components/DocumentThumbnail';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';
import { getCategoryMeta, getUseCases } from '../constants/categories';

export const TemplateLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Duplication Modal state
  const [dupTemplate, setDupTemplate] = useState<DocumentTemplate | null>(null);
  const [dupName, setDupName] = useState('');
  const [dupSlug, setDupSlug] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Big preview modal
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [bigPreviewHtml, setBigPreviewHtml] = useState('');
  const [bigPreviewLoading, setBigPreviewLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!previewTemplate) {
      setBigPreviewHtml('');
      return;
    }
    let cancelled = false;
    setBigPreviewLoading(true);
    const dummy: Record<string, string> = {
      'student.fullName': 'Ram Bahadur Thapa',
      'student.admissionNumber': 'REG-2083-4819',
      'student.rollNumber': '12',
      'student.class': 'Class 10',
      'student.section': 'Section A',
      'student.guardianName': 'Hari Bahadur Thapa',
      'academicYear.label': '2082/2083',
    };
    previewTemplate.variables?.forEach((v) => {
      dummy[v.name] = v.defaultValue || `[${v.label}]`;
    });
    documentService
      .getPreviewHtml(previewTemplate.htmlTemplate, previewTemplate.cssTemplate, dummy)
      .then((html) => {
        if (!cancelled) setBigPreviewHtml(html);
      })
      .finally(() => {
        if (!cancelled) setBigPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [previewTemplate]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.listTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: 'Error loading templates',
        description: 'Failed to retrieve active document templates.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateClick = (template: DocumentTemplate) => {
    setDupTemplate(template);
    setDupName(`${template.name} (Copy)`);
    setDupSlug(`${template.slug}-copy`);
  };

  const submitDuplication = async () => {
    if (!dupTemplate) return;
    if (!dupName || !dupSlug) {
      toast({ title: 'Validation error', description: 'Name and slug are required.', variant: 'warning' });
      return;
    }

    setIsDuplicating(true);
    try {
      await documentService.duplicateTemplate(dupTemplate.id, dupName, dupSlug);
      toast({ title: 'Template duplicated', description: `Successfully created template copy: ${dupName}` });
      setDupTemplate(null);
      loadTemplates();
    } catch (error: any) {
      toast({
        title: 'Duplication failed',
        description: error.response?.data?.message || 'Unique slug conflict or template copy error.',
        variant: 'destructive',
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const categoriesPresent = useMemo(
    () => Array.from(new Set(templates.map((t) => t.category))),
    [templates]
  );

  const filteredTemplates = useMemo(
    () => (activeCategory === 'ALL' ? templates : templates.filter((t) => t.category === activeCategory)),
    [templates, activeCategory]
  );

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, DocumentTemplate[]> = {};
    filteredTemplates.forEach((t) => {
      groups[t.category] = groups[t.category] || [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filteredTemplates]);

  const featuredTemplate = useMemo(
    () => templates.find((t) => t.isDefault) || templates[0],
    [templates]
  );

  const renderCard = (template: DocumentTemplate, highlight?: 'popular' | 'recommended') => {
    const useCases = getUseCases(template);

    return (
      <motion.div
        key={template.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="flex flex-col h-full overflow-hidden group">
          {/* Thumbnail preview */}
          <div
            className="relative aspect-[4/3] bg-secondary/30 cursor-pointer overflow-hidden"
            onClick={() => setPreviewTemplate(template)}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <TemplateThumbnail template={template} />
            </motion.div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="flex items-center gap-1.5 text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Eye className="h-3.5 w-3.5" /> Preview Design
              </span>
            </div>

            {/* Top-left badges */}
            {highlight && (
              <div className="absolute top-2 left-2">
                <Badge
                  className={
                    highlight === 'popular'
                      ? 'bg-amber-500 text-white border-transparent gap-1 shadow'
                      : 'bg-emerald-500 text-white border-transparent gap-1 shadow'
                  }
                >
                  {highlight === 'popular' ? <Star className="h-3 w-3 fill-current" /> : <Sparkles className="h-3 w-3" />}
                  {highlight === 'popular' ? 'Most Popular' : 'Recommended'}
                </Badge>
              </div>
            )}

            {/* Orientation badge */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="gap-1 bg-black/60 text-white border-transparent backdrop-blur-sm">
                {template.orientation === 'LANDSCAPE' ? (
                  <RectangleHorizontal className="h-3 w-3" />
                ) : (
                  <RectangleVertical className="h-3 w-3" />
                )}
                {template.orientation === 'LANDSCAPE' ? 'Landscape' : 'Portrait'}
              </Badge>
            </div>
          </div>

          <CardContent className="flex-1 flex flex-col pt-4 pb-4 gap-3">
            <div>
              <h3 className="font-bold text-foreground text-sm leading-snug">{template.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {template.description || 'Professionally designed document layout.'}
              </p>
            </div>

            {/* Paper badges */}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="gap-1 text-[10px] font-medium">
                <FileText className="h-3 w-3" /> {template.pageSize}
              </Badge>
              <Badge variant="outline" className="gap-1 text-[10px] font-medium">
                <Printer className="h-3 w-3" /> Printable
              </Badge>
            </div>

            {/* Perfect for */}
            <div className="text-xs space-y-1 flex-1">
              <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Perfect for</p>
              <ul className="space-y-1">
                {useCases.map((use) => (
                  <li key={use} className="flex items-center gap-1.5 text-foreground/80">
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" /> {use}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40 mt-auto">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Duplicate this template"
                  onClick={() => handleDuplicateClick(template)}
                  className="h-8 gap-1 px-2 cursor-pointer text-xs text-muted-foreground"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Customize this template"
                  onClick={() => navigate(`/dashboard/documents/templates/${template.id}`)}
                  className="h-8 gap-1 px-2 cursor-pointer text-xs text-muted-foreground"
                >
                  <Edit className="h-3.5 w-3.5" /> Customize
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/dashboard/documents/generate?templateId=${template.id}`)}
                className="gap-1.5 cursor-pointer font-semibold"
              >
                <Wand2 className="h-3.5 w-3.5" /> Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Generate Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a design and generate certificates, letters, and records in a few clicks.
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/documents/generate')}
          className="gap-2 cursor-pointer font-semibold shadow-md"
        >
          <Wand2 className="h-4 w-4" /> Generate New
        </Button>
      </div>

      {/* Category pills */}
      {templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            All Templates
          </button>
          {categoriesPresent.map((cat) => {
            const meta = getCategoryMeta(cat);
            const Icon = meta.icon;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <div className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Layout className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No document designs yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Once designs are added to your school's library, they'll show up here ready to generate.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Featured / Most Used */}
          {activeCategory === 'ALL' && featuredTemplate && (
            <section>
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-3">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Most Used
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {renderCard(featuredTemplate, 'popular')}
              </div>
            </section>
          )}

          {/* Grouped sections */}
          {Object.entries(groupedByCategory).map(([category, items]) => {
            const meta = getCategoryMeta(category);
            const Icon = meta.icon;
            return (
              <section key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground leading-none">{meta.label}</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{meta.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {items.map((t) => renderCard(t, t.isDefault ? 'recommended' : undefined))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Duplicate Template Modal */}
      <Modal
        isOpen={dupTemplate !== null}
        onClose={() => setDupTemplate(null)}
        title="Duplicate Document Template"
      >
        <div className="space-y-4 py-3">
          <p className="text-xs text-muted-foreground">
            This creates a copy of <strong className="text-foreground">{dupTemplate?.name}</strong> that you can
            customize freely without affecting the original design.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">New Template Name</label>
            <Input
              type="text"
              value={dupName}
              onChange={(e) => setDupName(e.target.value)}
              placeholder="e.g. Premium Scholarship Certificate"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Unique Slug Identifier</label>
            <Input
              type="text"
              value={dupSlug}
              onChange={(e) => setDupSlug(e.target.value)}
              placeholder="e.g. premium-scholarship-certificate"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setDupTemplate(null)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={submitDuplication} disabled={isDuplicating} className="cursor-pointer">
              {isDuplicating ? 'Duplicating...' : 'Duplicate Template'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Big print-style preview modal */}
      {previewTemplate && (
        <CertificatePreviewModal
          isOpen={previewTemplate !== null}
          onClose={() => setPreviewTemplate(null)}
          title={previewTemplate.name}
          html={bigPreviewHtml}
          isLoading={bigPreviewLoading}
          orientation={previewTemplate.orientation}
          pageSize={previewTemplate.pageSize}
          primaryAction={{
            label: 'Generate Certificate',
            icon: <Wand2 className="h-4 w-4" />,
            onClick: () => navigate(`/dashboard/documents/generate?templateId=${previewTemplate.id}`),
          }}
        />
      )}
    </div>
  );
};

export default TemplateLibrary;
