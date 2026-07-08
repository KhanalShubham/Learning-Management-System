# Features Directory

This directory contains domain-driven modules. Each subdirectory represents a separate functional feature of the school ERP.
Examples:
- `student/`
- `academic-structure/`
- `auth/`
- `school/`

## Feature Folder Structure
Inside each feature, you may organize related elements:
```
features/student/
  pages/       # Route-level page components (lazy-loaded from routes/index.tsx)
  components/  # Student-specific components
  hooks/       # Student-specific custom React hooks
  services/    # Student-specific API endpoints
  types/       # Student-specific TypeScript declarations
```

Colocating `pages/` inside the feature (starting with `student/`) is the current convention for new engines — it keeps a page and the hooks/services/types it depends on in one place instead of splitting them across `src/pages/` and `src/features/`. Older engines (`academic-structure`, `auth`'s Users/Roles pages, `school`) still have their page components under `src/pages/` and haven't been migrated; migrate them opportunistically rather than in one large pass.

## Guidelines
- Keeping folders feature-centric makes scaling extremely easy.
- Avoid tight coupling between features. Inter-feature references should be minimized.
