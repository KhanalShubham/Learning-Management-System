# Academic Engine — ER Diagram

Reference data owned exclusively by the Academic Engine (`backend/src/modules/academic-structure/`). Downstream engines (Student Admission, Attendance, Examination, Finance) hold foreign keys into these tables only — they never redefine or duplicate class/section/subject concepts. See [ADR-005](./ADR-005-engine-based-architecture.md).

```mermaid
erDiagram
    AcademicYear ||--o{ Class : "scopes"
    AcademicYear ||--o{ ExamType : "scopes"
    Class ||--o{ Section : "has"
    Class ||--o{ ClassSubject : "has"
    Subject ||--o{ ClassSubject : "assigned via"

    AcademicYear {
        string id PK
        string label
        datetime startDate
        datetime endDate
        boolean isCurrent
        enum status "ACTIVE | ARCHIVED"
    }

    Class {
        string id PK
        string academicYearId FK
        string name
        int displayOrder
        string description "nullable"
        enum status "ACTIVE | ARCHIVED"
    }

    Section {
        string id PK
        string classId FK
        string name
        int capacity "nullable"
        string roomNumber "nullable"
        enum status "ACTIVE | ARCHIVED"
    }

    Subject {
        string id PK
        string name
        string code "nullable, global catalog — not year-scoped"
        string description "nullable"
        boolean isOptional
        enum status "ACTIVE | ARCHIVED"
    }

    ClassSubject {
        string id PK
        string classId FK
        string subjectId FK
        int fullMarks
        int passMarks
        boolean hasPractical
        int theoryMarks "nullable, required if hasPractical"
        int practicalMarks "nullable, required if hasPractical"
        int practicalPassMarks "nullable, required if hasPractical"
    }

    ExamType {
        string id PK
        string academicYearId FK
        string name
        string code "nullable, e.g. FT / MT / FINAL"
        string description "nullable"
        int displayOrder
        float weightage
        boolean isPublished
        enum status "ACTIVE | ARCHIVED"
    }
```

## Notes
- **`Subject` is global, not year-scoped** — the same subject catalog entry is reused across academic years via `ClassSubject`. `Class`, `Section` (indirectly, via Class), and `ExamType` are year-scoped.
- **Split pass marks on `ClassSubject`**: when `hasPractical` is true, `theoryMarks + practicalMarks` must equal `fullMarks`, and a student must pass theory and practical separately (`passMarks` for theory, `practicalPassMarks` for practical) — not a single combined threshold.
- **`ExamType` is a template, not an instance**: it defines *what kinds* of exams exist for an academic year (First Terminal, Mid-Term, Final, Practical, Internal Assessment) with a weightage. Scheduled exam instances (ExamType × Date × Class × Section) belong to the future Examination Engine and are not modeled here.
- **Archive-only retirement**: `Class`, `Section`, `Subject`, and `ExamType` never hard-delete while referenced elsewhere; they get archived (`status: ARCHIVED`) and excluded from default list queries.
