# ADR-002: Express.js instead of NestJS

## Status
Accepted

## Context
We need to select an API routing framework for our backend. The primary options considered were Express.js and NestJS.

## Decision
We chose **Express.js** with TypeScript.

## Rationale
- **Custom Clean Architecture**: Express is unopinionated and minimalist. It allows us to explicitly define our layers (Controllers, Services, Repositories, Interfaces) without forcing the team to conform to the dependency-injection and decorator overhead mandated by NestJS.
- **Low Boilerplate**: We can configure routing, security, and exception trapping quickly with minimal code, simplifying core structure.
- **Onboarding Speed**: Express.js is the standard API framework in the Node ecosystem. It ensures that any Node.js developer can immediately comprehend the code structure and contribute.
