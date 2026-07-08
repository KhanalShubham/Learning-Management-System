# Faculty Management Engine — ER Diagram

Reference data (`Department`, `Designation`) and workflow data (`Teacher` and its child records) owned exclusively by the Faculty Management Engine (`backend/src/modules/faculty/`). One deliberate, additive exception to strict ownership: `ClassSubject` (owned by the Academic Engine) holds a nullable `teacherId` FK into this engine — see [ADR-005](./ADR-005-engine-based-architecture.md) principle 7 and the [design spec](./faculty-engine-design-spec.md#-resolved--this-engine-touches-classsubject).

```mermaid
erDiagram
    Department ||--o{ Teacher : "employs"
    Designation ||--o{ Teacher : "ranks"
    Teacher ||--o{ TeacherQualification : "has"
    Teacher ||--o{ TeacherEmergencyContact : "has"
    Teacher ||--o{ TeacherDocument : "has"
    Teacher ||--|| TeacherLeaveBalance : "tracks"
    Teacher ||--o{ ClassSubject : "optionally teaches"

    Department {
        string id PK
        string name UK
        string code UK "nullable"
        string description "nullable"
        enum status "ACTIVE | ARCHIVED"
    }

    Designation {
        string id PK
        string name UK
        int displayOrder
        string description "nullable"
        enum status "ACTIVE | ARCHIVED"
    }

    Teacher {
        string id PK
        string employeeId UK
        string firstName
        string middleName "nullable"
        string lastName
        datetime dateOfBirth
        enum gender "MALE | FEMALE | OTHER"
        string photoUrl "nullable"
        string bloodGroup "nullable"
        string phone UK
        string email UK "nullable"
        string departmentId FK
        string designationId FK
        enum employmentType "FULL_TIME | PART_TIME | CONTRACT | VISITING"
        datetime joiningDate
        datetime leavingDate "nullable"
        enum status "ACTIVE | ON_LEAVE | SUSPENDED | RESIGNED | TERMINATED | RETIRED"
        decimal basicSalary "nullable, forward reference — no Finance Engine yet"
    }

    TeacherQualification {
        string id PK
        string teacherId FK
        string degree
        string fieldOfStudy "nullable"
        string institution
        int yearCompleted
    }

    TeacherEmergencyContact {
        string id PK
        string teacherId FK
        string name
        string relation
        string phone
        boolean isPrimary "exactly one true per teacher, service-enforced"
    }

    TeacherDocument {
        string id PK
        string teacherId FK
        enum documentType "CITIZENSHIP | ACADEMIC_CERTIFICATE | EXPERIENCE_LETTER | APPOINTMENT_LETTER | PAN_CARD | PHOTO | OTHER"
        string fileUrl
        datetime uploadedAt
    }

    TeacherLeaveBalance {
        string teacherId PK,FK
        int annualEntitlement
        int sickEntitlement
        int casualEntitlement
        int annualUsed
        int sickUsed
        int casualUsed
    }

    EmployeeNumberSequence {
        string id PK "fixed singleton row"
        int lastNumber
    }
```

`EmployeeNumberSequence` has no FK to `Teacher` (unlike `AdmissionNumberSequence` → `AcademicYear`) — it's a single global counter, not scoped per academic year, since staff persist across years unlike students.

Not modeled here, and explicitly out of scope for this engine:
- **Leave requests/approval** — balance only; the workflow belongs to the future Attendance Engine.
- **Payroll/payslips** — `basicSalary` is a bare reference field; processing belongs to the future Finance Engine.
- **Timetabling** ("Teacher X teaches Section A on Monday period 3") — no engine owns this yet.
