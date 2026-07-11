import { useState } from 'react';
import { Printer, Info, GraduationCap, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { useClasses } from '@/features/academic-structure/hooks/useClasses';
import { useStudents } from '@/features/student/hooks/useStudents';
import { useSchoolProfile, useBranding } from '@/features/school/hooks/useSchool';
import { useExamTerms, useStudentReportCard } from '../hooks/useExams';

export default function ReportCardPreview() {
  const { data: terms } = useExamTerms();
  const { data: school } = useSchoolProfile();
  const { data: branding } = useBranding();

  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const activeTerm = terms?.find((t) => t.id === selectedTermId);
  const { data: classes } = useClasses(activeTerm?.academicYearId);
  
  const { data: studentsData } = useStudents({
    academicYearId: activeTerm?.academicYearId || undefined,
    classId: selectedClassId || undefined,
    take: 100,
  });

  const students = studentsData?.data ?? [];

  // Fetch report card
  const { data: card, isLoading: cardLoading, error: cardError } = useStudentReportCard(
    selectedTermId,
    selectedStudentId
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Selector Filters (Hidden during printing) */}
      <div className="no-print space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Card Viewer</h1>
          <p className="text-gray-500 text-sm">Preview and print student academic terminal report sheets.</p>
        </div>

        <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam Term</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={selectedTermId}
              onChange={(e) => {
                setSelectedTermId(e.target.value);
                setSelectedClassId('');
                setSelectedStudentId('');
              }}
            >
              <option value="">-- Choose Exam Term --</option>
              {terms?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Class Tier</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId('');
              }}
              disabled={!selectedTermId}
            >
              <option value="">-- Choose Class Tier --</option>
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.admissionNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Card Sheet Container */}
      {!selectedStudentId ? (
        <div className="no-print p-8 border rounded-lg bg-white text-center text-gray-500">
          Please select a term, class tier, and student to view the report card.
        </div>
      ) : cardLoading ? (
        <div className="flex justify-center p-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
        </div>
      ) : cardError || !card ? (
        <div className="no-print p-8 border rounded-lg bg-white text-center text-rose-600 flex flex-col items-center gap-3">
          <Info className="h-8 w-8 text-rose-500" />
          <span className="font-semibold text-lg">Report Card Not Found</span>
          <p className="text-sm text-gray-500">
            Results for this student might not be calculated yet. Make sure the term cycle is set to
            <span className="font-semibold text-emerald-600"> PUBLISHED</span> to auto-compile report cards.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Print button toolbar (Hidden during printing) */}
          <div className="no-print flex justify-end">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print A4 Report Card
            </Button>
          </div>

          {/* Printable Area */}
          <div className="print-area marksheet-doc mx-auto max-w-4xl">
            <div className="corner-ornament top-left"></div>
            <div className="corner-ornament top-right"></div>
            <div className="corner-ornament bottom-left"></div>
            <div className="corner-ornament bottom-right"></div>

            <div className="border-outer">
              <div className="border-inner">
                {/* Certificate number tag */}
                <div className="cert-no-tag">
                  <span className="cert-no-label">MARKSHEET NO.</span>
                  <span className="cert-no-value">
                    MRK/{new Date().getFullYear()}/{card.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>

                {/* Header school info */}
                <div className="header-section">
                  <div className="header-top-row">
                    <div className="logo-wrapper">
                      {branding?.logoUrl ? (
                        <img src={branding.logoUrl} alt="School Logo" className="school-logo" />
                      ) : (
                        <GraduationCap className="logo-placeholder-icon" />
                      )}
                    </div>
                    <div className="title-details">
                      <h1 className="school-name">{school?.name || 'Deukhuri Secondary Public School'}</h1>
                      <p className="school-address">
                        {school?.address || 'Lamahi, Dang, Nepal'}
                        {school?.motto ? <> | <span className="motto-italic">&ldquo;{school.motto}&rdquo;</span></> : null}
                      </p>
                      <p className="school-meta">
                        {school?.phone ? `Phone: ${school.phone}` : ''}
                        {school?.email ? ` | Email: ${school.email}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="premium-divider">
                    <span className="diamond-point"></span>
                  </div>
                </div>

                {/* Ribbon title */}
                <div className="ribbon-wrap">
                  <div className="ribbon">ACADEMIC MARKSHEET</div>
                </div>
                <p className="ribbon-subtitle">{activeTerm?.name}</p>

                {/* Student Metadata grid */}
                <div className="meta-grid">
                  <div>
                    <p>
                      <span className="meta-label">Student Name:</span>{' '}
                      <span className="meta-value highlight-val">
                        {card.student?.firstName} {card.student?.middleName ? `${card.student.middleName} ` : ''}
                        {card.student?.lastName}
                      </span>
                    </p>
                    <p className="mt-1">
                      <span className="meta-label">Class:</span>{' '}
                      <span className="meta-value">{classes?.find((c) => c.id === selectedClassId)?.name || 'N/A'}</span>
                    </p>
                    <p className="mt-1">
                      <span className="meta-label">Admission Number:</span>{' '}
                      <span className="meta-value font-mono">{card.student?.admissionNumber}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      <span className="meta-label">Academic Term:</span>{' '}
                      <span className="meta-value">{activeTerm?.name}</span>
                    </p>
                    <p className="mt-1">
                      <span className="meta-label">Class Rank:</span>{' '}
                      <span className="meta-value">{card.classRank ?? '-'}</span>
                    </p>
                    <p className="mt-1">
                      <span className="meta-label">Section Rank:</span>{' '}
                      <span className="meta-value">{card.sectionRank ?? '-'}</span>
                    </p>
                  </div>
                </div>

                {/* Subject lines table */}
                <div className="mb-6 marksheet-table-wrap">
                  <Table className="marksheet-table w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Subject Code</TableHead>
                        <TableHead className="text-left">Subject Title</TableHead>
                        <TableHead className="text-center">Theory</TableHead>
                        <TableHead className="text-center">Practical</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Grade Point</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {card.details?.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-mono text-xs">{detail.subject?.code ?? '-'}</TableCell>
                          <TableCell className="font-semibold">{detail.subject?.name}</TableCell>
                          <TableCell className="text-center">
                            {detail.theoryObtained !== null ? detail.theoryObtained : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {detail.practicalObtained !== null ? detail.practicalObtained : '-'}
                          </TableCell>
                          <TableCell className="text-center font-bold">{detail.totalObtained}</TableCell>
                          <TableCell className="text-center">{detail.gradePoint.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-bold">{detail.letterGrade}</TableCell>
                          <TableCell className="text-center">{detail.subjectRank ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Aggregates block */}
                <div className="aggregates-grid">
                  <div className="aggregate-card">
                    <span className="aggregate-label">Total Score</span>
                    <span className="aggregate-value">
                      {card.totalMarksObtained} / {card.totalMaxMarks}
                    </span>
                  </div>
                  <div className="aggregate-card">
                    <span className="aggregate-label">Percentage</span>
                    <span className="aggregate-value">{card.percentage}%</span>
                  </div>
                  <div className="aggregate-card">
                    <span className="aggregate-label">Grade Point Average (GPA)</span>
                    <span className="aggregate-value">{card.gpa.toFixed(2)} GPA</span>
                  </div>
                </div>

                {/* Bottom details block */}
                <div className="standing-grid">
                  <div>
                    <p className="standing-title">Academic Standings</p>
                    <div className="standing-body">
                      <p>
                        Result Status: <span className="font-bold">{card.resultStatus}</span>
                      </p>
                      <p>
                        Division: <span className="font-semibold">{card.division || 'N/A'}</span>
                      </p>
                      <p>
                        Attendance Record: <span className="font-mono">{card.attendanceRate ?? '100'}%</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="standing-title">Principal Comments &amp; Remarks</p>
                    <p className="standing-remarks">
                      {card.remarks || 'Satisfactory terminal performance records.'}
                    </p>
                  </div>
                </div>

                {/* Structured Footer */}
                <div className="footer-layout">
                  <div className="verify-block">
                    <div className="issue-date">
                      Issue Date: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </div>
                    <div className="verify-url">Verification: /verify/marksheet/{card.id.slice(0, 8)}</div>
                    <div className="qr-container-row">
                      <div className="verify-qr-placeholder">
                        <QrCode className="h-8 w-8" strokeWidth={1.25} />
                      </div>
                      <div className="qr-meta">
                        <span className="qr-title">SECURE CREDENTIAL</span>
                        <span className="qr-subtitle">Scan to authenticate ledger</span>
                      </div>
                    </div>
                  </div>

                  <div className="official-seal">
                    {branding?.stampUrl ? (
                      <img src={branding.stampUrl} alt="Official Stamp" className="school-stamp" />
                    ) : (
                      <div className="seal-placeholder">
                        OFFICIAL
                        <br />
                        SEAL
                      </div>
                    )}
                  </div>

                  <div className="signatures-strip">
                    <div className="sig-block">
                      <div className="sig-line"></div>
                      <span className="sig-title">Class Teacher</span>
                    </div>
                    <div className="sig-block">
                      <div className="sig-line"></div>
                      <span className="sig-title">Exam Controller</span>
                    </div>
                    <div className="sig-block">
                      <div className="sig-line">
                        {branding?.principalSignatureUrl ? (
                          <img src={branding.principalSignatureUrl} alt="Principal Signature" className="principal-sig" />
                        ) : null}
                      </div>
                      <span className="sig-title">Principal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print media + Deukhuri Premium Red & Gold theme styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .marksheet-doc {
          position: relative;
          background-color: #ffffff;
          color: #111111;
          font-family: 'Inter', sans-serif;
          padding: 20px;
        }

        .marksheet-doc .corner-ornament {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: #D4AF37;
          border-style: solid;
          z-index: 5;
          pointer-events: none;
        }
        .marksheet-doc .corner-ornament.top-left { top: 14px; left: 14px; border-width: 4px 0 0 4px; }
        .marksheet-doc .corner-ornament.top-right { top: 14px; right: 14px; border-width: 4px 4px 0 0; }
        .marksheet-doc .corner-ornament.bottom-left { bottom: 14px; left: 14px; border-width: 0 0 4px 4px; }
        .marksheet-doc .corner-ornament.bottom-right { bottom: 14px; right: 14px; border-width: 0 4px 4px 0; }

        .marksheet-doc .border-outer {
          border: 4px double #D4AF37;
          padding: 8px;
          position: relative;
          z-index: 2;
        }
        .marksheet-doc .border-inner {
          border: 2px solid #C62828;
          padding: 28px 34px;
          position: relative;
        }

        .marksheet-doc .cert-no-tag {
          position: absolute;
          top: 14px;
          right: 14px;
          text-align: center;
          border: 1px solid #D4AF37;
          border-radius: 4px;
          padding: 4px 10px;
          background: #fffdf7;
        }
        .marksheet-doc .cert-no-label {
          display: block;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #C62828;
        }
        .marksheet-doc .cert-no-value {
          display: block;
          font-family: monospace;
          font-size: 10px;
          font-weight: 700;
          color: #111;
        }

        .marksheet-doc .header-section { margin-bottom: 14px; }
        .marksheet-doc .header-top-row {
          display: flex;
          align-items: center;
          gap: 18px;
          justify-content: center;
        }
        .marksheet-doc .school-logo { height: 64px; width: auto; object-fit: contain; }
        .marksheet-doc .logo-placeholder-icon { height: 48px; width: 48px; color: #C62828; }
        .marksheet-doc .title-details { text-align: left; }
        .marksheet-doc .school-name {
          font-family: 'Cinzel', serif;
          font-size: 20px;
          font-weight: 800;
          color: #C62828;
          margin: 0;
          letter-spacing: 0.2px;
        }
        .marksheet-doc .school-address {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 3px 0 0 0;
        }
        .marksheet-doc .motto-italic {
          font-family: 'Cinzel', serif;
          font-style: italic;
          font-weight: 700;
          color: #D4AF37;
        }
        .marksheet-doc .school-meta {
          font-family: 'Inter', sans-serif;
          font-size: 9.5px;
          color: #666;
          margin-top: 3px;
          font-weight: 500;
        }
        .marksheet-doc .premium-divider {
          width: 80%;
          height: 1.5px;
          background-color: #D4AF37;
          margin: 12px auto 0 auto;
          position: relative;
        }
        .marksheet-doc .diamond-point {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background-color: #C62828;
          border: 1px solid #D4AF37;
        }

        .marksheet-doc .ribbon-wrap {
          display: flex;
          justify-content: center;
          margin: 18px 0 4px 0;
        }
        .marksheet-doc .ribbon {
          position: relative;
          background: linear-gradient(180deg, #d32f2f, #a31f1f);
          color: #fff;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          letter-spacing: 3px;
          font-size: 16px;
          padding: 9px 34px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }
        .marksheet-doc .ribbon::before,
        .marksheet-doc .ribbon::after {
          content: '';
          position: absolute;
          top: 0;
          border-style: solid;
          border-width: 20px 12px;
        }
        .marksheet-doc .ribbon::before {
          left: -24px;
          border-color: #7a1414 #7a1414 transparent transparent;
        }
        .marksheet-doc .ribbon::after {
          right: -24px;
          border-color: #7a1414 transparent transparent #7a1414;
        }
        .marksheet-doc .ribbon-subtitle {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #555;
          margin-bottom: 18px;
        }

        .marksheet-doc .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          font-size: 12.5px;
          margin-bottom: 20px;
          background: #fffdf7;
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 4px;
          padding: 14px 16px;
        }
        .marksheet-doc .meta-label { color: #777; }
        .marksheet-doc .meta-value { font-weight: 700; color: #111; }
        .marksheet-doc .highlight-val { border-bottom: 1.5px solid #D4AF37; padding: 0 3px; }

        .marksheet-doc .marksheet-table-wrap { overflow-x: auto; }
        .marksheet-doc .marksheet-table { border-collapse: collapse; font-size: 12px; }
        .marksheet-doc .marksheet-table th {
          background: #C62828;
          color: #fff;
          font-weight: 700;
          padding: 8px 10px;
          border: 1px solid #a31f1f;
          text-transform: uppercase;
          font-size: 10.5px;
          letter-spacing: 0.3px;
        }
        .marksheet-doc .marksheet-table td {
          border: 1px solid rgba(212,175,55,0.5);
          padding: 7px 10px;
        }
        .marksheet-doc .marksheet-table tr:nth-child(even) td { background: #fdf9ef; }

        .marksheet-doc .aggregates-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin: 20px 0;
        }
        .marksheet-doc .aggregate-card {
          border: 1px solid #D4AF37;
          border-radius: 4px;
          background: #fffdf7;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 72px;
        }
        .marksheet-doc .aggregate-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #777;
        }
        .marksheet-doc .aggregate-value { font-size: 18px; font-weight: 800; color: #C62828; }

        .marksheet-doc .standing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          font-size: 12px;
          margin-bottom: 22px;
          border-top: 1px solid rgba(212,175,55,0.4);
          padding-top: 14px;
        }
        .marksheet-doc .standing-title {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
          color: #C62828;
          margin-bottom: 6px;
        }
        .marksheet-doc .standing-body { color: #333; }
        .marksheet-doc .standing-body p { margin: 2px 0; }
        .marksheet-doc .standing-remarks {
          font-style: italic;
          color: #333;
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 4px;
          padding: 8px 10px;
          min-height: 50px;
          background: #fffdf7;
        }

        .marksheet-doc .footer-layout {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(212,175,55,0.3);
          padding-top: 14px;
        }
        .marksheet-doc .verify-block { font-size: 9.5px; color: #666; width: 220px; }
        .marksheet-doc .issue-date { margin-bottom: 3px; }
        .marksheet-doc .verify-url { font-family: monospace; margin-bottom: 8px; }
        .marksheet-doc .qr-container-row { display: flex; align-items: center; gap: 10px; }
        .marksheet-doc .verify-qr-placeholder {
          width: 46px;
          height: 46px;
          border: 1px solid #ddd;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C62828;
        }
        .marksheet-doc .qr-meta { display: flex; flex-direction: column; }
        .marksheet-doc .qr-title { font-weight: 700; color: #C62828; font-size: 8px; letter-spacing: 0.5px; }
        .marksheet-doc .qr-subtitle { font-size: 7.5px; color: #777; }

        .marksheet-doc .official-seal {
          width: 64px;
          height: 64px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .marksheet-doc .school-stamp { max-height: 64px; width: auto; }
        .marksheet-doc .seal-placeholder {
          border: 1.5px dashed #D4AF37;
          border-radius: 50%;
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7.5px;
          font-weight: 700;
          color: #C62828;
          text-align: center;
          line-height: 1.2;
        }

        .marksheet-doc .signatures-strip { display: flex; gap: 18px; justify-content: flex-end; }
        .marksheet-doc .sig-block { width: 100px; text-align: center; }
        .marksheet-doc .sig-line {
          border-bottom: 1.5px solid #D4AF37;
          height: 30px;
          margin-bottom: 5px;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }
        .marksheet-doc .principal-sig { max-height: 28px; width: auto; }
        .marksheet-doc .sig-title {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: #555;
        }

        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 10px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
