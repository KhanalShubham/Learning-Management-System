import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Settings,
  Eye,
  CheckCircle,
  Download,
  Printer,
  ChevronRight,
  Clock,
  RectangleHorizontal,
  RectangleVertical,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { documentService } from '../services/document.service';
import type { DocumentTemplate, GeneratedDocument } from '../types';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { TemplateThumbnail } from '../components/DocumentThumbnail';
import { getCategoryMeta } from '../constants/categories';

export const DocumentGenerationWizard = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('templateId') || '';

  // Wizard Steps: 1 = Template, 2 = Recipient, 3 = Fill & Preview, 4 = Success
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  
  // Recipient Search
  const [searchQuery, setSearchQuery] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Variables Input
  const [variableInputs, setVariableInputs] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Success Generation
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.listTemplates();
      setTemplates(data);
      if (initialTemplateId) {
        const found = data.find((t) => t.id === initialTemplateId);
        if (found) {
          handleSelectTemplate(found);
        }
      }
    } catch (error) {
      toast({ title: 'Error loading templates', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setSelectedRecipient(null);
    setSearchQuery('');
    setRecipients([]);
    
    // Initialize variable inputs with defaults
    const initialInputs: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialInputs[v.name] = v.defaultValue || '';
    });
    setVariableInputs(initialInputs);
    
    setStep(2);
  };

  // Search Students or Teachers based on Category/Type
  const handleSearchRecipient = async () => {
    if (!selectedTemplate) return;
    if (searchQuery.trim().length < 2) {
      toast({ title: 'Search query too short', description: 'Please type at least 2 characters.', variant: 'warning' });
      return;
    }

    setIsSearching(true);
    try {
      // If template is EMPLOYMENT-based, search teachers. Otherwise search students.
      const isTeacherDoc = selectedTemplate.category === 'EMPLOYMENT' || selectedTemplate.type.includes('TEACHER');
      
      if (isTeacherDoc) {
        const response = await api.get('/faculty', { params: { firstName: searchQuery } });
        // Mapped response (check structure of listTeachers)
        const teachers = response.data.data.teachers || [];
        setRecipients(teachers.map((t: any) => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
          subInfo: `Employee ID: ${t.employeeId} | Dept: ${t.department?.name || 'N/A'}`,
          type: 'TEACHER',
        })));
      } else {
        const response = await api.get('/students', { params: { firstName: searchQuery } });
        const students = response.data.data.students || [];
        setRecipients(students.map((s: any) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          subInfo: `Reg No: ${s.admissionNumber} | Class: ${s.class?.name || 'N/A'}`,
          type: 'STUDENT',
        })));
      }
    } catch (error) {
      toast({ title: 'Search failed', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecipient = (recipient: any) => {
    setSelectedRecipient(recipient);
    // Proceed to Step 3
    handleTriggerPreview(recipient.id);
    setStep(3);
  };

  const handleVariableChange = (name: string, value: string) => {
    const updated = { ...variableInputs, [name]: value };
    setVariableInputs(updated);
    // Debounce/trigger preview rebuild
    rebuildPreview(updated);
  };

  // Triggers live preview compilation based on selected student/teacher and custom inputs
  const handleTriggerPreview = async (recipientId: string) => {
    if (!selectedTemplate) return;
    setIsPreviewLoading(true);
    try {
      const isTeacher = selectedTemplate.category === 'EMPLOYMENT' || selectedTemplate.type.includes('TEACHER');
      const variablesPayload: Record<string, string> = {};
      
      // Map inputs to custom.* values
      Object.keys(variableInputs).forEach((key) => {
        if (key.startsWith('custom.')) {
          variablesPayload[key.replace('custom.', '')] = variableInputs[key];
        } else {
          variablesPayload[key] = variableInputs[key];
        }
      });

      // Query mock compiled preview from backend
      const response = await api.post('/documents/templates/preview', {
        htmlTemplate: selectedTemplate.htmlTemplate,
        cssTemplate: selectedTemplate.cssTemplate,
        variables: {
          ...variablesPayload,
          // Inject actual selected recipient IDs so preview resolves database details!
          ...(isTeacher ? { teacherId: recipientId } : { studentId: recipientId })
        }
      });
      setPreviewHtml(response.data);
    } catch (err) {
      console.error('Failed compiling preview', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const rebuildPreview = (updatedInputs: Record<string, string>) => {
    if (!selectedTemplate || !selectedRecipient) return;
    
    // Quick debounce simulation for wizard typing preview
    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const isTeacher = selectedTemplate.category === 'EMPLOYMENT' || selectedTemplate.type.includes('TEACHER');
        const variablesPayload: Record<string, string> = {};
        
        Object.keys(updatedInputs).forEach((key) => {
          if (key.startsWith('custom.')) {
            variablesPayload[key.replace('custom.', '')] = updatedInputs[key];
          } else {
            variablesPayload[key] = updatedInputs[key];
          }
        });

        const response = await api.post('/documents/templates/preview', {
          htmlTemplate: selectedTemplate.htmlTemplate,
          cssTemplate: selectedTemplate.cssTemplate,
          variables: {
            ...variablesPayload,
            ...(isTeacher ? { teacherId: selectedRecipient.id } : { studentId: selectedRecipient.id })
          }
        });
        setPreviewHtml(response.data);
      } catch (err) {}
      setIsPreviewLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedRecipient) return;
    setIsGenerating(true);
    try {
      const isTeacher = selectedTemplate.category === 'EMPLOYMENT' || selectedTemplate.type.includes('TEACHER');
      
      const payload: any = {
        templateId: selectedTemplate.id,
        variables: variableInputs,
      };

      if (isTeacher) {
        payload.teacherId = selectedRecipient.id;
      } else {
        payload.studentId = selectedRecipient.id;
      }

      const doc = await documentService.generateDocument(payload);
      setGeneratedDoc(doc);
      toast({ title: 'Document Issued', description: `Credential ${doc.documentNumber} issued successfully.` });
      setStep(4);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.response?.data?.message || 'Error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedDoc || !generatedDoc.pdfPath) return;
    await documentService.logDocumentAction(generatedDoc.id, 'DOWNLOAD');
    window.open(generatedDoc.pdfPath, '_blank');
  };

  const handlePrint = async () => {
    if (!generatedDoc) return;
    await documentService.logDocumentAction(generatedDoc.id, 'PRINT');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedDoc.htmlSnapshot);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Credential Generation Wizard
        </h1>
        <p className="text-sm text-muted-foreground">
          Centralized ERP document builder. Select template, verify recipient, adjust parameters, and print.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="flex items-center gap-2 bg-card border border-border p-4 rounded-xl shadow-sm">
        {['Choose Design', 'Choose Recipient', 'Fill Details', 'Generate'].map((sName, idx) => {
          const sNum = idx + 1;
          const isActive = step === sNum;
          const isCompleted = step > sNum;

          return (
            <div key={sName} className="flex items-center gap-2 flex-1 justify-center">
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isCompleted ? '✓' : sNum}
              </span>
              <span className={`text-xs font-semibold hidden md:inline ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {sName}
              </span>
              {idx < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground/35" />}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Choose Template */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Design</CardTitle>
            <CardDescription>Pick the certificate or letter design you want to generate.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No document designs found yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((temp) => {
                  const meta = getCategoryMeta(temp.category);
                  return (
                    <div
                      key={temp.id}
                      onClick={() => handleSelectTemplate(temp)}
                      className="border border-border hover:border-primary bg-card rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      <div className="relative aspect-[4/3] bg-secondary/30 overflow-hidden">
                        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                          <TemplateThumbnail template={temp} />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="gap-1 bg-black/60 text-white border-transparent backdrop-blur-sm text-[10px]">
                            {temp.orientation === 'LANDSCAPE' ? (
                              <RectangleHorizontal className="h-3 w-3" />
                            ) : (
                              <RectangleVertical className="h-3 w-3" />
                            )}
                            {temp.orientation === 'LANDSCAPE' ? 'Landscape' : 'Portrait'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3.5">
                        <Badge variant="outline" className="gap-1 text-[9px] font-bold py-0.5 tracking-wider uppercase bg-secondary/40 mb-1.5">
                          <meta.icon className="h-3 w-3" /> {meta.label}
                        </Badge>
                        <h3 className="font-bold text-foreground text-sm">{temp.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{temp.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Choose Recipient */}
      {step === 2 && selectedTemplate && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Select Recipient Target</CardTitle>
              <CardDescription>
                Search and select the recipient (Student / Teacher) for the document.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="cursor-pointer">
              Change Template
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  selectedTemplate.category === 'EMPLOYMENT'
                    ? 'Search Teacher by First Name (at least 2 chars)...'
                    : 'Search Student by First Name (at least 2 chars)...'
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSearchRecipient()}
              />
              <Button onClick={handleSearchRecipient} disabled={isSearching} className="gap-1 cursor-pointer">
                <Search className="h-4 w-4" /> {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {recipients.length > 0 ? (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {recipients.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => handleSelectRecipient(rec)}
                    className="p-3 hover:bg-secondary/40 flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">{rec.name}</p>
                      <p className="text-xs text-muted-foreground">{rec.subInfo}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer">
                      Select Recipient
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 && !isSearching ? (
              <div className="text-center py-6 text-muted-foreground text-xs">No records found. Try a different query.</div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Preview & Variables */}
      {step === 3 && selectedTemplate && selectedRecipient && (
        <div className="flex gap-4 min-h-0">
          {/* Left panel: Variable Inputs */}
          <div className="w-1/2 bg-card border border-border rounded-xl overflow-hidden p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-start pb-4 border-b border-border/40">
              <div>
                <h3 className="font-bold text-foreground">Configure Details</h3>
                <p className="text-xs text-muted-foreground">Recipient: {selectedRecipient.name}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(2)} className="cursor-pointer">
                Back
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-thin">
              {selectedTemplate.variables.map((v) => {
                // Only render custom fields for administrative override (others resolve dynamically from database!)
                if (!v.name.startsWith('custom.')) return null;

                return (
                  <div key={v.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {v.label} {v.required && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      type={v.type === 'date' ? 'date' : 'text'}
                      value={variableInputs[v.name] || ''}
                      onChange={(e) => handleVariableChange(v.name, e.target.value)}
                    />
                  </div>
                );
              })}

              <div className="bg-secondary/20 p-4 rounded-xl border border-border/40 text-xs text-muted-foreground space-y-1.5">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Settings className="h-3.5 w-3.5 text-primary" /> Auto-Resolved variables:
                </span>
                <p>Values like Full Name, Admission ID, Logo, and Signatures are auto-bound directly from the ERP database.</p>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2 cursor-pointer font-bold py-5 shadow-md">
              <Wand2 className="h-5 w-5" /> {isGenerating ? 'Generating...' : 'Generate Certificate'}
            </Button>
          </div>

          {/* Right panel: Sandboxed Preview Iframe */}
          <div className="w-1/2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center shrink-0">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-emerald-500" /> Sandboxed Document Preview
              </span>
              {isPreviewLoading && (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
              )}
            </div>

            <div className="flex-1 bg-white relative p-4 flex justify-center items-center overflow-auto scrollbar-thin">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Wizard Live Preview"
                  className="shadow-2xl border border-slate-200"
                  style={{
                    width: selectedTemplate.pageSize === 'A4' ? (selectedTemplate.orientation === 'PORTRAIT' ? '210mm' : '297mm') : '215.9mm',
                    height: selectedTemplate.pageSize === 'A4' ? (selectedTemplate.orientation === 'PORTRAIT' ? '297mm' : '210mm') : '279.4mm',
                    transform: 'scale(0.52)',
                    transformOrigin: 'center center',
                    maxWidth: '180%',
                    maxHeight: '180%',
                  }}
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
                  <span>Loading preview state...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Success Generated Page */}
      {step === 4 && generatedDoc && (
        <Card className="max-w-2xl mx-auto border-green-500/20 bg-green-500/5">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Document Generated Successfully!</h2>
              <p className="text-sm text-muted-foreground">
                Official serial ID <strong className="font-mono text-foreground font-semibold">{generatedDoc.documentNumber}</strong> has been signed and cataloged.
              </p>
            </div>

            {/* Audit Card */}
            <div className="bg-card border border-border p-4 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Verification URL:</span>
                <span className="text-primary hover:underline cursor-pointer select-all font-mono">
                  {`/verify/${generatedDoc.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Digital Signature (ID):</span>
                <span className="font-mono text-foreground">{generatedDoc.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Generated Date:</span>
                <span>{new Date(generatedDoc.generatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Print Document
              </Button>
              <Button className="gap-1.5 cursor-pointer font-semibold shadow-md" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>

            <div className="pt-4 border-t border-border/40 flex justify-between text-xs text-muted-foreground">
              <span>An official audit trail entry was recorded.</span>
              <button
                onClick={() => {
                  setStep(1);
                  setGeneratedDoc(null);
                }}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Generate Another Certificate
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentGenerationWizard;
