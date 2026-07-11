# Faculty Management Engine API

Base path: `/api/v1/faculty`. All routes require authentication (`requireAuth`) plus one of the permissions below. All responses use the standard envelope: `{ success, message, data, errors }`.

Full design rationale: [faculty-engine-design-spec.md](../architecture/faculty-engine-design-spec.md). ER diagram: [faculty-engine-er-diagram.md](../architecture/faculty-engine-er-diagram.md).

| Permission | Grants |
|---|---|
| `teachers.read` | `GET` routes (teachers, departments, designations) |
| `teachers.create` | `POST /teachers`, `POST /teachers/photo-upload`, `POST /departments`, `POST /designations` |
| `teachers.update` | `PUT /teachers/:id`, non-terminal `POST /teachers/:id/status`, qualifications/emergency-contact management, `PUT`/archive/delete on departments and designations |
| `teachers.archive` | Terminal `POST /teachers/:id/status` (resigned/terminated/retired, including reversing back to active), `DELETE /teachers/:id`, archive/delete on departments and designations |
| `teachers.salary` | Read/write `basicSalary` — see [Salary field visibility](#salary-field-visibility) |
| `teachers.leave` | `GET`/`PATCH /teachers/:id/leave-balance` |
| `teachers.documents` | `POST /teachers/document-upload`, add/remove teacher documents |

`POST /teachers/:id/status` is gated at the route layer by `teachers.update` **or** `teachers.archive` (`requireAnyPermission`); the service picks the exact permission required by the target status (see [Status lifecycle](#status-lifecycle)).

## Audit logging

Every HR-record-level mutation writes an `AuditLog` row: `TEACHER_REGISTERED/UPDATED/STATUS_CHANGED/ARCHIVED`, `TEACHER_LEAVE_BALANCE_ADJUSTED`, and `DEPARTMENT_CREATED/UPDATED/ARCHIVED/DELETED`/`DESIGNATION_CREATED/UPDATED/ARCHIVED/DELETED`. Qualification/emergency-contact/document add-remove deliberately do **not** get their own audit rows — they're low-stakes profile sub-resources (same tier as a phone-number edit), not standalone HR events like a department reorg, a status change, or a leave-balance correction. Revisit this scoping if these sub-resources ever need their own compliance trail.

## Departments & Designations (reference data)

Same shape as the Academic Engine's `Subject`/`Class` — archive-only retirement, hard-delete blocked while referenced.

| Method | Path | Notes |
|---|---|---|
| POST | `/departments` | `{ name, code?, description? }` |
| GET | `/departments?includeArchived=` | |
| GET / PUT | `/departments/:id` | |
| POST | `/departments/:id/archive` | |
| DELETE | `/departments/:id` | `409` if any teacher references it |
| POST | `/designations` | `{ name, displayOrder, description? }` — `displayOrder` drives hierarchy sort (Principal, Vice Principal, HOD, ...) |
| GET | `/designations?includeArchived=` | |
| GET / PUT | `/designations/:id` | |
| POST | `/designations/:id/archive` | |
| DELETE | `/designations/:id` | `409` if any teacher references it |

## File uploads (plumbing only — no DB write)

### `POST /teachers/photo-upload`
Multipart, field `file`. Images only (JPEG/PNG/WEBP/SVG, 2MB max). Returns `{ photoUrl }`.

### `POST /teachers/document-upload`
Multipart, field `file`. Images or PDF (5MB max). Returns `{ fileUrl }`.

Both exist so a photo/document can be uploaded *before* the Teacher record exists (during the registration form), same reasoning as the Student Admission Engine's equivalents.

## Registration workflow

### `POST /teachers`
```json
{
  "departmentId": "uuid", "designationId": "uuid", "employmentType": "FULL_TIME", "joiningDate": "2020-01-15",
  "firstName": "Hari", "middleName": "", "lastName": "Oli", "dateOfBirth": "1985-05-10", "gender": "MALE",
  "photoUrl": "https://...", "bloodGroup": "O+",
  "phone": "9800000001", "email": "hari@example.com",
  "address": "...", "province": "...", "district": "...", "municipality": "...", "ward": "...",
  "basicSalary": 45000,
  "qualifications": [{ "degree": "Masters", "fieldOfStudy": "Mathematics", "institution": "TU", "yearCompleted": 2008 }],
  "emergencyContacts": [{ "name": "Sita Oli", "relation": "Spouse", "phone": "9800000002", "isPrimary": true }],
  "documents": [{ "documentType": "CITIZENSHIP", "fileUrl": "https://..." }]
}
```
`departmentId`/`designationId` are validated as existing and `ACTIVE` before anything is written. Generates `employeeId` (`{schoolProfile.shortName}-EMP-{seq}`, e.g. `DPS-EMP-0001`, falling back to `SCH-` if no short code is configured — a **global** sequence, not per-year, since staff persist across academic years unlike students). `phone` must be unique; `email` must be unique if provided — both checked with a friendly `409` before the unique-constraint race. `emergencyContacts` requires at least one entry; if none is marked `isPrimary`, the first one is defaulted to primary rather than rejected. `basicSalary` is silently dropped from the write if the caller lacks `teachers.salary` (not a validation error — see below). Creates the `Teacher`, its qualifications, emergency contacts, documents, and a zero-usage `TeacherLeaveBalance` atomically. Returns `201` with the full record.

## Teacher records

| Method | Path | Notes |
|---|---|---|
| GET | `/teachers?departmentId=&designationId=&status=&employmentType=&search=&skip=&take=` | `search` matches `firstName`, `lastName`, `employeeId`, `phone`, or `email` (case-insensitive contains). Paginated (`skip`/`take`, default 0/20, max 100). CSV export happens client-side against this endpoint (paginated fetch + browser-side CSV generation), same pattern as the Students registry — there is no dedicated `/export` route. |
| GET | `/teachers/summary` | `{ total, active, onLeave, suspended, terminal, joinedThisMonth }` — `terminal` counts `RESIGNED\|TERMINATED\|RETIRED` together. |
| GET | `/teachers/:id` | Includes `department`, `designation`, `qualifications`, `emergencyContacts`, `documents`, `leaveBalance`. |
| PUT | `/teachers/:id` | Profile fields only. Re-checks `phone`/`email` uniqueness if either is changed. |
| DELETE | `/teachers/:id` | `409` if the teacher is assigned to any `ClassSubject` — archive instead. |

### Status lifecycle
`POST /teachers/:id/status` — `{ status, leavingDate? }`.
- Transitions purely among `ACTIVE | ON_LEAVE | SUSPENDED` require `teachers.update`.
- Any transition **into or out of** a terminal status (`RESIGNED | TERMINATED | RETIRED`) requires `teachers.archive` — including reversing a terminal status back to `ACTIVE` (rehire), since reopening a closed record is as sensitive as closing one.
- Setting a terminal status sets `leavingDate` (defaults to now if omitted). Reversing back to `ACTIVE` clears it.
- Unlike the Student Admission Engine's `StudentStatus`, every terminal value here is reversible — this engine has no `Enrollment`-style history table a reopened record would corrupt, and staff rehire is a normal HR event.

### Salary field visibility
`basicSalary` is a forward-reference field (no Finance/Payroll Engine exists yet, same pattern as `Student.feeCategory`) gated by `teachers.salary` rather than `teachers.read`/`teachers.update`:
- **Write**: present in a request body but the caller lacks `teachers.salary` → silently dropped, not a `400`. Avoids leaking which fields exist to a role that shouldn't see them via a validation error message.
- **Read**: caller without `teachers.salary` gets the field **omitted entirely** from the response (not `null`), on both `GET /teachers` and `GET /teachers/:id` — so its absence never looks like "no salary set."

## Qualifications

| Method | Path |
|---|---|
| POST | `/teachers/:id/qualifications` — `{ degree, fieldOfStudy?, institution, yearCompleted }` |
| DELETE | `/teachers/:id/qualifications/:qualificationId` |

## Emergency contacts

| Method | Path | Notes |
|---|---|---|
| POST | `/teachers/:id/emergency-contacts` | `{ name, relation, phone, isPrimary? }`. Setting `isPrimary: true` clears the flag on every other contact for that teacher first (exactly one primary, enforced at the service layer). |
| PUT | `/teachers/:id/emergency-contacts/:contactId` | Same primary-clearing behavior on `isPrimary: true`. |
| DELETE | `/teachers/:id/emergency-contacts/:contactId` | `409` if it's the teacher's last remaining contact — a teacher must always have at least one. |

## Documents

| Method | Path |
|---|---|
| POST | `/teachers/:id/documents` — `{ documentType, fileUrl }` |
| DELETE | `/teachers/:id/documents/:documentId` |

## Leave balance (ledger only)

| Method | Path | Notes |
|---|---|---|
| GET | `/teachers/:id/leave-balance` | `{ annualEntitlement, sickEntitlement, casualEntitlement, annualUsed, sickUsed, casualUsed }` |
| PATCH | `/teachers/:id/leave-balance` | Any subset of the six fields above. This is a manual HR correction (e.g. year-start reset, carried-over days) — **not** a leave request/approval workflow. Requesting and approving leave is explicitly out of scope for this engine and belongs to the future Attendance Engine, which will decrement the `*Used` fields when it approves a leave. |

## Cross-engine: assigning a teacher to a subject

Faculty Management doesn't own this endpoint — it lives in the **Academic Engine** since `ClassSubject` is Academic Engine data:

### `POST /api/v1/academic-structure/class-subjects/:id/assign-teacher`
Permission: `academic.update`. Body: `{ teacherId: "uuid" | null }` (`null` unassigns). Validates the teacher exists and is `ACTIVE` before assigning — a `409` otherwise. This is the one deliberate, additive touch the Faculty Engine makes to the already-shipped Academic Engine: a nullable `teacherId` on `ClassSubject`, so "who teaches Grade 6 Math" has an answer without either engine redefining the other's data. See [design spec §2](../architecture/faculty-engine-design-spec.md#-resolved--this-engine-touches-classsubject).
