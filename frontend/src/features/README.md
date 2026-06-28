# Features Directory

This directory contains domain-driven modules. Each subdirectory represents a separate functional feature of the school ERP.
Examples:
- `students/`
- `teachers/`
- `courses/`
- `billing/`

## Feature Folder Structure
Inside each feature, you may organize related elements:
```
features/students/
  components/  # Student-specific components
  hooks/       # Student-specific custom React hooks
  services/    # Student-specific API endpoints
  types/       # Student-specific TypeScript declarations
```

## Guidelines
- Keeping folders feature-centric makes scaling extremely easy.
- Avoid tight coupling between features. Inter-feature references should be minimized.
