# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
