# ADR-003: PostgreSQL + Prisma ORM

## Status
Accepted

## Context
A database engine and access client are needed to handle ERP transactional data (courses, classes, billing, students, and grades).

## Decision
We chose **PostgreSQL** as the database engine and **Prisma ORM** as the database client.

## Rationale
- **Relational Data Mapping**: School ERPs are inherently relational. PostgreSQL is an industry-grade, ACID-compliant database that guarantees transactional safety.
- **End-to-End Type Safety**: Prisma reads `schema.prisma` and auto-generates client types inside `node_modules`. This means database modifications are immediately checked by the TypeScript compiler.
- **Auto Migrations**: Prisma CLI manages state migrations smoothly (`prisma migrate dev`), ensuring consistent database schema environments across team members.
