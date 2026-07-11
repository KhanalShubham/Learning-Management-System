import { prisma } from '@/prisma/client';
import { Prisma, DocumentTemplate, DocumentTemplateHistory, GeneratedDocument } from '@prisma/client';

// Custom type including relations for generated document validation
export type GeneratedDocumentWithRelations = Prisma.GeneratedDocumentGetPayload<{
  include: {
    template: {
      select: {
        name: true;
        category: true;
        type: true;
        pageSize: true;
        orientation: true;
      };
    };
    student: {
      select: {
        firstName: true;
        middleName: true;
        lastName: true;
        admissionNumber: true;
      };
    };
    teacher: {
      select: {
        firstName: true;
        middleName: true;
        lastName: true;
        employeeId: true;
      };
    };
  };
}>;

export interface IDocumentRepository {
  // Templates
  findTemplates(where?: Prisma.DocumentTemplateWhereInput): Promise<DocumentTemplate[]>;
  findTemplateById(id: string): Promise<DocumentTemplate | null>;
  findTemplateBySlug(slug: string): Promise<DocumentTemplate | null>;
  createTemplate(data: Prisma.DocumentTemplateCreateInput): Promise<DocumentTemplate>;
  updateTemplate(id: string, data: Prisma.DocumentTemplateUpdateInput): Promise<DocumentTemplate>;
  
  // History
  createTemplateHistory(data: Prisma.DocumentTemplateHistoryUncheckedCreateInput): Promise<DocumentTemplateHistory>;
  findTemplateHistoryByVersion(templateId: string, version: number): Promise<DocumentTemplateHistory | null>;
  
  // Generated Documents
  createGeneratedDocument(data: Prisma.GeneratedDocumentUncheckedCreateInput): Promise<GeneratedDocument>;
  findGeneratedDocumentById(id: string): Promise<GeneratedDocumentWithRelations | null>;
  findGeneratedDocumentByNumber(documentNumber: string): Promise<GeneratedDocumentWithRelations | null>;
  findGeneratedDocuments(where?: Prisma.GeneratedDocumentWhereInput): Promise<GeneratedDocumentWithRelations[]>;
  updateGeneratedDocument(id: string, data: Prisma.GeneratedDocumentUpdateInput): Promise<GeneratedDocument>;
}

export class DocumentRepository implements IDocumentRepository {
  public async findTemplates(where?: Prisma.DocumentTemplateWhereInput): Promise<DocumentTemplate[]> {
    return prisma.documentTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  public async findTemplateById(id: string): Promise<DocumentTemplate | null> {
    return prisma.documentTemplate.findUnique({
      where: { id },
      include: {
        histories: {
          orderBy: { version: 'desc' },
          select: {
            id: true,
            version: true,
            changeReason: true,
            createdAt: true,
          },
        },
      },
    });
  }

  public async findTemplateBySlug(slug: string): Promise<DocumentTemplate | null> {
    return prisma.documentTemplate.findUnique({
      where: { slug },
    });
  }

  public async createTemplate(data: Prisma.DocumentTemplateCreateInput): Promise<DocumentTemplate> {
    return prisma.documentTemplate.create({ data });
  }

  public async updateTemplate(id: string, data: Prisma.DocumentTemplateUpdateInput): Promise<DocumentTemplate> {
    return prisma.documentTemplate.update({
      where: { id },
      data,
    });
  }

  public async createTemplateHistory(
    data: Prisma.DocumentTemplateHistoryUncheckedCreateInput
  ): Promise<DocumentTemplateHistory> {
    return prisma.documentTemplateHistory.create({ data });
  }

  public async findTemplateHistoryByVersion(
    templateId: string,
    version: number
  ): Promise<DocumentTemplateHistory | null> {
    return prisma.documentTemplateHistory.findUnique({
      where: {
        templateId_version: {
          templateId,
          version,
        },
      },
    });
  }

  public async createGeneratedDocument(
    data: Prisma.GeneratedDocumentUncheckedCreateInput
  ): Promise<GeneratedDocument> {
    return prisma.generatedDocument.create({ data });
  }

  public async findGeneratedDocumentById(id: string): Promise<GeneratedDocumentWithRelations | null> {
    return prisma.generatedDocument.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            type: true,
            pageSize: true,
            orientation: true,
          },
        },
        student: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    }) as Promise<GeneratedDocumentWithRelations | null>;
  }

  public async findGeneratedDocumentByNumber(documentNumber: string): Promise<GeneratedDocumentWithRelations | null> {
    return prisma.generatedDocument.findUnique({
      where: { documentNumber },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            type: true,
            pageSize: true,
            orientation: true,
          },
        },
        student: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    }) as Promise<GeneratedDocumentWithRelations | null>;
  }

  public async findGeneratedDocuments(where?: Prisma.GeneratedDocumentWhereInput): Promise<GeneratedDocumentWithRelations[]> {
    return prisma.generatedDocument.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            type: true,
            pageSize: true,
            orientation: true,
          },
        },
        student: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    }) as Promise<GeneratedDocumentWithRelations[]>;
  }

  public async updateGeneratedDocument(
    id: string,
    data: Prisma.GeneratedDocumentUpdateInput
  ): Promise<GeneratedDocument> {
    return prisma.generatedDocument.update({
      where: { id },
      data,
    });
  }
}
