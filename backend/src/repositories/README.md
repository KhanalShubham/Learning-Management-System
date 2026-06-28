# Repositories Directory

## 🎯 Purpose
The Repositories layer isolates and manages the details of database access, queries, and filters. It encapsulates physical query commands behind type-safe interfaces.

## 📋 Responsibilities
- Direct data querying using Prisma Client singleton instance maps.
- Encapsulate physical query details (joins, filters, projections) away from the service layer.
- Implement abstract contracts/interfaces defining model access shapes.

## 💻 Example Usage
```typescript
import { prisma } from '@/prisma/client';
import { IStudentRepository } from '@/interfaces/student-repo.interface';

export class StudentRepository implements IStudentRepository {
  public async findByEmail(email: string) {
    return prisma.student.findUnique({
      where: { email }
    });
  }

  public async create(data: any) {
    return prisma.student.create({
      data
    });
  }
}
```
