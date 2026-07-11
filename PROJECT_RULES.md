# Project Constitution & Coding Standards

This document establishes the official development rules and coding standards for **Deukhuri Digital Campus** School ERP. Every developer must read and adhere to these regulations.

---

## 📂 1. Directory Structure Standards

The project utilizes a clear separation of concerns by separating the client application (`frontend/`) and server engine (`backend/`).

### Frontend Structure
All code lives under `frontend/src/`:
- `assets/` - Static files (fonts, images, icons).
- `components/` - Generic UI units, categorized:
  - `common/` - Presentation layouts shared globally.
  - `layout/` - Scaffolding layers (sidebar, footer).
  - `ui/` - Shadcn/ui core primitives.
- `features/` - Domain modules (e.g. `students/`, `teachers/`).
- `hooks/` - Global hooks.
- `layouts/` - Role/route wrappers (e.g. `AdminLayout.tsx`).
- `pages/` - URL route containers.
- `routes/` - Router configs.
- `services/` - Network clients.
- `store/` - Zustand store models.
- `types/` - Type declarations.
- `utils/` - Pure helper functions.
- `constants/` - Configurations and static options.

### Backend Structure
All code lives under `backend/src/`:
- `config/` - Environments, validators, and log instances.
- `controllers/` - Route payload extraction and service hand-off.
- `middleware/` - Express request filters (auth, error handler, Morgan).
- `routes/` - URL path registration.
- `services/` - Core business logics.
- `repositories/` - Database CRUD wrappers.
- `validators/` - Zod schema guards.
- `prisma/` - Client singleton.
- `types/` - Global types.
- `utils/` - Backend utility helpers.
- `interfaces/` - Interfaces and structural contracts.

---

## 🏷️ 2. Naming Conventions

### Directory Naming
- Use **kebab-case** for all directories in the project.
- *Exception:* Specific React component folders inside features may follow PascalCase if they mirror the component name.

### File Naming
- **React Components / Layouts**: Use **PascalCase** (e.g., `Button.tsx`, `AdminLayout.tsx`).
- **React Hooks**: Use **camelCase** prefixed with `use` (e.g., `useDebounce.ts`).
- **Standard Typescript / CSS / Configs**: Use **kebab-case** or **camelCase** (e.g., `eslint.config.js`, `error.middleware.ts`).

### Code Symbol Naming
- **Classes / Interfaces / Types**: Use **PascalCase** (e.g., `class AppError`, `interface StudentInfo`).
- **Functions / Variables**: Use **camelCase** (e.g., `const getStudentProfile`, `let isLoading = false`).
- **Constants**: Use **UPPER_SNAKE_CASE** (e.g., `const MAX_API_RETRIES = 3`).

---

## ⚛️ 3. React Component Standards

- **Functional Components**: Use arrow function definitions:
  ```typescript
  export const StudentCard = ({ name }: StudentCardProps) => { ... }
  ```
- **Type Definitions**: Every component must declare a props interface. Do not use inline prop typings.
- **State Scope**: Keep state as local as possible. Do not put form values in global Zustand stores.
- **CSS Modifiers**: Style elements exclusively using Tailwind utility classes. Avoid inline style elements.

---

## 🚀 4. Express Architecture Standards

- **Separation of Concerns**: Controllers must never contain query statements or business calculations.
- **Service Independence**: Services must never access Express request (`req`) or response (`res`) scopes directly. Return values or throw custom `AppError` exceptions instead.
- **Data Access Isolation**: Always route database queries through the Repositories layer.

---

## 🌐 5. API Response Standard

To ensure consistency, every response returned by the backend must follow these exact shapes.

### Success Responses (HTTP 200/201)
```json
{
  "success": true,
  "message": "Student created successfully.",
  "data": {
    "id": "std_01HJZ...",
    "name": "Ram Bahadur"
  },
  "errors": null
}
```

### Error Responses (HTTP 400/401/403/404/500)
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## 🛡️ 6. Security Guidelines

- **Helmet**: Enable Helmet headers to cover standard exploit profiles.
- **CORS**: Enforce whitelist matching for origins. Do not use wildcard `*` origins in production.
- **Passwords**: Always hash client passwords using `bcrypt` (10-12 salt rounds) before storing.
- **Authentication**: Secure APIs using JWT signatures (passed in the `Authorization: Bearer <token>` header).
- **Environment Isolation**: Never hardcode keys or credentials. Load from `.env` validated by Zod at startup.

---

## 🛠️ 7. Git Workflow

### Branch Naming Conventions
- `main` - Stable production release.
- `develop` - Integration branch for features.
- `feature/<ticket-id>-description` - Developing new features.
- `bugfix/<ticket-id>-description` - Resolving bugs.
- `hotfix/description` - Critical live production fixes.

### Commit Message Conventions (Conventional Commits)
Format: `<type>(<scope>): <description>`
- `feat`: A new feature (e.g. `feat(billing): add billing invoice dispatch`)
- `fix`: A bug fix (e.g. `fix(auth): resolve jwt expiration crash`)
- `docs`: Documentation changes (e.g. `docs(core): create project rules`)
- `style`: Formatting, semicolons, spacing adjustments (no logical change)
- `refactor`: Restructuring code logic (no new feature or fix)
- `test`: Adding or adjusting unit/integration tests
- `chore`: Modifying build scripts, dependencies, configs

---

## 🏁 8. Definition of Done (DoD)

A task is considered complete and ready for PR merge only if:
- **Build Passes**: Application builds successfully without errors.
- **Lint & TypeScript**: Code passes formatting rules (`npm run lint`) and TypeScript checks with zero errors/warnings.
- **API Contracts**: API routes strictly conform to the Standard API Response layout.
- **Unit & Integration Tests**: New services, repositories, and critical workflows have test coverage.
- **Smoke Testing**: The developer has manually verified positive and negative paths in the UI and API.
- **Permissions Verified**: Explicit RBAC mappings and routes restrictions are enforced and verified.
- **Audit Logging**: Any state mutation triggers a descriptive record in the database audit log.
- **Responsive Layout**: Frontend designs are validated across desktop and mobile screens.
- **Accessibility Checks**: HTML forms and pages use semantic tags, label associations, and `aria-label` tags.
- **Database Migrations**: DB schema adjustments are isolated in migrations files and tested locally.
- **Documentation**: Inline docstrings are maintained, the module-level README is updated, and the project CHANGELOG is updated.

---

## 📐 9. Engineering Principles

Every contributor must adhere to these core architectural guidelines:
1. **Simplicity over Cleverness**: Choose clean, readable, and maintainable code over complex or implicit patterns.
2. **Reuse Before Creating**: Check for existing helper functions and shared services before coding new infrastructure.
3. **Services Own Business Logic**: All validation, computations, and logic flows happen inside Services. Controllers must remain thin.
4. **Controllers Remain Thin**: Route controllers should solely parse requests, delegate to Services, and format response payloads.
5. **Single Responsibility Principle (SRP)**: Each class, service, helper file, and component should handle exactly one specific task.
6. **No Hidden Side Effects**: Functions must perform only their stated tasks. Avoid side effect modifications inside utility helpers.
7. **Every Mutation is Auditable**: Every API request mutating system state must write to the `AuditLog` model.
8. **Self-Contained Features**: Keep related types, hooks, services, and components grouped together within their feature directories.
9. **Cross-Engine Communication**: Cross-module operations happen only via imports of the target module's repository or service interfaces. Direct database manipulations across tables owned by other engines are prohibited.
10. **Backward Compatibility**: Plan schema modifications carefully. Use default fields or nullable fields to ensure old data does not break.

---

## 🧰 10. Platform-Level Shared Services

The system provides a dedicated shared services layer located under `backend/src/utils/`, `backend/src/middleware/`, or specific global helper files. **Always consume these shared components instead of rebuilding them within feature engines:**
* **Audit Logging** (`backend/src/utils/audit-log.ts`): Use this utility to record actions to the database audit trail.
* **File Upload & Storage** (`backend/src/middleware/upload.middleware.ts`): Built-in Multer and Cloudinary adapters for managing image and PDF uploads.
* **Mail Dispatcher** (`backend/src/config/mailer.ts`): Configuration and dispatch helpers for outbound emails.
* **Sequence Counter Engine**: Singleton sequence counter generation tools (e.g. Employee and Student reference generators).
* **Response Formatting**: Standard wrappers in middleware to ensure uniform API data structures.

---

## 🔒 11. Security Checklist (Per Engine)

When adding or refactoring an engine, verify these security aspects:
- [ ] **Authentication**: Access is gated behind valid JWT tokens unless the route is explicitly public.
- [ ] **Authorization**: Route limits and handler steps verify permissions (`hasPermission` / `requireAnyPermission`).
- [ ] **Input Validation**: Request bodies, queries, and param variables are validated using strict Zod schemas.
- [ ] **Rate Limiting**: Critical endpoints (e.g., login, password resets) employ rate-limiting constraints.
- [ ] **File Validation**: Upload controls inspect mime-types, file sizes, and enforce standard limits.
- [ ] **Audit Logs**: Every write operation creates a persistent audit entry with caller info.
- [ ] **Error Handling**: System exceptions are caught and generalized; sensitive stack traces do not leak to HTTP clients.
- [ ] **Fields Masking**: Sensitive database columns (e.g. passwords, salary data) are omitted or stripped from reads unless the caller holds explicit permissions.

---

## 🌐 12. Public API Policy

The ERP features a public marketing site side-by-side with administrative engines.
* **Standard Rule**: Public APIs (e.g., `/api/v1/public/...`) must **never** expose internal administrative details.
* **Forbidden Fields**: Under no circumstances should salaries, contact details (phone, email), emergency contacts, personal documents, audit logs, or internal database IDs be exposed on anonymous routes.
* **Public Profile Data**: Only explicitly approved public-facing attributes (e.g., official teacher bio, class structure curriculum, public notice title/slug) may be serialized.
