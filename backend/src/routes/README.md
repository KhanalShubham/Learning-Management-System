# Routes Directory

This directory defines HTTP endpoints and registers middlewares and controllers to paths.

## Key Files
- `index.ts` - Main express router orchestrator mapping path blocks to specific route files (e.g. `/api/v1/students`).

## Guidelines
- Keep route definition files thin. Avoid writing implementation code directly in routes.
- Secure route scopes by mounting appropriate role authorization and auth middlewares at route definitions.
