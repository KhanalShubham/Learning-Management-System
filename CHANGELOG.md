# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Conventions used from this entry onward
- **Release Statistics** — a rough scale snapshot (endpoints, models, pages, components, permissions) for entries substantial enough to warrant one. Counts are for what that entry actually added, not cumulative totals — entries before this convention don't have one.
- **Breaking** — called out under a release when an API/schema shape changes in a way that isn't backward-compatible.
- **Migration** — commands a collaborator needs to run after pulling a release that touches the database or dependencies.

---

## [0.7.0] - 2026-07-09
### Added
- **Attendance Engine (Sprint 7.1, 7.2, 7.3)** (`backend/src/modules/attendance/` and `frontend/src/features/attendance/`) — Full backend rules, calendar logic, locks, horizontal registers compiling, and responsive frontend screens.
  - **`Holiday` and `AttendanceLock` models** in schema. prisma supporting custom school calendar closures and automated session lockouts.
  - **Nepal Calendar Restrictions**: blocks daily marking on weekends (Saturdays) or active holidays with custom error messages.
  - **Roster Locks**: Gates daily edit writes under `403 Forbidden` if a roster is locked, permitting only users holding Admin/Super Admin bypass credentials to override edits.
  - **Monthly Register Grid Matrix**: horizontal spreadsheet matrix mapping individual daily statuses (P, A, L, H, OL) dynamically over days 1–31 and compiling aggregate rates.
  - **Dashboard Analytics**: computes attendance rates, marked lists checklists, recent absentees today, and calendar settings forms.
  - **Authorized CSV Exports**: downloads registers spreadsheet documents with authorized Bearer Token integration.
- **Faculty Management Engine** (`backend/src/modules/faculty/`) — Engine 6 in the build order, closing Milestone 6. Full design spec: [faculty-engine-design-spec.md](docs/architecture/faculty-engine-design-spec.md); ER diagram: [faculty-engine-er-diagram.md](docs/architecture/faculty-engine-er-diagram.md); API reference: [docs/api/faculty.md](docs/api/faculty.md).
  - **Department** and **Designation** reference data, same archive-only-retirement shape as the Academic Engine's `Subject`/`Class` (`RecordStatus`, hard-delete blocked while any `Teacher` references it).
  - **Teacher registration workflow** (`POST /faculty/teachers`, not bare CRUD) — generates a global `employeeId` (`{schoolProfile.shortName}-EMP-{seq}`, e.g. `DPS-EMP-0001`) via a new `EmployeeNumberSequence` singleton counter inside the same transaction as the Teacher/qualifications/emergency-contacts/documents/leave-balance create, the same collision-safe shape as Student admission numbers. Unlike admission numbers, this sequence is **global, not per-academic-year** — staff persist across years.
  - **`TeacherStatus` lifecycle** (`ACTIVE | ON_LEAVE | SUSPENDED | RESIGNED | TERMINATED | RETIRED`) — deliberately **reversible** on every terminal value (rehire case), unlike `StudentStatus`'s one-way terminal states, since this engine has no `Enrollment`-style history a reopened record would corrupt. Any transition into or out of a terminal status requires `teachers.archive`; transitions among the three active-ish statuses only need `teachers.update`.
  - **Emergency contacts as a child table** (`TeacherEmergencyContact`, multiple rows, one `isPrimary`) rather than Student's fixed inline fields — a teacher can list more than one contact. Cardinality (exactly one primary, at least one contact) is enforced at the service layer.
  - **`basicSalary`** — a forward-reference field (no Finance/Payroll Engine yet, same pattern as `Student.feeCategory`), gated behind a dedicated `teachers.salary` permission rather than `teachers.read`/`teachers.update`: stripped silently from writes and **omitted entirely** (not null-masked) from reads when the caller lacks it.
  - **Leave balance ledger only** (`TeacherLeaveBalance` — entitlement/used counters, `GET`/`PATCH .../leave-balance`) — deliberately does **not** include a request/approval workflow; that's scoped to the future Attendance Engine, which will decrement the `*Used` fields when it approves a leave.
  - **Cross-engine touch on the Academic Engine**: additive, nullable `teacherId` on `ClassSubject` plus `POST /academic-structure/class-subjects/:id/assign-teacher` (validates the teacher exists and is `ACTIVE`). The one deliberate exception to "don't redesign shipped engines" — `ClassSubjectService` now composes `ITeacherRepository`, the same downstream-composes-upstream pattern as Student Admission validating Class/Section.
  - **Permissions**: `teachers.salary`, `teachers.leave`, `teachers.documents` added; `teachers.delete` renamed to `teachers.archive` to match the `academic.archive`/`students.archive` convention (see Breaking, below).
  - New `requireAnyPermission()` and `hasPermission()` helpers on the shared auth middleware — `hasPermission` lets a controller branch behavior (salary-field stripping) instead of hard-rejecting; `requireAnyPermission` gates the status endpoint where the exact required permission depends on the request body.
- **Faculty Management Engine frontend** (`frontend/src/features/faculty/`) — Teacher Directory Dashboard (stat tiles, recently-joined list, quick actions), Teachers registry (search/filter by department/designation/status/employment-type, pagination, CSV export), Teacher Registration form (employment, identity, address, permission-gated salary field, qualifications, emergency contacts, documents), Teacher Detail page (Profile edit, Qualifications, Emergency Contacts, Documents, Leave Balance tabs, status lifecycle, archive/delete), and Department/Designation reference-data admin pages. Routed under `/teachers`, `/teachers/list`, `/teachers/new`, `/teachers/:id`, `/teachers/departments`, `/teachers/designations`, replacing the placeholder mock table that previously lived at `/teachers`.
### Fixed
- `frontend/src/features/auth/types/index.ts`'s `Permission` union still had the old `teachers.delete` and was missing `teachers.salary`/`teachers.leave`/`teachers.documents` — synced to match the backend seed.
- **Gap analysis before closing this milestone** surfaced and fixed:
  - `teacher.service.ts`'s `deleteQualification`/`deleteDocument` deleted by ID with no ownership check, so a wrong-teacher or nonexistent ID fell through to an unhandled Prisma `P2025` and leaked as a generic 500 instead of a clean 404 — now verified against `teacherId` first, matching the existing `deleteEmergencyContact` pattern.
  - Department/Designation CRUD and leave-balance adjustments wrote no audit log, despite the design spec's Definition of Done requiring one on every mutating endpoint. Added `DEPARTMENT_CREATED/UPDATED/ARCHIVED/DELETED`, `DESIGNATION_CREATED/UPDATED/ARCHIVED/DELETED`, and `TEACHER_LEAVE_BALANCE_ADJUSTED` to `AuditAction` and wired `writeAuditLog` calls into both controllers.
  - `TeacherDetail`'s status dropdown listed all six statuses to any `teachers.update`-or-`teachers.archive` holder; a `teachers.update`-only user selecting a terminal status got a raw backend 403. The dropdown now only offers terminal options (and only stays enabled on an already-terminal record) to callers holding `teachers.archive`.
  - `Departments`/`Designations` pages rendered Add/Edit/Archive/Delete controls to every signed-in user reaching the page (gated only by `teachers.read`), instead of the `teachers.create`/`update`/`archive` split documented in `docs/api/faculty.md`. Added the missing permission checks and `aria-label`s on the icon-only action buttons.
- **Repository-wide `tsc -b` build failure** — `z.coerce.number().optional()` fields inside a Zod schema infer as `unknown` on the *input* side (zod v4's coercion contract), which broke structural assignability against `@hookform/resolvers` v5's `Resolver` type whenever a form's `useForm<Fields>()` generic used the schema's *output* type (`z.infer`/`z.output`) instead of its *input* type. This surfaced across every form using `z.coerce`, not just Faculty's — `StudentAdmission.tsx`, `ClassesAndSections.tsx`, `ClassSubjects.tsx`, and `SchoolProfile.tsx` were already broken on `develop` before this milestone. One architectural fix applied everywhere: `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>(...)` — RHF's third generic (added in v7.55, `TTransformedValues`) carries the post-coercion type through to `handleSubmit`'s callback, while the first generic keeps `register`/`watch`/`errors` aligned with what's actually typed into the inputs.
- `pages/Dashboard.tsx` indexed its showcase stats object with `useEffectiveRole()`'s `'super_admin' | 'admin'` return type, but the object only had an `admin` key — a real (unrelated) type error, fixed by aliasing `super_admin` to the same stats as `admin`.

### Breaking
- **`teachers.delete` no longer exists** — renamed to `teachers.archive`. Since `prisma/seed.ts` fully flushes and re-seeds `Permission`/`Role`/`RolePermission` on every run, this is a no-op for any environment that re-seeds; it only matters if you were hand-editing `RolePermission` rows against the old code outside the seed script.

### Release Statistics
| Area | Count |
| :--- | :--- |
| New Prisma models | 12 (`Department`, `Designation`, `Teacher`, `TeacherQualification`, `TeacherEmergencyContact`, `TeacherDocument`, `TeacherLeaveBalance`, `EmployeeNumberSequence`, `StudentAttendance`, `TeacherAttendance`, `Holiday`, `AttendanceLock`) |
| New Prisma enums | 3 (`EmploymentType`, `TeacherStatus`, `TeacherDocumentType`) |
| New `AuditAction` values | 20 (13 faculty-lifecycle + 7 attendance locks/markings) |
| Additive fields on existing models | 1 (`ClassSubject.teacherId`) |
| New API endpoints | 45 (31 faculty + 14 attendance) |
| New permissions | 6 (`teachers.salary`, `teachers.leave`, `teachers.documents`, `attendance.mark`, `attendance.view`, `attendance.teacher.mark`, `attendance.teacher.view`) |
| New docs | 3 (`faculty-engine-design-spec.md`, `faculty-engine-er-diagram.md`, `docs/api/faculty.md`) |

### Migration
```bash
cd backend
npx prisma migrate dev   # applies faculty_management_engine + faculty_engine_audit_actions
npx prisma db seed       # re-seeds permissions with the archive rename + 3 new codes
```

---

## [Unreleased] - v0.6.0 Student Admission Engine (frontend) + Public Website
### Added
- **Student Admission Engine frontend** under `frontend/src/features/student/`: Student Dashboard (landing page — stat tiles for total/today/this-month/archived, recent admissions, quick actions), Students registry (search, filter by year/class/section/status, pagination), Admission form, and a Student Detail page (Profile edit, Guardians CRUD, Documents CRUD, Enrollment History).
- **`GET /students/summary`**: returns `{ total, active, todayAdmissions, newThisMonth, archived }` for the Dashboard's stat tiles. `archived` counts every non-`ACTIVE` status — there is no dedicated `ARCHIVED` status value.
- `StudentRepository.findAll`/`findById`/`admit` now include `academicYear`/`class`/`section` names on `Enrollment`, so the frontend can render a student's placement without a second lookup.
- Students registry search now also matches a guardian's `fullName`/`phone`, not just the student's own name/admission number. Added an "Export CSV" action to the registry (paginated fetch of every row matching current filters, client-side CSV generation — `frontend/src/utils/csv.ts`).
- **`POST /students/:id/promote`**: creates a new `Enrollment` for a student into a different academic year/class/section without touching prior enrollments, so year-over-year placement history survives. Same cross-engine placement validation as `POST /admission`; `409` on a duplicate academic-year enrollment or a roll-number collision.
- **Audit logging**: `AuditAction` enum extended with `STUDENT_ADMITTED`/`STUDENT_UPDATED`/`STUDENT_STATUS_CHANGED`/`STUDENT_PROMOTED`/`STUDENT_DELETED`. New shared `backend/src/utils/audit-log.ts` (used by the Student Engine, callable by any future engine) writes to the same `AuditLog` table auth events already use — `POST /admission`, `PUT /:id`, `POST /:id/status`, `POST /:id/promote`, and `DELETE /:id` each append a row.
- **Public Website homepage + content pages** under `frontend/src/features/public-site/`, consuming the existing read-only `GET /public/site-info` endpoint:
  - Homepage sections: Hero, StatsStrip, About, PrincipalMessage, Academics overview, Faculty overview, CampusLife gallery, Testimonials, FAQ, Notices preview, Admissions CTA.
  - New routed content pages: Notices list/detail (`/public/notices`, `/public/notices/:slug`), Academics catalog/detail (`/public/academics`, `/public/academics/:slug`), Faculty directory/profile (`/public/faculty`, `/public/faculty/:slug`), Fee structure (`/public/fees`).
  - Shared `PageHero` breadcrumb component for all inner public pages; `Nav`/`Footer` updated to route real pages via React Router `Link` while homepage sections stay as `#anchor` links.
  - All content (notices, grade curricula, teacher bios, fee tables) is static frontend data under `features/public-site/data/` for now — not database-backed yet (tracked as Public Website Roadmap Phases 3–5 in the README).
### Fixed
- `frontend/src/features/auth/types/index.ts` had stale `students.create`/`students.delete` permission codes; corrected to the actual `students.admit`/`students.archive` codes the backend uses.

### Release Statistics
| Area | Count |
| :--- | :--- |
| New API endpoints | 2 (`GET /students/summary`, `POST /students/:id/promote`) |
| New `AuditAction` enum values | 5 |
| New shared backend utilities | 1 (`audit-log.ts`) |
| New Student Engine frontend pages | 4 (Dashboard, Students, Admission, Detail) |
| New Public Website routes | 7 |
| New Public Website components | 12 |
| New Public Website data files | 7 |

### Migration
`AuditAction` is an existing enum extended with 5 new values — run a migration to sync the database:
```bash
cd backend
npx prisma migrate dev
```
No new dependencies were added; `npm install` is not required unless your `node_modules` is already stale.

## [0.5.1] - 2026-07-08
### Changed
- **Student Admission Engine reworked** before any real data existed against it — v0.5.0's design was revised based on a closer review of what the workflow needs long-term:
  - **Added `Enrollment`** (Student × AcademicYear × Class × Section × rollNumber): class/section placement moved off `Student` entirely. The v0.5.0 design would have overwritten a student's placement on every promotion with no history — `Enrollment` is one row per academic year instead, so past placements, roll numbers, and (eventually) report cards survive year-over-year moves.
  - **Split `fullName` into `firstName`/`middleName`/`lastName`** for certificate/report-card generation.
  - **Added `rollNumber`** on `Enrollment` (per year/section, not a permanent student attribute), unique per `(academicYearId, sectionId)`; duplicate roll numbers now return a clean `409` instead of a raw constraint error.
  - **Added permanent/temporary address fields** on `Student` (was a single address block).
  - **Changed the admission number format** from `{academicYear.label}-{seq}` to `{schoolProfile.shortName}-{academicYear.startDate's year}-{seq}` (e.g. `DPS-2025-0001`), falling back to `SCH-` if no school short code is configured yet — sourced from the System Configuration Engine's `SchoolProfile`.
  - **Kept** the fixed-relation `StudentGuardian` model (one row per Father/Mother/Guardian) rather than switching to flat `fatherName`/`motherName`/`guardianName` columns, which would have lost per-guardian contact info.
  - No frontend or Promotion/Transfer endpoints existed yet, so this was a clean schema change with no migration-of-real-data concerns — the two smoke-test student records from v0.5.0 were deleted rather than migrated.

## [0.5.0] - 2026-07-08
### Added
- **Student Admission Engine**: `POST /api/v1/students/admission` runs the full admission workflow atomically — generates a per-academic-year admission number (`{academicYear.label}-{4-digit sequence}`), then creates the `Student`, up to three `StudentGuardian` rows (Father/Mother/Guardian, fixed relations), and any `StudentDocument` rows in one transaction.
  - `academicYearId`/`classId`/`sectionId` are validated against the Academic Engine's own repositories before anything is written — a first example of one Engine composing another Engine's repository layer for cross-engine reference checks, rather than duplicating the check or trusting a bare FK constraint to surface a friendly error.
  - `Student.status` (`ACTIVE | INACTIVE | TRANSFERRED | GRADUATED | WITHDRAWN`) is a real lifecycle distinct from reference-data's `ACTIVE | ARCHIVED`, since a student's departure reason matters for records.
  - Upload pipeline (`upload.middleware.ts`, `cloudinary.ts`) extended to accept PDFs alongside images (`resource_type: 'auto'`) for scanned certificates, shared infra rather than a Student-specific fork.
  - Dedicated `students.read` / `students.admit` / `students.update` / `students.archive` permissions — `students.admit` (not `students.create`) so the permission name matches the workflow, matching the same convention as the Academic Engine's permissions.
  - `feeCategory` is a plain string field for now — a deliberate forward reference pending a future Finance Engine's `FeeCategory` reference table.
  - Promotion (year-end class move) and Transfer (student leaving for another school) are explicitly out of scope for this sprint.
- **Documentation**: ADR-005 updated with the Student Admission Engine's status and the cross-engine repository-composition pattern, an ER diagram, and a full API reference (`docs/api/students.md`).

## [0.3.0] - 2026-07-08
### Added
- **Authentication Engine hardening**: Removed fallback JWT secret defaults in favor of required 32+ character secrets, added a password-reset flow (token storage + email delivery via a new mailer config), and distinguished a mid-session token-refresh failure (session revoked elsewhere) from a first-load unauthenticated state by redirecting to a dedicated session-expired page.
- **System Configuration Engine**: School Profile, Branding (Cloudinary-backed logo/signature uploads), Leadership directory, Academic Years, Academic Terms, Grading Scale, and general Settings, each with a full repository/service/controller/validator stack.
- **Academic Engine**: `AcademicYear` → `Class` → `Section` → `Subject` → `ClassSubject` → `ExamType` as reference data, all under `/api/v1/academic-structure`.
  - `ExamType` models reusable exam *templates* (First Terminal, Mid-Term, Final, Practical, etc. — `name`, `code`, `description`, `displayOrder`, `weightage`, `isPublished`). Scheduled exam *instances* are deferred to a future Examination Engine.
  - `GET /academic-structure/structure` aggregate endpoint returns the full tree plus `summary` counts (classes/sections/subjects/classSubjects/examTypes) in one call, composed through a dedicated `AcademicStructureRepository`/`AcademicStructureService` — no controller in this engine queries Prisma directly.
  - Dedicated `academic.read` / `academic.create` / `academic.update` / `academic.archive` permissions (previously piggybacked on `system.read`/`system.write`); archive and hard-delete share the `archive` tier since delete is only reachable on zero-reference records.
  - Archive-only retirement (`RecordStatus: ACTIVE|ARCHIVED`) across all five entities; hard-delete blocked while references exist.
  - Seed data stays generic (Nursery→Grade 10, standard six-subject catalog) — no school-specific data is seeded; per-school customization is deferred to a future School Setup Wizard.
- **User Accounts module**: CRUD for login accounts, deliberately scoped apart from the future Student/Teacher engines.
- **Roles module**: CRUD for roles/permissions, plus a `useEffectiveRole` frontend hook mirroring the backend's wildcard (`*`) Super Admin bypass.
- **Frontend wiring**: nested "Academic Structure" and "School Configuration" nav sections, routes, and dashboard widget updates for all of the above.

## [0.2.0] - 2026-06-28
### Added
- **Central Theme & Tokens**: Configured HSL palette standards for primary, secondary, warning, error, success, info, and neutral color spaces in `index.css`.
- **Dynamic Theme Engine**: Created a local-storage synchronized ThemeProvider context supporting light, dark, and system schemes.
- **Core UI Primitives**: Built 18 customized, clean-typed React components (Button, Input, Select, Table, Modal, Drawer, Toast, Breadcrumbs, Tabs, etc.) using Framer Motion animations.
- **Data-Driven Navigation**: Configured role-based sidebars, mobile drawers, and top headers controlled by static configurations.
- **Developer Role Simulator**: Embedded a runtime selector in the header to allow immediate previewing of layouts as Admin, Teacher, or Student.
- **Animated SVG Widgets**: Designed Welcome, Stats, Activity, and Chart (SVG performance graphs) dashboard cards.
- **Verification Protocols**: Passed all typescript compiler checks and ESLint checks with zero warnings or errors.

## [0.1.0] - 2026-06-28
### Added
- **Project Structure**: Set up a clean, scalable subfolder structure for `frontend` (React + Vite) and `backend` (Express) architectures.
- **Frontend Infrastructure**:
  - Configured React 19, TypeScript 6, and Vite compiler options.
  - Set up absolute path resolve aliases (`@/*` mapping to `src/*`).
  - Added Tailwind CSS v4 styling rules and custom CSS variables compatible with shadcn/ui.
  - Implemented core libraries (Zustand store template, TanStack Query client, and Axios API configurations).
  - Created modular routing patterns using React Router DOM with lazy-loaded page entries.
  - Designed mock dashboard and login pages with micro-animations.
- **Backend Infrastructure**:
  - Scaffolding Express application utilizing Helmet (security headers) and CORS policies.
  - Integrated Winston logger for formatted standard out outputs and file logging in production.
  - Configured custom Morgan stream middleware to route HTTP request logs to Winston.
  - Configured Zod environment validator to check parameters on startup.
  - Created Prisma client singleton connection manager with logging hooks.
  - Created a global error-catching middleware with custom `AppError` mappings.
- **Repository Hardening**:
  - Implemented root level `.gitignore`, `.editorconfig`, `PROJECT_RULES.md` (project constitution), and `CONTRIBUTING.md` developer guide.
  - Added issue templates and pull request templates.
