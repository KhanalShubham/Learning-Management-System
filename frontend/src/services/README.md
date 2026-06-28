# Services Directory

This directory houses infrastructure configuration and global API service clients.

## Key Files
- `api.ts` - Axios instance with request/response interceptor middleware (automatically injecting auth tokens, handles global error triggers).
- `auth.ts` - Shared auth service helpers.

## Guidelines
- Centralize all API client options here.
- Intercept 401/403/500 HTTP response codes in one place to handle global logout or notification logic.
