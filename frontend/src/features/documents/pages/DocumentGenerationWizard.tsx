import { useState, useEffect, useMemo, useRef } from 'react';
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
  Layout,
  UserSearch,
  ListChecks,
  UserRound,
  History,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { documentService } from '../services/document.service';
import type { DocumentTemplate, GeneratedDocument } from '../types';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { studentService } from '@/features/student/services/student.service';
import { facultyService } from '@/features/faculty/services/faculty.service';
import { TemplateThumbnail } from '../components/DocumentThumbnail';
import { getCategoryMeta } from '../constants/categories';

interface RecipientLite {
  id: string;
  type: 'STUDENT' | 'TEACHER';
  name: string;
  code: string;
  subtitle: string;
  status: string;
  photoUrl?: string | null;
}

const RECENTS_KEY = 'documents:recent-recipients';

const loadRecents = (type: 'STUDENT' | 'TEACHER'): RecipientLite[] => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const all: RecipientLite[] = raw ? JSON.parse(raw) : [];
    return all.filter((r) => r.type === type).slice(0, 8);
  } catch {
    return [];
  }
};

const pushRecent = (recipient: RecipientLite) => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const all: RecipientLite[] = raw ? JSON.parse(raw) : [];
    const deduped = [recipient, ...all.filter((r) => !(r.id === recipient.id && r.type === recipient.type))];
    localStorage.setItem(RECENTS_KEY, JSON.stringify(deduped.slice(0, 20)));
  } catch {
    /* ignore storage failures */
  }
};

const STEPS = [
  { label: 'Template', icon: Layout },
  { label: 'Recipient', icon: UserSearch },
  { label: 'Details', icon: ListChecks },
  { label: 'Preview & Generate', icon: Wand2 },
];

const statusVariant = (status: string) => {
  if (status === 'ACTIVE') return 'success' as const;
  if (['SUSPENDED', 'TERMINATED', 'WITHDRAWN'].includes(status)) return 'destructive' as const;
  return 'secondary' as const;
};

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

  const isTeacherDoc = useMemo(
    () => !!selectedTemplate && (selectedTemplate.category === 'EMPLOYMENT' || selectedTemplate.type.includes('TEACHER')),
    [selectedTemplate]
  );

  // Recipient Search
  const [searchQuery, setSearchQuery] = useState('');
  const [recipients, setRecipients] = useState<RecipientLite[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientLite | null>(null);
  const [recipientDetail, setRecipientDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentRecipients, setRecentRecipients] = useState<RecipientLite[]>([]);
  const searchSeq = useRef(0);

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
    setRecipientDetail(null);
    setSearchQuery('');
    setRecipients([]);
    setHasSearched(false);

    const willBeTeacherDoc = template.category === 'EMPLOYMENT' || template.type.includes('TEACHER');
    setRecentRecipients(loadRecents(willBeTeacherDoc ? 'TEACHER' : 'STUDENT'));

    // Initialize variable inputs with defaults
    const initialInputs: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialInputs[v.name] = v.defaultValue || '';
    });
    setVariableInputs(initialInputs);

    setStep(2);
  };

  // Live autocomplete search — debounced 300ms, fires automatically as the user types
  useEffect(() => {
    if (step !== 2 || !selectedTemplate || selectedRecipient) return;

    const query = searchQuery.trim();
    if (query.length === 0) {
      setRecipients([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const mySeq = ++searchSeq.current;

    const timer = setTimeout(async () => {
      try {
        let mapped: RecipientLite[] = [];
        if (isTeacherDoc) {
          const result = await facultyService.listTeachers({ search: query, take: 8 });
          mapped = result.data.map((t) => ({
            id: t.id,
            type: 'TEACHER',
            name: `${t.firstName} ${t.lastName}`,
            code: t.employeeId,
            subtitle: `${t.designation?.name || 'N/A'} · ${t.department?.name || 'N/A'}`,
            status: t.status,
            photoUrl: t.photoUrl,
          }));
        } else {
          const result = await studentService.listStudents({ search: query, take: 8 });
          mapped = result.data.map((s) => {
            const enrollment = s.enrollments?.[0];
            return {
              id: s.id,
              type: 'STUDENT',
              name: `${s.firstName} ${s.lastName}`,
              code: s.admissionNumber,
              subtitle: enrollment ? `Class ${enrollment.class.name} · Section ${enrollment.section.name}` : 'Not enrolled',
              status: s.status,
              photoUrl: s.photoUrl,
            };
          });
        }
        if (mySeq === searchSeq.current) {
          setRecipients(mapped);
          setHasSearched(true);
        }
      } catch (error) {
        if (mySeq === searchSeq.current) {
          toast({ title: 'Search failed', variant: 'destructive' });
          setRecipients([]);
          setHasSearched(true);
        }
      } finally {
        if (mySeq === searchSeq.current) setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isTeacherDoc, step, selectedRecipient]);

  const handlePickRecipient = async (recipient: RecipientLite) => {
    setSelectedRecipient(recipient);
    setRecipientDetail(null);
    setIsLoadingDetail(true);
    try {
      const detail = recipient.type === 'TEACHER'
        ? await facultyService.getTeacher(recipient.id)
        : await studentService.getStudent(recipient.id);
      setRecipientDetail(detail);
    } catch (error) {
      // Non-fatal — the summary card falls back to the lightweight search result fields.
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleChangeRecipient = () => {
    setSelectedRecipient(null);
    setRecipientDetail(null);
    setSearchQuery('');
    setRecipients([]);
    setHasSearched(false);
  };

  const handleContinueToDetails = () => {
    if (!selectedRecipient) return;
    handleTriggerPreview(selectedRecipient.id);
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
      const variablesPayload: Record<string, string> = {};

      // Map inputs to custom.* values
      Object.keys(variableInputs).forEach((key) => {
        if (key.startsWith('custom.')) {
          variablesPayload[key.replace('custom.', '')] = variableInputs[key];
        } else {
          variablesPayload[key] = variableInputs[key];
        }
      });

      // Query compiled preview from backend, passing the recipient ID as a top-level
      // field so the server resolves their real name/class/guardian/etc. from the DB.
      const response = await api.post('/documents/templates/preview', {
        htmlTemplate: selectedTemplate.htmlTemplate,
        cssTemplate: selectedTemplate.cssTemplate,
        variables: variablesPayload,
        ...(isTeacherDoc ? { teacherId: recipientId } : { studentId: recipientId }),
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
          variables: variablesPayload,
          ...(isTeacherDoc ? { teacherId: selectedRecipient.id } : { studentId: selectedRecipient.id }),
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
      const payload: any = {
        templateId: selectedTemplate.id,
        variables: variableInputs,
      };

      if (isTeacherDoc) {
        payload.teacherId = selectedRecipient.id;
      } else {
        payload.studentId = selectedRecipient.id;
      }

      const doc = await documentService.generateDocument(payload);
      pushRecent(selectedRecipient);
      setGeneratedDoc(doc);
      toast({ title: 'Document Generated', description: `Credential ${doc.documentNumber} issued successfully.` });
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

  const renderRecipientCard = (recipient: RecipientLite, onSelect: () => void) => (
    <div
      key={`${recipient.type}-${recipient.id}`}
      className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="h-11 w-11 rounded-full bg-secondary shrink-0 overflow-hidden flex items-center justify-center border border-border/60">
        {recipient.photoUrl ? (
          <img src={recipient.photoUrl} alt={recipient.name} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm text-foreground truncate">{recipient.name}</p>
          <Badge variant={statusVariant(recipient.status)} className="text-[9px] py-0 px-1.5 shrink-0">
            {recipient.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {recipient.type === 'TEACHER' ? 'Employee ID' : 'Admission No'}: {recipient.code} · {recipient.subtitle}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onSelect} className="h-8 text-xs cursor-pointer shrink-0">
        Select
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Credential Generation Wizard
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick a design, find the recipient, and generate a print-ready certificate in a few clicks.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="flex items-center gap-2 bg-card border border-border p-4 rounded-xl shadow-sm">
        {STEPS.map((s, idx) => {
          const sNum = idx + 1;
          const isActive = step === sNum;
          const isCompleted = step > sNum;
          const StepIcon = s.icon;

          return (
            <div key={s.label} className="flex items-center gap-2 flex-1 justify-center">
              <span
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-3.5 w-3.5" />}
              </span>
              <span className={`text-xs font-semibold hidden md:inline ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {idx < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/35" />}
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
              <CardTitle>{isTeacherDoc ? 'Find a Staff Member' : 'Find a Student'}</CardTitle>
              <CardDescription>
                {selectedRecipient
                  ? 'Confirm the recipient below, then continue.'
                  : 'Search by name, admission number, roll number, or guardian details — results appear as you type.'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="cursor-pointer">
              Change Template
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRecipient ? (
              /* --- Selected Recipient Summary Card --- */
              <div className="border border-primary/30 bg-primary/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold mb-3">
                  <CheckCircle2 className="h-4 w-4" /> Selected Recipient
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-secondary shrink-0 overflow-hidden flex items-center justify-center border border-border/60">
                    {selectedRecipient.photoUrl ? (
                      <img src={selectedRecipient.photoUrl} alt={selectedRecipient.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-foreground font-bold text-base leading-tight">{selectedRecipient.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{isTeacherDoc ? 'Employee ID' : 'Admission No'}</p>
                      <p className="font-semibold text-foreground font-mono">{selectedRecipient.code}</p>
                    </div>
                    {!isTeacherDoc && recipientDetail?.enrollments?.[0] && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Class</p>
                          <p className="font-semibold text-foreground">{recipientDetail.enrollments[0].class.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Section</p>
                          <p className="font-semibold text-foreground">{recipientDetail.enrollments[0].section.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Academic Year</p>
                          <p className="font-semibold text-foreground">{recipientDetail.enrollments[0].academicYear.label}</p>
                        </div>
                      </>
                    )}
                    {!isTeacherDoc && recipientDetail?.guardians?.[0] && (
                      <div>
                        <p className="text-muted-foreground">Guardian</p>
                        <p className="font-semibold text-foreground">{recipientDetail.guardians[0].fullName}</p>
                      </div>
                    )}
                    {isTeacherDoc && recipientDetail && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Department</p>
                          <p className="font-semibold text-foreground">{recipientDetail.department?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Designation</p>
                          <p className="font-semibold text-foreground">{recipientDetail.designation?.name || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={statusVariant(selectedRecipient.status)} className="text-[10px] py-0 px-1.5 mt-0.5">
                        {selectedRecipient.status}
                      </Badge>
                    </div>
                    {isLoadingDetail && (
                      <div className="col-span-2 sm:col-span-3 text-muted-foreground flex items-center gap-1.5">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
                        Loading full profile...
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/30">
                  <Button variant="outline" size="sm" onClick={handleChangeRecipient} className="cursor-pointer">
                    Change {isTeacherDoc ? 'Staff' : 'Student'}
                  </Button>
                  <Button size="sm" onClick={handleContinueToDetails} className="gap-1.5 cursor-pointer font-semibold">
                    Continue <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* --- Live Autocomplete Search --- */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isTeacherDoc
                        ? 'Search staff by name, employee ID, or phone...'
                        : 'Search student by name, admission number, or guardian...'
                    }
                    className="pl-10 h-11"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute right-9 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
                    </div>
                  )}
                </div>

                {searchQuery.trim().length === 0 ? (
                  <>
                    {recentRecipients.length > 0 ? (
                      <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <History className="h-3.5 w-3.5" /> Recent Recipients
                        </p>
                        <div className="space-y-2">
                          {recentRecipients.map((r) => renderRecipientCard(r, () => handlePickRecipient(r)))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        <UserSearch className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        Start typing a {isTeacherDoc ? "staff member's" : "student's"} name or {isTeacherDoc ? 'employee' : 'admission'} number.
                      </div>
                    )}
                  </>
                ) : recipients.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Results</p>
                    <div className="space-y-2">
                      {recipients.map((r) => renderRecipientCard(r, () => handlePickRecipient(r)))}
                    </div>
                  </div>
                ) : hasSearched && !isSearching ? (
                  <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
                    <p>No matching {isTeacherDoc ? 'staff' : 'students'} found for "{searchQuery}".</p>
                    <p className="text-xs">
                      Try searching by {isTeacherDoc ? 'employee ID or phone' : 'admission number, roll number, or guardian phone'}.
                    </p>
                  </div>
                ) : null}
              </>
            )}
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
