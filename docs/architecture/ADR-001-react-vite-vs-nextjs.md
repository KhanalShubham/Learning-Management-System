# ADR-001: React + Vite instead of Next.js

## Status
Accepted

## Context
For the "Deukhuri Digital Campus" School ERP system, we need to choose the frontend rendering and compilation architecture. The primary options are Next.js (Server-Side Rendering framework) and React + Vite (Single Page Application).

## Decision
We chose **React + Vite** (SPA) over Next.js.

## Rationale
- **High Interaction Dashboard**: An ERP is an application consisting of authenticated dashboards, data tables, and input forms. It has almost zero public facing search-engine requirements, so Server-Side Rendering (SSR) overhead is unnecessary.
- **Development Experience (DX)**: Vite compiles and reloads code in milliseconds, facilitating quick iterations.
- **Deployment Simplicity**: Vite compiles down to static HTML, JS, and CSS. This makes hosting simple, cheap, and easily distributable through standard CDNs or lightweight web servers (e.g., Nginx, static storage) without needing a dedicated Node.js server.
