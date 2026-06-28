# Layouts Directory

This folder contains page layout wrappers that define routing outlets, sidebar configurations, and structural scaffolding for specific roles/views.
Examples:
- `AdminLayout.tsx`
- `StudentLayout.tsx`
- `AuthLayout.tsx`

## Guidelines
- Avoid defining complex business logic inside layout templates.
- Use them to mount UI sidebars, dynamic headings, navigation, and wrap React Router `<Outlet />` components.
