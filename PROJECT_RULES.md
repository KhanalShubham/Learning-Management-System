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
1. **Compilation**: Code compiles with zero TypeScript compilation warnings or errors.
2. **Linting & Formatting**: Code passes lint checks (`npm run lint`) and is formatted via Prettier.
3. **API Contracts**: REST API routes conform to the Standard API Response layout.
4. **Environment templates**: `.env.example` templates are updated with any new properties.
5. **Documentation**: Necessary subfolder `README.md` files are updated with new details.
