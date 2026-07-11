import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Clock,
  Settings,
  Eye,
  Code,
  FileCode,
  Undo2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { documentService } from '../services/document.service';
import type { DocumentTemplate } from '../types';
import { useToast } from '@/hooks/use-toast';

export const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Template Data state
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER' | 'LEGAL' | 'CUSTOM'>('A4');
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [variablesJson, setVariablesJson] = useState('[]');
  const [changeReason, setChangeReason] = useState('Administrative code updates');

  // Preview & Editor state
  const [activeTab, setActiveTab] = useState('html');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Debounce preview timer
  const previewTimer = useRef<any>(null);

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  const loadTemplate = async (templateId: string) => {
    try {
      const data = await documentService.getTemplate(templateId);
      setTemplate(data);
      setName(data.name);
      setDescription(data.description || '');
      setHtmlCode(data.htmlTemplate);
      setCssCode(data.cssTemplate);
      setPageSize(data.pageSize);
      setOrientation(data.orientation);
      setVariablesJson(JSON.stringify(data.variables, null, 2));

      // Initial preview render
      renderPreview(data.htmlTemplate, data.cssTemplate, data.variables);
    } catch (error) {
      toast({
        title: 'Error loading template',
        description: 'Template details could not be retrieved from the database.',
        variant: 'destructive',
      });
      navigate('/dashboard/documents/templates');
    }
  };

  const renderPreview = async (html: string, css: string, variables: any) => {
    setIsPreviewLoading(true);
    try {
      // Build dummy variables based on schema definitions for preview
      const parsedVars: any = Array.isArray(variables) ? variables : [];
      const dummyVars: Record<string, string> = {};
      
      parsedVars.forEach((v: any) => {
        dummyVars[v.name] = v.defaultValue || `[Preview ${v.label}]`;
      });

      // Special sample variables mapping
      dummyVars['student.fullName'] = 'Ram Bahadur Thapa';
      dummyVars['student.admissionNumber'] = 'REG-2083-4819';
      dummyVars['student.rollNumber'] = '12';
      dummyVars['student.class'] = 'BSc. CSIT 3rd Sem';
      dummyVars['student.section'] = 'Section A';
      dummyVars['student.guardianName'] = 'Hari Bahadur Thapa';
      dummyVars['academicYear.label'] = '2082/2083';

      const previewContent = await documentService.getPreviewHtml(html, css, dummyVars);
      setPreviewHtml(previewContent);
    } catch (error) {
      console.error('Preview render failed', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Debounced trigger for auto preview update on code edits
  const triggerAutoPreview = (updatedHtml: string, updatedCss: string) => {
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
    }
    previewTimer.current = setTimeout(() => {
      let parsedVars = [];
      try {
        parsedVars = JSON.parse(variablesJson);
      } catch (err) {}
      renderPreview(updatedHtml, updatedCss, parsedVars);
    }, 1000);
  };

  const handleHtmlChange = (val: string) => {
    setHtmlCode(val);
    triggerAutoPreview(val, cssCode);
  };

  const handleCssChange = (val: string) => {
    setCssCode(val);
    triggerAutoPreview(htmlCode, val);
  };

  const handleSave = async () => {
    if (!id || !template) return;
    setIsSaving(true);
    try {
      let parsedVars = [];
      try {
        parsedVars = JSON.parse(variablesJson);
        if (!Array.isArray(parsedVars)) {
          throw new Error('Variables must be an array of variable objects');
        }
      } catch (jsonErr: any) {
        toast({
          title: 'Invalid Variables Definition',
          description: jsonErr.message || 'JSON formatting error. Ensure variables matches a valid JSON array.',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      const payload = {
        name,
        description,
        htmlTemplate: htmlCode,
        cssTemplate: cssCode,
        pageSize,
        orientation,
        variables: parsedVars,
        changeReason,
      };

      const updated = await documentService.updateTemplate(id, payload);
      setTemplate(updated);
      toast({
        title: 'Template updated successfully',
        description: `Saved as version ${updated.version}. History cataloged.`,
      });
      loadTemplate(id); // Reload history list
    } catch (error: any) {
      toast({
        title: 'Failed saving template changes',
        description: error.response?.data?.message || 'Error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (version: number) => {
    if (!id) return;
    if (!window.confirm(`Are you sure you want to restore template state back to Version ${version}? This updates the active blueprint.`)) return;

    try {
      await documentService.restoreTemplateVersion(id, version);
      toast({
        title: 'Version restored',
        description: `Successfully set current template blueprint back to version ${version}.`,
      });
      loadTemplate(id);
    } catch (error) {
      toast({ title: 'Restore version failed', variant: 'destructive' });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              {name}
              {template && (
                <Badge variant="outline" className="text-[10px] font-mono py-0 px-2 bg-secondary/80">
                  v{template.version}
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">Category: {template?.category} | Unique Key: {template?.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/documents/templates')} className="cursor-pointer">
            Exit Editor
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 cursor-pointer font-semibold shadow-sm">
            <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Editor & Preview Split Screen */}
      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Left Side: Code/Form Editor */}
        <div className="w-1/2 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <Tabs defaultValue="html" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="px-4 py-2 border-b border-border/40 shrink-0 bg-secondary/20 flex gap-2">
              <TabsTrigger value="html" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <Code className="h-3.5 w-3.5" /> HTML Code
              </TabsTrigger>
              <TabsTrigger value="css" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <FileCode className="h-3.5 w-3.5" /> CSS Styles
              </TabsTrigger>
              <TabsTrigger value="variables" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <Settings className="h-3.5 w-3.5" /> Schema Variables
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <Settings className="h-3.5 w-3.5" /> Layout Config
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <Clock className="h-3.5 w-3.5" /> Versions
              </TabsTrigger>
            </TabsList>

            {/* HTML Tab */}
            <TabsContent value="html" className="flex-1 flex flex-col p-4 min-h-0 m-0">
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Standard Mustache syntax interpolation ({'"{{student.fullName}}"' } etc.)</span>
                  <Badge variant="outline" className="font-mono text-[9px]">HTML5</Badge>
                </div>
                <Textarea
                  value={htmlCode}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  className="flex-1 font-mono text-xs p-3 bg-secondary/15 dark:bg-background/40 resize-none border border-border border-dashed select-text scrollbar-thin h-full"
                />
              </div>
            </TabsContent>

            {/* CSS Tab */}
            <TabsContent value="css" className="flex-1 flex flex-col p-4 min-h-0 m-0">
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Custom fonts, margins, sizes, watermarks. Prefaced with `.theme` classes.</span>
                  <Badge variant="outline" className="font-mono text-[9px]">CSS3</Badge>
                </div>
                <Textarea
                  value={cssCode}
                  onChange={(e) => handleCssChange(e.target.value)}
                  className="flex-1 font-mono text-xs p-3 bg-secondary/15 dark:bg-background/40 resize-none border border-border border-dashed select-text scrollbar-thin h-full"
                />
              </div>
            </TabsContent>

            {/* Variables Definition JSON */}
            <TabsContent value="variables" className="flex-1 flex flex-col p-4 min-h-0 m-0">
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>JSON array of inputs needed: {'"[{ name: \'key\', label: \'Label\', type: \'text\' }]"'}</span>
                  <Badge variant="outline" className="font-mono text-[9px]">JSON Schema</Badge>
                </div>
                <Textarea
                  value={variablesJson}
                  onChange={(e) => setVariablesJson(e.target.value)}
                  className="flex-1 font-mono text-xs p-3 bg-secondary/15 dark:bg-background/40 resize-none border border-border border-dashed select-text scrollbar-thin h-full"
                />
              </div>
            </TabsContent>

            {/* Configurations Tab */}
            <TabsContent value="config" className="flex-1 p-6 overflow-y-auto space-y-4 m-0 scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Display Name</label>
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Paper Page Size</label>
                  <Select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)}>
                    <option value="A4">A4 (Standard Nepal Certificate)</option>
                    <option value="LETTER">Letter (Standard US Form)</option>
                    <option value="LEGAL">Legal size</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Layout Orientation</label>
                  <Select value={orientation} onChange={(e) => setOrientation(e.target.value as any)}>
                    <option value="PORTRAIT">Portrait</option>
                    <option value="LANDSCAPE">Landscape</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Update Changelog Audit Note</label>
                  <Input type="text" value={changeReason} onChange={(e) => setChangeReason(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description / Administrative memo</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
            </TabsContent>

            {/* Versions History Tab */}
            <TabsContent value="history" className="flex-1 p-6 overflow-y-auto m-0 scrollbar-thin">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> Version Control History Log
              </h3>
              {template?.histories && template.histories.length > 0 ? (
                <div className="space-y-3">
                  {template.histories.map((hist) => (
                    <div
                      key={hist.id}
                      className="flex justify-between items-center p-3 border border-border bg-secondary/10 rounded-lg hover:border-border/80 transition-all text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">Version {hist.version}</span>
                          {hist.version === template.version && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] py-0 px-1">
                              Current Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">Reason: {hist.changeReason || 'No reason logged'}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Saved: {new Date(hist.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {hist.version !== template.version && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(hist.version)}
                          className="gap-1 text-[11px] h-8 cursor-pointer"
                        >
                          <Undo2 className="h-3 w-3" /> Restore
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No historical versions cataloged.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Sandbox Live Preview Iframe */}
        <div className="w-1/2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm relative">
          
          {/* Preview Panel Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-emerald-500" /> Live Sandbox Preview
            </span>
            <div className="flex items-center gap-2">
              {isPreviewLoading && (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
              )}
              <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                Iframe Sandboxed
              </Badge>
            </div>
          </div>

          {/* Sandboxed iframe containing rendered layout */}
          <div className="flex-1 bg-white relative p-4 flex justify-center items-center overflow-auto scrollbar-thin">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="Template Live Preview"
                className="shadow-2xl border border-slate-200"
                style={{
                  width: pageSize === 'A4' ? (orientation === 'PORTRAIT' ? '210mm' : '297mm') : '215.9mm',
                  height: pageSize === 'A4' ? (orientation === 'PORTRAIT' ? '297mm' : '210mm') : '279.4mm',
                  transform: 'scale(0.55)', // Scales preview down to fit layout view comfortably
                  transformOrigin: 'center center',
                  maxWidth: '180%',
                  maxHeight: '180%',
                }}
              />
            ) : (
              <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <span>Generating visual preview layout...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TemplateEditor;
