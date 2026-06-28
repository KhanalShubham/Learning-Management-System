# ADR-004: Monorepo Project Structure

## Status
Accepted

## Context
We need to organize front-end and back-end packages in a way that minimizes deployment friction and ensures coordination.

## Decision
We chose a **Subfolder Monorepo** layout, placing client code in `frontend/` and server engine code in `backend/` within a single Git repository.

## Rationale
- **Single Source of Truth**: Having both modules in one place simplifies development. Code shifts that span across both applications (like API contract updates) are tracked and committed together in a single Pull Request.
- **Deployment Synchronization**: Code builds can be triggered in parallel. Release version tagging is unified.
- **Onboarding Efficiency**: Developers only need to clone a single Git repository to have the full operational landscape up and running.
