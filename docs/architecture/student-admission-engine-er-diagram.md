# Student Admission Engine — ER Diagram

`Student` is the outcome of the admission workflow (`backend/src/modules/students/`), not a bare CRUD entity. `academicYearId`, `classId`, and `sectionId` never live directly on `Student` — they're captured per year on `Enrollment`, a foreign key into the [Academic Engine](./academic-engine-er-diagram.md)'s reference data, validated at write time via the Academic Engine's own repositories (see [ADR-005](./ADR-005-engine-based-architecture.md)).

```mermaid
erDiagram
    Student ||--o{ Enrollment : "placed via"
    AcademicYear ||--o{ Enrollment : "scopes"
    AcademicYear ||--o| AdmissionNumberSequence : "counts"
    Class ||--o{ Enrollment : "places into"
    Section ||--o{ Enrollment : "places into"
    Student ||--o{ StudentGuardian : "has"
    Student ||--o{ StudentDocument : "has"

    Student {
        string id PK
        string admissionNumber "unique, e.g. DPS-2025-0001"
        string firstName
        string middleName "nullable"
        string lastName
        datetime dateOfBirth
        enum gender "MALE | FEMALE | OTHER"
        string photoUrl "nullable"
        string address "nullable, permanent"
        string province "nullable, permanent"
        string district "nullable, permanent"
        string municipality "nullable, permanent"
        string ward "nullable, permanent"
        string temporaryAddress "nullable"
        string temporaryProvince "nullable"
        string temporaryDistrict "nullable"
        string temporaryMunicipality "nullable"
        string temporaryWard "nullable"
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

    Enrollment {
        string id PK
        string studentId FK
        string academicYearId FK
        string classId FK
        string sectionId FK
        int rollNumber "nullable, unique per (academicYearId, sectionId)"
        datetime enrolledAt
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
- **`Enrollment` exists so promotion doesn't erase history.** An earlier version of this engine put `classId`/`sectionId` directly on `Student`; moving a student to the next grade would have overwritten that with no record of where they were the year before. `@@unique([studentId, academicYearId])` — one enrollment per student per year. Admission creates exactly one `Enrollment` row; a future Promotion engine creates the next year's row, a future Transfer engine closes one out. Nothing in this sprint reads "the current enrollment" yet — that logic belongs to whichever engine consumes it first (Attendance, Examination).
- **`rollNumber` lives on `Enrollment`, not `Student`** — it's a per-year, per-section number, not a permanent student attribute. `@@unique([academicYearId, sectionId, rollNumber])`; Postgres treats multiple `NULL`s as distinct, so leaving it unset never collides.
- **Admission number format**: `{schoolProfile.shortName}-{academicYear.startDate's Gregorian year}-{sequence padded to 4 digits}` (e.g. `DPS-2025-0001`). Falls back to `SCH` if the school hasn't set a short code yet — admission is never blocked on that being configured. `AdmissionNumberSequence` is still keyed by `academicYearId` and incremented inside the same transaction as the `Student` + `Enrollment` + `StudentGuardian[]` + `StudentDocument[]` create (`student.repository.ts#admit`), so concurrent admissions can't collide. Duplicate roll number in the same section/year surfaces as a clean `409`, not a raw constraint error (caught in `student.service.ts#admitStudent`).
- **`StudentGuardian` is fixed-relation, not a flexible contact list**: `@@unique([studentId, relation])` means at most one Father, one Mother, and one Guardian row per student. Adding a second Father record is rejected (409), matching a paper admission form's fixed slots. Considered and explicitly rejected a flatter `fatherName`/`motherName`/`guardianName`-as-columns model — it can't hold separate contact info per guardian.
- **`status` is a real lifecycle, not reference-data's ACTIVE/ARCHIVED**: it captures *why* a student is no longer active (graduated vs. withdrawn vs. transferred to another school), which reference data doesn't need to track. Hard-delete (`DELETE /students/:id`) cascades to `Enrollment`/`StudentGuardian`/`StudentDocument` — unlike Class/Section, these have no independent meaning once the student record is gone, so there's no "zero references" delete guard.
- **`feeCategory` is a deliberate forward reference**: plain `String?` for now (e.g. "Regular", "Scholarship"), since no Finance Engine exists yet to own a proper `FeeCategory` reference table. Migrate to a FK once that Engine exists.
- **Photo/document uploads are decoupled from the Student record**: `POST /students/photo-upload` and `POST /students/document-upload` just run the Cloudinary upload and return a URL — no DB write, no `studentId` required. This lets the admission form collect a photo/documents *before* the Student exists; the resulting URLs go into the final `POST /students/admission` payload (or a later `POST /students/:id/documents` call).
