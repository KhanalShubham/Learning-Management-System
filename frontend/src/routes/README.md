# Routes Directory

This folder contains route configurations, authentication guards, and path declarations.

## Key Files
- `index.tsx` - Main router config utilizing React Router DOM.
- `paths.ts` - Path constants.
- `guards/` - Route protection wrappers (e.g. GuestGuard, RoleGuard).

## Guidelines
- Use React.lazy to dynamic-import page components for code-splitting.
- Structure routes to respect role hierarchies (Admin, Teacher, Student, Parent).
