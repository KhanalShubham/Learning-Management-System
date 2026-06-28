# Controllers Directory

## 🎯 Purpose
The Controllers layer handles the HTTP presentation layer. It acts as the bridge between incoming client requests and the core backend business logic.

## 📋 Responsibilities
- Parse incoming HTTP requests (extract parameters, query options, and request bodies).
- Map request data objects to services.
- Invoke standard Zod validation schemas to verify request bounds.
- Format and return standardized API JSON payloads (`successResponse` and `errorResponse`).
- Capture unexpected execution failures and route them to the global Express error-handler middleware.

## 💻 Example Usage
```typescript
import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/api-response';
import { studentService } from '@/services/student.service';

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentData = req.body;
    const newStudent = await studentService.registerStudent(studentData);
    
    return successResponse(res, 'Student created successfully.', newStudent, 201);
  } catch (error) {
    next(error); // Route to global handler
  }
};
```
