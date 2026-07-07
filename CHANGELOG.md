# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
