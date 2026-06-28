# Pages Directory

This directory contains container components that represent page endpoints linked to router endpoints.
Examples:
- `Dashboard.tsx`
- `Login.tsx`
- `NotFound.tsx`

## Guidelines
- Keep pages lightweight. They should assemble layouts, global configurations, and features.
- Actual UI implementation should be delegated to feature-specific or common components.
- Do not implement raw database queries or complex state machine logic directly inside page entrypoints.
