# Middleware Directory

This directory contains intermediate Express request interceptors.
Examples:
- `error.middleware.ts` - Catches exceptions and returns standardized error structures.
- `auth.middleware.ts` - Validates JWT signature and injects matching request user scope.
- `validation.middleware.ts` - Runs schema validation over payload shapes before handing off execution.

## Guidelines
- Write tests for custom middlewares to guarantee request routing safety.
- Middlewares should fail fast (e.g. return 400 Bad Request directly if shape check fails).
