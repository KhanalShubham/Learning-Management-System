import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { IBrandingRepository, BrandingRepository } from '@/modules/system-config/branding.repository';
import { prisma } from '@/prisma/client';
import { IDocumentRepository, DocumentRepository, GeneratedDocumentWithRelations } from './document.repository';
import { IPDFService, PDFService } from './pdf.service';
import { uploadDocumentBuffer } from '@/config/cloudinary';
import { AuditAction, DocumentTemplate, GeneratedDocument, RecordStatus } from '@prisma/client';
import { writeAuditLog } from '@/utils/audit-log';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/config/logger';

export class DocumentService {
  private documentRepository: IDocumentRepository;
  private pdfService: IPDFService;
  private brandingRepository: IBrandingRepository;

  constructor(
    documentRepository = new DocumentRepository(),
    pdfService = new PDFService(),
    brandingRepository = new BrandingRepository()
  ) {
    this.documentRepository = documentRepository;
    this.pdfService = pdfService;
    this.brandingRepository = brandingRepository;
  }

  // --- Templates CRUD ---

  public async getTemplates(): Promise<DocumentTemplate[]> {
    return this.documentRepository.findTemplates({ status: RecordStatus.ACTIVE });
  }

  public async getTemplateById(id: string): Promise<DocumentTemplate> {
    const template = await this.documentRepository.findTemplateById(id);
    if (!template) {
      throw new AppError('Template not found', 404);
    }
    return template;
  }

  public async createTemplate(data: any, userId: string): Promise<DocumentTemplate> {
    const existing = await this.documentRepository.findTemplateBySlug(data.slug);
    if (existing) {
      throw new AppError(`Template with slug '${data.slug}' already exists`, 400);
    }

    const template = await this.documentRepository.createTemplate({
      ...data,
      version: 1,
      createdBy: userId,
      updatedBy: userId,
    });

    // Write to history
    await this.documentRepository.createTemplateHistory({
      templateId: template.id,
      version: 1,
      htmlTemplate: template.htmlTemplate,
      cssTemplate: template.cssTemplate,
      variables: template.variables as any,
      pageSize: template.pageSize,
      orientation: template.orientation,
      changedBy: userId,
      changeReason: 'Initial Creation',
    });

    await writeAuditLog({
      userId,
      action: AuditAction.TEMPLATE_CREATED,
      entityType: 'document_template',
      entityId: template.id,
      details: `Created template '${template.name}'`,
    });

    return template;
  }

  public async updateTemplate(id: string, data: any, userId: string): Promise<DocumentTemplate> {
    const template = await this.getTemplateById(id);
    const newVersion = template.version + 1;

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== template.slug) {
      const existing = await this.documentRepository.findTemplateBySlug(data.slug);
      if (existing) {
        throw new AppError(`Template with slug '${data.slug}' already exists`, 400);
      }
    }

    const updatedTemplate = await this.documentRepository.updateTemplate(id, {
      name: data.name ?? template.name,
      slug: data.slug ?? template.slug,
      description: data.description ?? template.description,
      htmlTemplate: data.htmlTemplate ?? template.htmlTemplate,
      cssTemplate: data.cssTemplate ?? template.cssTemplate,
      pageSize: data.pageSize ?? template.pageSize,
      orientation: data.orientation ?? template.orientation,
      isDefault: data.isDefault ?? template.isDefault,
      status: data.status ?? template.status,
      variables: data.variables ?? template.variables,
      version: newVersion,
      updatedBy: userId,
    });

    // Write history record
    await this.documentRepository.createTemplateHistory({
      templateId: id,
      version: newVersion,
      htmlTemplate: updatedTemplate.htmlTemplate,
      cssTemplate: updatedTemplate.cssTemplate,
      variables: updatedTemplate.variables as any,
      pageSize: updatedTemplate.pageSize,
      orientation: updatedTemplate.orientation,
      changedBy: userId,
      changeReason: data.changeReason ?? 'Administrative Update',
    });

    await writeAuditLog({
      userId,
      action: AuditAction.TEMPLATE_UPDATED,
      entityType: 'document_template',
      entityId: id,
      details: `Updated template '${updatedTemplate.name}' to version ${newVersion}`,
    });

    return updatedTemplate;
  }

  public async duplicateTemplate(id: string, newName: string, newSlug: string, userId: string): Promise<DocumentTemplate> {
    const template = await this.getTemplateById(id);

    const data = {
      name: newName,
      slug: newSlug,
      category: template.category,
      type: template.type,
      description: `Duplicate of ${template.name}. ${template.description ?? ''}`,
      htmlTemplate: template.htmlTemplate,
      cssTemplate: template.cssTemplate,
      pageSize: template.pageSize,
      orientation: template.orientation,
      isDefault: false,
      variables: template.variables as any,
    };

    return this.createTemplate(data, userId);
  }

  public async restoreTemplateVersion(id: string, version: number, userId: string): Promise<DocumentTemplate> {
    const template = await this.getTemplateById(id);
    const history = await this.documentRepository.findTemplateHistoryByVersion(id, version);
    if (!history) {
      throw new AppError(`Historical version ${version} not found for this template`, 404);
    }

    const updatedTemplate = await this.updateTemplate(
      id,
      {
        htmlTemplate: history.htmlTemplate,
        cssTemplate: history.cssTemplate,
        variables: history.variables as any,
        pageSize: history.pageSize,
        orientation: history.orientation,
        changeReason: `Restored back to version ${version}`,
      },
      userId
    );

    await writeAuditLog({
      userId,
      action: AuditAction.TEMPLATE_VERSION_RESTORED,
      entityType: 'document_template',
      entityId: id,
      details: `Restored template '${template.name}' to version ${version}`,
    });

    return updatedTemplate;
  }

  // --- Dynamic Live Preview Renderer ---

  public async previewTemplate(htmlTemplate: string, cssTemplate: string, variables: Record<string, any>): Promise<string> {
    // Generate a mock QR Code for previews
    const mockQrBase64 = await QRCode.toDataURL('http://deukhuri.edu.np/verify/preview-mock-id');
    const enrichedVariables = {
      ...variables,
      'document.number': 'CERT-YYYY-00000',
      'document.id': 'preview-mock-id',
      'document.qrCode': mockQrBase64,
      'date.current': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };

    return this.compileHTML(htmlTemplate, cssTemplate, enrichedVariables);
  }

  // --- Document Generation Engine ---

  public async generateDocument(
    templateId: string,
    studentId?: string,
    teacherId?: string,
    customVars: Record<string, any> = {},
    userId?: string
  ): Promise<GeneratedDocument> {
    const template = await this.getTemplateById(templateId);

    // Resolve system variables: School profile, Branding, Target details
    const resolvedVars = await this.resolveVariables(template.category, studentId, teacherId, customVars);

    // Generate unique serial document number
    const count = await prisma.generatedDocument.count();
    const year = new Date().getFullYear();
    const serial = String(count + 1).padStart(5, '0');
    const documentNumber = `CERT-${year}-${serial}`;

    // Create a temporary ID to embed in the QR code verification URL before final save
    const tempId = crypto.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${tempId}`;

    // Generate high-quality QR code data URL
    const qrBase64 = await QRCode.toDataURL(verificationUrl);

    // Populate final context variables
    const finalVars = {
      ...resolvedVars,
      'document.number': documentNumber,
      'document.id': tempId,
      'document.qrCode': qrBase64,
      'date.current': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };

    // Compile templates HTML
    const compiledHTML = this.compileHTML(template.htmlTemplate, template.cssTemplate, finalVars);

    // Render HTML to PDF Buffer
    const pdfBuffer = await this.pdfService.generatePDF(compiledHTML, {
      pageSize: template.pageSize,
      orientation: template.orientation,
    });

    // Upload PDF to Cloudinary
    let pdfUrl = '';
    try {
      pdfUrl = await uploadDocumentBuffer(pdfBuffer, `documents/${template.category.toLowerCase()}`);
    } catch (err) {
      logger.error('Failed uploading PDF to Cloudinary, falling back to local file storage path simulation.', err);
      // Fallback url
      pdfUrl = `/uploads/documents/${tempId}.pdf`;
    }

    // Save document to DB
    const doc = await this.documentRepository.createGeneratedDocument({
      id: tempId,
      templateId: template.id,
      studentId: studentId || null,
      teacherId: teacherId || null,
      generatedBy: userId || 'system',
      documentNumber,
      htmlSnapshot: compiledHTML,
      pdfPath: pdfUrl,
      variablesUsed: finalVars as any,
      status: 'ISSUED',
    });

    await writeAuditLog({
      userId,
      action: AuditAction.DOCUMENT_GENERATED,
      entityType: 'generated_document',
      entityId: doc.id,
      details: `Generated document #${documentNumber} from template '${template.name}'`,
    });

    return doc;
  }

  public async getGeneratedDocuments(filters: { studentId?: string; teacherId?: string; templateId?: string }): Promise<GeneratedDocumentWithRelations[]> {
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.teacherId) where.teacherId = filters.teacherId;
    if (filters.templateId) where.templateId = filters.templateId;
    
    return this.documentRepository.findGeneratedDocuments(where);
  }

  public async getGeneratedDocumentById(id: string): Promise<GeneratedDocumentWithRelations> {
    const doc = await this.documentRepository.findGeneratedDocumentById(id);
    if (!doc) {
      throw new AppError('Generated document not found', 404);
    }
    return doc;
  }

  public async verifyDocument(id: string) {
    const doc = await this.getGeneratedDocumentById(id);
    return {
      id: doc.id,
      documentNumber: doc.documentNumber,
      status: doc.status,
      generatedAt: doc.generatedAt,
      templateName: doc.template.name,
      category: doc.template.category,
      recipientName: doc.student 
        ? `${doc.student.firstName} ${doc.student.lastName}`
        : doc.teacher 
        ? `${doc.teacher.firstName} ${doc.teacher.lastName}`
        : 'Institution Client',
    };
  }

  // --- Variable Resolvers ---

  private async resolveVariables(
    category: string,
    studentId?: string,
    teacherId?: string,
    customVars: Record<string, any> = {}
  ): Promise<Record<string, any>> {
    const resolved: Record<string, any> = {};

    // 1. Fetch school profile & branding variables
    const school = await prisma.schoolProfile.findFirst();
    const branding = await this.brandingRepository.getOrCreate();
    const principal = await prisma.leadership.findUnique({ where: { role: 'PRINCIPAL' } });

    resolved['school.name'] = school?.name || 'Deukhuri Digital Campus';
    resolved['school.address'] = school?.address || 'Deukhuri, Dang';
    resolved['school.phone'] = school?.phone || '+977-82-XXXXXX';
    resolved['school.email'] = school?.email || 'info@deukhuri.edu.np';
    resolved['school.motto'] = school?.motto || 'Education for Excellence';
    resolved['school.logoUrl'] = branding?.logoUrl || '';
    resolved['school.stampUrl'] = branding?.stampUrl || '';
    resolved['principal.signatureUrl'] = principal?.signatureUrl || branding?.principalSignatureUrl || '';

    // 2. Fetch specific student or teacher variables
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          guardians: true,
          enrollments: {
            include: { class: true, section: true, academicYear: true },
            where: { academicYear: { isCurrent: true } },
          },
        },
      });

      if (student) {
        resolved['student.fullName'] = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
        resolved['student.admissionNumber'] = student.admissionNumber;
        resolved['student.gender'] = student.gender;
        resolved['student.dateOfBirth'] = student.dateOfBirth.toISOString().split('T')[0];
        
        const enrollment = student.enrollments[0] || (await prisma.enrollment.findFirst({
          where: { studentId },
          include: { class: true, section: true, academicYear: true },
          orderBy: { enrolledAt: 'desc' }
        }));

        resolved['student.class'] = enrollment?.class?.name || 'N/A';
        resolved['student.section'] = enrollment?.section?.name || 'N/A';
        resolved['student.rollNumber'] = enrollment?.rollNumber ? String(enrollment.rollNumber) : 'N/A';
        resolved['academicYear.label'] = enrollment?.academicYear?.label || new Date().getFullYear().toString();

        const father = student.guardians.find(g => g.relation === 'FATHER');
        const mother = student.guardians.find(g => g.relation === 'MOTHER');
        const guardian = student.guardians[0];
        resolved['student.guardianName'] = father?.fullName || mother?.fullName || guardian?.fullName || 'N/A';
      }
    } else if (teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        include: { department: true, designation: true },
      });

      if (teacher) {
        resolved['teacher.fullName'] = `${teacher.firstName} ${teacher.middleName ? teacher.middleName + ' ' : ''}${teacher.lastName}`;
        resolved['teacher.employeeId'] = teacher.employeeId;
        resolved['teacher.gender'] = teacher.gender;
        resolved['teacher.department'] = teacher.department.name;
        resolved['teacher.designation'] = teacher.designation.name;
        resolved['teacher.joiningDate'] = teacher.joiningDate.toISOString().split('T')[0];
      }
    }

    // 3. Map any custom/fallback variables passed directly
    for (const key of Object.keys(customVars)) {
      resolved[`custom.${key}`] = customVars[key];
    }

    return resolved;
  }

  // --- Dynamic Template Interpolator (Mustache Regex) ---

  private compileHTML(htmlTemplate: string, cssTemplate: string, variables: Record<string, any>): string {
    let rendered = htmlTemplate;

    // 1. Resolve conditional {{#if path}} ... {{else}} ... {{/if}} statements
    rendered = rendered.replace(/\{\{#if\s+([a-zA-Z0-9_\-\.]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g, (match, path, ifContent, elseContent) => {
      const parts = path.split('.');
      let current: any = variables;
      for (const part of parts) {
        if (current === null || current === undefined) {
          current = undefined;
          break;
        }
        current = current[part];
      }
      return current ? ifContent : (elseContent || '');
    });

    // 2. Resolve standard {{variable}} insertions
    rendered = rendered.replace(/\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/g, (match, path) => {
      const parts = path.split('.');
      let current = variables;
      for (const part of parts) {
        if (current === null || current === undefined) return '';
        current = current[part];
      }
      return current !== undefined && current !== null ? String(current) : '';
    });

    // 3. Output self-contained print HTML shell
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: transparent;
          }
          ${cssTemplate}
        </style>
      </head>
      <body>
        ${rendered}
      </body>
      </html>
    `;
  }

  // --- Master Code Template Seeding ---

  public async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplatesPath = path.join(__dirname, 'default-templates');
    if (!fs.existsSync(defaultTemplatesPath)) {
      logger.warn('Default templates source folder not found. Skipping auto-seeding.');
      return;
    }

    const styles = ['classic', 'formal', 'government', 'premium'];
    
    // Default variable schema for character certificates
    const defaultVars = [
      { name: 'student.fullName', label: 'Student Full Name', type: 'text', required: true },
      { name: 'student.guardianName', label: 'Guardian Full Name', type: 'text', required: true },
      { name: 'student.class', label: 'Class/Grade', type: 'text', required: true },
      { name: 'student.section', label: 'Section', type: 'text', required: true },
      { name: 'student.admissionNumber', label: 'Admission Reg ID', type: 'text', required: true },
      { name: 'student.rollNumber', label: 'Student Roll No', type: 'text', required: false },
      { name: 'custom.characterConduct', label: 'Conduct Conduct Behavior Rating', type: 'text', required: true, defaultValue: 'Excellent' },
    ];

    for (const style of styles) {
      const htmlPath = path.join(defaultTemplatesPath, style, 'character.html');
      const cssPath = path.join(defaultTemplatesPath, style, 'character.css');

      if (fs.existsSync(htmlPath) && fs.existsSync(cssPath)) {
        const slug = `${style}-character-certificate`;
        const name = `${style.charAt(0).toUpperCase() + style.slice(1)} Character Certificate`;
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const cssContent = fs.readFileSync(cssPath, 'utf8');

        const existing = await this.documentRepository.findTemplateBySlug(slug);
        if (!existing) {
          try {
            const template = await this.documentRepository.createTemplate({
              name,
              slug,
              category: 'ACADEMIC',
              type: 'CHARACTER_CERTIFICATE',
              description: `Official ${style} themed character certificate layout for graduating students.`,
              htmlTemplate: htmlContent,
              cssTemplate: cssContent,
              pageSize: 'A4',
              orientation: style === 'premium' ? 'LANDSCAPE' : 'PORTRAIT',
              isDefault: style === 'classic',
              variables: defaultVars as any,
              version: 1,
              createdBy: 'system',
              updatedBy: 'system',
            });

            await this.documentRepository.createTemplateHistory({
              templateId: template.id,
              version: 1,
              htmlTemplate: template.htmlTemplate,
              cssTemplate: template.cssTemplate,
              variables: template.variables as any,
              pageSize: template.pageSize,
              orientation: template.orientation,
              changedBy: 'system',
              changeReason: 'Seed Default System Layout',
            });

            logger.info(`Seeded template: ${name} (${slug})`);
          } catch (err: any) {
            if (err.code === 'P2002') {
              logger.info(`Template: ${name} (${slug}) already seeded concurrently.`);
            } else {
              throw err;
            }
          }
        } else {
          // If template exists and content changed on disk, update database record
          if (existing.htmlTemplate !== htmlContent || existing.cssTemplate !== cssContent) {
            const updatedVersion = existing.version + 1;
            await prisma.documentTemplate.update({
              where: { id: existing.id },
              data: {
                htmlTemplate: htmlContent,
                cssTemplate: cssContent,
                orientation: style === 'premium' || style === 'classic' ? 'LANDSCAPE' : 'PORTRAIT',
                version: updatedVersion,
              }
            });

            await this.documentRepository.createTemplateHistory({
              templateId: existing.id,
              version: updatedVersion,
              htmlTemplate: htmlContent,
              cssTemplate: cssContent,
              variables: existing.variables as any,
              pageSize: existing.pageSize,
              orientation: existing.orientation,
              changedBy: 'system',
              changeReason: 'System update to Deukhuri Public School brand design guidelines',
            });
            logger.info(`Synced existing default template '${name}' with Deukhuri brand updates (new version: ${updatedVersion}).`);
          }
        }
      }
    }
  }
}
export default DocumentService;
