import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileCheck,
  Download,
  Printer,
  History,
  Settings,
  PlusCircle,
  FileSpreadsheet,
  Award,
  Clock,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { documentService } from '../services/document.service';
import type { GeneratedDocument } from '../types';
import { useToast } from '@/hooks/use-toast';

export const DocumentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsData, templatesData] = await Promise.all([
          documentService.listGeneratedDocuments(),
          documentService.listTemplates(),
        ]);
        setDocuments(docsData);
        setTemplatesCount(templatesData.length);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error loading dashboard data',
          description: 'Failed to retrieve templates and document history.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async (doc: GeneratedDocument) => {
    try {
      if (!doc.pdfPath) {
        toast({ title: 'PDF not ready', description: 'This document does not have a PDF export path.' });
        return;
      }
      
      // Log audit action
      await documentService.logDocumentAction(doc.id, 'DOWNLOAD');
      
      // Redirect or download
      window.open(doc.pdfPath, '_blank');
      toast({ title: 'Download Started', description: `Audit log recorded for document ${doc.documentNumber}` });
    } catch (error) {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  const handlePrint = async (doc: GeneratedDocument) => {
    try {
      // Log print audit
      await documentService.logDocumentAction(doc.id, 'PRINT');
      
      // Open snapshot in print iframe or popup window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(doc.htmlSnapshot);
        printWindow.document.close();
        printWindow.focus();
        // Give fonts/styling a second to render before triggering browser print dialog
        setTimeout(() => {
          printWindow.print();
        }, 800);
      }
    } catch (error) {
      toast({ title: 'Print failed', variant: 'destructive' });
    }
  };

  // Metrics calculations
  const totalIssued = documents.length;
  const activeHistoryCount = documents.filter((d) => d.status === 'ISSUED').length;
  const revokedCount = documents.filter((d) => d.status === 'REVOKED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Document & Certificate Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Centralized ERP generation workspace for student credentials, exam cards, and faculty forms.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/dashboard/documents/templates')} variant="outline" className="gap-2 cursor-pointer">
            <Settings className="h-4 w-4" /> Browse Templates
          </Button>
          <Button onClick={() => navigate('/dashboard/documents/generate')} className="gap-2 cursor-pointer">
            <PlusCircle className="h-4 w-4" /> Generate Certificate
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Templates</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{templatesCount}</h3>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Code & Database templates
            </p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Credentials Issued</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{totalIssued}</h3>
              </div>
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Valid QR-verifiable documents
            </p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Copies</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{activeHistoryCount}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> Currently valid in circulation
            </p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revoked Documents</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{revokedCount}</h3>
              </div>
              <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                <History className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Canceled due to errors/changes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent History Table */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-border/40">
          <div>
            <CardTitle>Recent Issued Credentials</CardTitle>
            <CardDescription>Comprehensive audit log of issued templates, recipients, and print statuses.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/documents/history')} className="cursor-pointer">
            View All History
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 stroke-1 opacity-40" />
              <p className="font-semibold">No credentials issued yet</p>
              <p className="text-sm">Click "Generate Certificate" above to start rendering documents.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial No</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.slice(0, 5).map((doc) => {
                    const recipientName = doc.student
                      ? `${doc.student.firstName} ${doc.student.lastName}`
                      : doc.teacher
                      ? `${doc.teacher.firstName} ${doc.teacher.lastName}`
                      : 'N/A';

                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-mono text-xs font-semibold">{doc.documentNumber}</TableCell>
                        <TableCell className="font-medium">{doc.template?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{recipientName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {doc.student ? `Adm: ${doc.student.admissionNumber}` : `Emp: ${doc.teacher?.employeeId}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-semibold tracking-wider">
                            {doc.template?.category || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(doc.generatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              doc.status === 'ISSUED'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/15'
                                : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/15'
                            }
                          >
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentDashboard;
