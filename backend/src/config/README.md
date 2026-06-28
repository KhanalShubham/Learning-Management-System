# Config Directory

This directory handles configuration settings and env variable loading/validation for the backend.

## Key Files
- `env.ts` - Parsed and validated runtime configuration environment settings.
- `logger.ts` - Logging service bootstrap configuration.

## Guidelines
- All configuration settings (e.g. databases, cloud stores, mail credentials) must be loaded here.
- Never read `process.env` directly outside of this folder. Import from `@/config/env` instead.
