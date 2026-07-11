import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building,
  User,
  GraduationCap,
  Award,
  Hash,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { documentService } from '@/features/documents/services/document.service';
import type { VerificationResult } from '@/features/documents/types';

export const PublicVerifyDocument = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      documentService
        .verifyDocumentPublic(id)
        .then((data) => {
          setResult(data);
        })
        .catch((err) => {
          console.error(err);
          // Set as invalid manually on network failure/not found
          setResult({
            id: id,
            documentNumber: 'UNKNOWN',
            status: 'INVALID',
            message: 'An error occurred during verification. Document ID not validated.',
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(229,192,96,0.05),transparent)] pointer-events-none" />

      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
          <p className="text-sm text-slate-400 font-semibold animate-pulse">Running verification sequence...</p>
        </div>
      ) : result ? (
        <div className="w-full max-w-lg z-10">
          
          {/* Institution Header branding */}
          <div className="text-center mb-6 space-y-2">
            <div className="h-14 w-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/5">
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight uppercase">
              Deukhuri Digital Campus
            </h1>
            <p className="text-xs text-slate-400">Enterprise Registry Verification Portal</p>
          </div>

          {result.status === 'ISSUED' ? (
            /* VALID SECURED DOCUMENT CARD */
            <Card className="border-emerald-500/25 bg-slate-900 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              <CardHeader className="text-center pb-2 pt-8">
                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce duration-1000">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-white">DOCUMENT VALIDATED</CardTitle>
                <CardDescription className="text-emerald-500/90 font-bold uppercase tracking-wider text-[10px] mt-1 bg-emerald-500/10 border border-emerald-500/20 inline-block px-3 py-1 rounded-full">
                  Authentic ERP Credential
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-slate-300">
                <div className="divide-y divide-slate-800 border-y border-slate-800">
                  <div className="flex justify-between py-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-400 font-medium"><Award className="h-4 w-4" /> Category:</span>
                    <span className="font-bold text-white uppercase">{result.category}</span>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-400 font-medium"><Hash className="h-4 w-4" /> Dispatch ID:</span>
                    <span className="font-mono font-bold text-white">{result.documentNumber}</span>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-400 font-medium"><User className="h-4 w-4" /> Recipient:</span>
                    <span className="font-bold text-white">{result.recipientName}</span>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-400 font-medium"><Building className="h-4 w-4" /> Template:</span>
                    <span className="font-bold text-white text-right max-w-[250px]">{result.templateName}</span>
                  </div>
                  <div className="flex justify-between py-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-400 font-medium"><Calendar className="h-4 w-4" /> Issued On:</span>
                    <span className="font-bold text-white">
                      {result.generatedAt ? new Date(result.generatedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-center pt-2">
                  ID: {result.id} | This validation ensures the document matches the official Deukhuri Digital Campus ledger snapshot exactly.
                </div>
              </CardContent>
            </Card>
          ) : (
            /* INVALID/FAILED VERIFICATION CARD */
            <Card className="border-rose-500/25 bg-slate-900 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-red-600" />
              
              <CardHeader className="text-center pb-2 pt-8">
                <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <ShieldAlert className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-white">VERIFICATION FAILED</CardTitle>
                <CardDescription className="text-rose-500 font-bold uppercase tracking-wider text-[10px] mt-1 bg-rose-500/10 border border-rose-500/20 inline-block px-3 py-1 rounded-full">
                  Unrecognized Credential
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-slate-300">
                <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl text-center">
                  <p className="text-sm text-rose-300 font-semibold leading-relaxed">
                    {result.message || 'The scanned document ID is invalid, has been revoked, or is not matching any official record in our database.'}
                  </p>
                </div>
                
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  ⚠️ <strong>Disclaimer:</strong> Falsification of academic records is a legal offense. If you believe this document is genuine and this check is an error, please contact the Deukhuri Digital Campus Administration.
                </p>

                <div className="text-[10px] text-slate-600 text-center pt-2 font-mono">
                  digital-sign-hash: {id}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer note */}
          <div className="text-center mt-6 text-[10px] text-slate-500">
            &copy; 2026 Deukhuri Digital Campus ERP. All rights reserved.
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PublicVerifyDocument;
