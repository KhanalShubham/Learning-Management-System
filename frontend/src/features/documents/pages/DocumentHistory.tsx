import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  Printer,
  Download,
  Calendar,
  Eye,
  Wand2,
  ShieldCheck,
  CalendarCheck2,
  Download as DownloadIcon,
  Inbox,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { documentService } from '../services/document.service';
import type { GeneratedDocument } from '../types';
import { useToast } from '@/hooks/use-toast';
import { SnapshotThumbnail } from '../components/DocumentThumbnail';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';
import { getCategoryMeta } from '../constants/categories';

export const DocumentHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<GeneratedDocument | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.listGeneratedDocuments();
      setDocuments(data);
    } catch (error) {
      toast({
        title: 'Error loading history',
        description: 'Failed to retrieve document generation log.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categoriesPresent = useMemo(
    () => Array.from(new Set(documents.map((d) => d.template?.category).filter(Boolean))) as string[],
    [documents]
  );

  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter((doc) => {
        const serialMatch = doc.documentNumber.toLowerCase().includes(q);
        const studentName = doc.student ? `${doc.student.firstName} ${doc.student.lastName}`.toLowerCase() : '';
        const teacherName = doc.teacher ? `${doc.teacher.firstName} ${doc.teacher.lastName}`.toLowerCase() : '';
        const admissionMatch = doc.student?.admissionNumber?.toLowerCase().includes(q) || false;
        const employeeMatch = doc.teacher?.employeeId?.toLowerCase().includes(q) || false;
        return (
          serialMatch ||
          studentName.includes(q) ||
          teacherName.includes(q) ||
          admissionMatch ||
          employeeMatch
        );
      });
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((doc) => doc.template?.category === categoryFilter);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((doc) => doc.status === statusFilter);
    }

    return result;
  }, [searchQuery, categoryFilter, statusFilter, documents]);

  // Dashboard-style summary stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const issuedToday = documents.filter((d) => new Date(d.generatedAt) >= today).length;
    const issuedThisMonth = documents.filter((d) => new Date(d.generatedAt) >= monthStart).length;
    const revoked = documents.filter((d) => d.status === 'REVOKED').length;
    const verifiedRate = documents.length > 0 ? Math.round(((documents.length - revoked) / documents.length) * 100) : 100;

    return {
      issuedToday,
      issuedThisMonth,
      total: documents.length,
      verifiedRate,
    };
  }, [documents]);

  const handleDownload = async (doc: GeneratedDocument) => {
    try {
      if (!doc.pdfPath) {
        toast({ title: 'PDF not ready', description: 'This generated copy does not have a PDF file yet.', variant: 'warning' });
        return;
      }
      await documentService.logDocumentAction(doc.id, 'DOWNLOAD');
      window.open(doc.pdfPath, '_blank');
      toast({ title: 'Download started' });
    } catch (error) {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  const handlePrint = async (doc: GeneratedDocument) => {
    try {
      await documentService.logDocumentAction(doc.id, 'PRINT');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(doc.htmlSnapshot);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 800);
      }
    } catch (error) {
      toast({ title: 'Print failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Issued Documents
          </h1>
          <p className="text-sm text-muted-foreground">
            Every certificate, letter, and record generated for students and staff.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/documents/generate')} className="gap-2 cursor-pointer font-semibold shadow-md">
          <Wand2 className="h-4 w-4" /> Generate Certificate
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Today's Certificates</p>
              <p className="text-xl font-bold text-foreground">{stats.issuedToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">This Month</p>
              <p className="text-xl font-bold text-foreground">{stats.issuedThisMonth}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <DownloadIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Issued</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Verified</p>
              <p className="text-xl font-bold text-foreground">{stats.verifiedRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student name, admission no, or certificate no..."
          className="pl-10 h-11"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
            categoryFilter === 'ALL'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
          }`}
        >
          All Categories
        </button>
        {categoriesPresent.map((cat) => {
          const meta = getCategoryMeta(cat);
          const Icon = meta.icon;
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {meta.label}
            </button>
          );
        })}
        <span className="w-px bg-border mx-1" />
        {['ISSUED', 'REVOKED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              statusFilter === s
                ? 'bg-foreground text-background border-foreground shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {s === 'ISSUED' ? 'Valid Only' : 'Revoked Only'}
          </button>
        ))}
      </div>

      {/* Gmail-style list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <div className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {documents.length === 0 ? 'No certificates generated yet' : 'No matching documents'}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {documents.length === 0
              ? 'Once you generate a certificate or letter, it will show up here.'
              : 'Try a different search term or clear your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDocuments.map((doc) => {
            const recipientName = doc.student
              ? `${doc.student.firstName} ${doc.student.lastName}`
              : doc.teacher
              ? `${doc.teacher.firstName} ${doc.teacher.lastName}`
              : 'N/A';
            const subInfo = doc.student
              ? `Adm: ${doc.student.admissionNumber}`
              : doc.teacher
              ? `Emp: ${doc.teacher.employeeId}`
              : '';
            const generated = new Date(doc.generatedAt);
            const isToday = generated.toDateString() === new Date().toDateString();

            return (
              <Card key={doc.id} className="hover:shadow-md hover:border-border/80 transition-all duration-150">
                <CardContent className="p-3 flex items-center gap-4">
                  {/* Mini certificate thumbnail */}
                  <div
                    className="h-16 w-20 shrink-0 rounded-md border border-border overflow-hidden bg-secondary/30 cursor-pointer"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <SnapshotThumbnail htmlSnapshot={doc.htmlSnapshot} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground truncate">
                        {doc.template?.name || 'Document'}
                      </span>
                      <Badge
                        className={
                          doc.status === 'ISSUED'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0'
                            : 'bg-red-500/10 text-red-500 border-red-500/20 text-[10px] py-0'
                        }
                      >
                        {doc.status === 'ISSUED' ? 'Verified' : 'Revoked'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {recipientName} {subInfo && `· ${subInfo}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isToday ? 'Issued Today' : generated.toLocaleDateString()},{' '}
                        {generated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-mono">{doc.documentNumber}</span>
                    </div>
                  </div>

                  {/* Labeled actions */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewDoc(doc)}
                      className="h-8 gap-1.5 px-2.5 text-xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(doc)}
                      className="h-8 gap-1.5 px-2.5 text-xs cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="h-8 gap-1.5 px-2.5 text-xs cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Snapshot Preview Modal */}
      {previewDoc && (
        <CertificatePreviewModal
          isOpen={previewDoc !== null}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.template?.name || `Document ${previewDoc.documentNumber}`}
          html={previewDoc.htmlSnapshot}
          orientation={previewDoc.template?.orientation || 'PORTRAIT'}
          pageSize={previewDoc.template?.pageSize || 'A4'}
          secondaryActions={[
            {
              label: 'Download',
              icon: <Download className="h-4 w-4" />,
              onClick: () => handleDownload(previewDoc),
            },
          ]}
          primaryAction={{
            label: 'Print',
            icon: <Printer className="h-4 w-4" />,
            onClick: () => handlePrint(previewDoc),
          }}
        />
      )}
    </div>
  );
};

export default DocumentHistory;
