# Student Admission Engine — ER Diagram

`Student` is the outcome of the admission workflow (`backend/src/modules/students/`), not a bare CRUD entity. `academicYearId`, `classId`, and `sectionId` are foreign keys into the [Academic Engine](./academic-engine-er-diagram.md)'s reference data — this engine never redefines or duplicates those concepts, and validates them at write time via the Academic Engine's own repositories (see [ADR-005](./ADR-005-engine-based-architecture.md)).

```mermaid
erDiagram
    AcademicYear ||--o{ Student : "admits into"
    AcademicYear ||--o| AdmissionNumberSequence : "counts"
    Class ||--o{ Student : "places into"
    Section ||--o{ Student : "places into"
    Student ||--o{ StudentGuardian : "has"
    Student ||--o{ StudentDocument : "has"

    Student {
        string id PK
        string admissionNumber "unique, e.g. 2082/83-0001"
        string academicYearId FK
        string classId FK
        string sectionId FK
        string fullName
        datetime dateOfBirth
        enum gender "MALE | FEMALE | OTHER"
        string photoUrl "nullable"
        string address "nullable"
        string province "nullable"
        string district "nullable"
        string municipality "nullable"
        string ward "nullable"
        string bloodGroup "nullable"
        string allergies "nullable"
        string medicalConditions "nullable"
        string emergencyContactName "nullable"
        string emergencyContactPhone "nullable"
        string previousSchoolName "nullable"
        string previousSchoolBoard "nullable"
        string lastClassCompleted "nullable"
        string transferCertificateNumber "nullable"
        string feeCategory "nullable, forward reference — no Finance Engine yet"
        datetime admissionDate
        enum status "ACTIVE | INACTIVE | TRANSFERRED | GRADUATED | WITHDRAWN"
    }

    StudentGuardian {
        string id PK
        string studentId FK
        enum relation "FATHER | MOTHER | GUARDIAN, unique per student"
        string fullName
        string phone
        string email "nullable"
        string occupation "nullable"
        string address "nullable"
    }

    StudentDocument {
        string id PK
        string studentId FK
        enum documentType "BIRTH_CERTIFICATE | TRANSFER_CERTIFICATE | CHARACTER_CERTIFICATE | PHOTO | OTHER"
        string fileUrl
        datetime uploadedAt
    }

    AdmissionNumberSequence {
        string academicYearId PK, FK
        int lastNumber "incremented transactionally with each admission"
    }
```

## Notes
- **Admission number format**: `{academicYear.label}-{sequence padded to 4 digits}` (e.g. `2082/83-0001`). `AdmissionNumberSequence` is incremented inside the same DB transaction as the `Student` (+ `StudentGuardian[]` + `StudentDocument[]`) create in `student.repository.ts#admit`, so concurrent admissions can't collide. It has no CRUD surface — it's internal to the admission workflow.
- **`StudentGuardian` is fixed-relation, not a flexible contact list**: `@@unique([studentId, relation])` means at most one Father, one Mother, and one Guardian row per student. Adding a second Father record is rejected (409), matching a paper admission form's fixed slots.
- **`status` is a real lifecycle, not reference-data's ACTIVE/ARCHIVED**: it captures *why* a student is no longer active (graduated vs. withdrawn vs. transferred to another school), which reference data doesn't need to track. Hard-delete (`DELETE /students/:id`) cascades to `StudentGuardian`/`StudentDocument` — unlike Class/Section, a student's guardians/documents have no independent meaning once the student record is gone, so there's no "zero references" delete guard.
- **`feeCategory` is a deliberate forward reference**: plain `String?` for now (e.g. "Regular", "Scholarship"), since no Finance Engine exists yet to own a proper `FeeCategory` reference table. Migrate to a FK once that Engine exists.
- **Photo/document uploads are decoupled from the Student record**: `POST /students/photo-upload` and `POST /students/document-upload` just run the Cloudinary upload and return a URL — no DB write, no `studentId` required. This lets the admission form collect a photo/documents *before* the Student exists; the resulting URLs go into the final `POST /students/admission` payload (or a later `POST /students/:id/documents` call).
