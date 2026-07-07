# ADR-005: Engine-Based Module Architecture

## Status
Accepted

## Context
This ERP will eventually serve more than one school, and every workflow after authentication (student admission, attendance, examinations, finance, certificates) depends on a shared set of reference data — academic years, classes, sections, subjects, grading scales, and so on. Building each business area as an isolated CRUD module risks two things: duplicated reference-data concepts across modules (e.g. "class" redefined by both Student and Attendance), and a data model shaped around one school's specifics instead of being reusable.

## Decision
We organize the backend (and mirrored frontend feature folders) into **Engines** rather than one-off modules. An Engine is a cohesive vertical slice that:

1. Owns a set of related entities end-to-end (repository → service → controller → routes → validator).
2. Exposes reference data that other Engines consume **by foreign key only** — a downstream Engine never redefines or duplicates another Engine's entities.
3. Follows a consistent internal layering: `Route → Controller → Service → Repository → Prisma`. Controllers never import `prisma`/`@/prisma/client` directly, including for read-only aggregate endpoints — this keeps every Engine swappable and testable at the service boundary.
4. Uses archive-only retirement (`status: ACTIVE | ARCHIVED`) for reference data; hard-delete is only permitted when a record has zero downstream references.
5. Gets its own dedicated permission codes (`<engine>.read`, `<engine>.create`, `<engine>.update`, `<engine>.archive`) rather than sharing a generic `system.*` pair, even before multiple roles need differentiated access — this keeps the authorization model consistent as roles diversify later.
6. Is designed to generalize beyond the first school's specific data — seed data stays generic; school-specific customization happens through onboarding/configuration flows, not hardcoded seeds.

## Engines (as of 2026-07-08)
| Engine | Status | Owns |
|---|---|---|
| Authentication Engine | ✅ Done | Users' credentials, sessions, password reset |
| Configuration Engine | ✅ Done | School Profile, Branding, Leadership, Academic Years, Academic Terms, Grading Scale, Settings |
| Academic Engine | ✅ Done | Class, Section, Subject, ClassSubject, ExamType, aggregate structure tree |
| Student Admission Engine | Planned | Admission workflow (number generation, academic year/class/section assignment, guardian info, document upload) — not a bare Student CRUD |
| Attendance Engine | Planned | Attendance marking and reporting |
| Examination Engine | Planned | Scheduled exam instances (ExamType × Date × Class × Section), results, marksheets |
| Document Engine | Planned | Certificate/document generation |
| Finance Engine | Planned | Fees, salary, payments |
| Website CMS Engine | Planned | Public site content |

Users and Roles are treated as part of the Authentication/Authorization surface rather than standalone Engines — they configure *who* can act, not a business domain in their own right.

## Rationale
- **Dependency-ordered build sequence**: every downstream Engine needs Academic Engine data to exist first (a student needs a class/section; attendance needs a section; an exam result needs a ClassSubject). Building in this order avoids modeling placeholders that get reworked later.
- **Consistent layering makes engines swappable**: a strict repository/service/controller boundary means an Engine's persistence details never leak into route handlers, so read-heavy aggregate endpoints don't become the one exception that reintroduces direct Prisma access into controllers.
- **Reference-data ownership prevents drift**: without a single owner per concept, two Engines (e.g. Student and Attendance) could each grow their own notion of "class," which is exactly the kind of duplication that turns into an expensive refactor once both are in production.
