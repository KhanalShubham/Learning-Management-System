# Services Directory

## 🎯 Purpose
The Services layer acts as the core business logic motor of the application. It orchestrates processing rules, domain calculations, database transactions, and coordinates integrations.

## 📋 Responsibilities
- Implement strict business processing algorithms.
- Orchestrate database transactions and rollbacks.
- Interact with repositories using abstractions to fetch and mutate model records.
- Handle business rule verification and throw custom `AppError` exceptions if rules are violated.
- Interface with third-party service providers (like mailing, storage, or processing gateways).

## 💻 Example Usage
```typescript
import { IStudentRepository } from '@/interfaces/student-repo.interface';
import { AppError } from '@/middleware/error.middleware';

export class StudentService {
  constructor(private studentRepo: IStudentRepository) {}

  public async registerStudent(data: any) {
    const existing = await this.studentRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email address is already in use.', 400);
    }
    
    return this.studentRepo.create(data);
  }
}
```
