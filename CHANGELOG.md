# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - v0.6.0 Student Admission Engine (frontend)
### Added
- **Student Admission Engine frontend** under `frontend/src/features/student/`: Student Dashboard (landing page — stat tiles for total/today/this-month/archived, recent admissions, quick actions), Students registry (search, filter by year/class/section/status, pagination), Admission form, and a Student Detail page (Profile edit, Guardians CRUD, Documents CRUD, Enrollment History).
- **`GET /students/summary`**: returns `{ total, active, todayAdmissions, newThisMonth, archived }` for the Dashboard's stat tiles. `archived` counts every non-`ACTIVE` status — there is no dedicated `ARCHIVED` status value.
- `StudentRepository.findAll`/`findById`/`admit` now include `academicYear`/`class`/`section` names on `Enrollment`, so the frontend can render a student's placement without a second lookup.
### Fixed
- `frontend/src/features/auth/types/index.ts` had stale `students.create`/`students.delete` permission codes; corrected to the actual `students.admit`/`students.archive` codes the backend uses.

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
