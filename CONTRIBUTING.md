# Contributing to Deukhuri Digital Campus ERP

Welcome! We are excited that you are working on the Deukhuri Digital Campus School ERP system. This guide contains crucial setup instructions and repository workflows.

---

## 🛠️ 1. Project Setup

### Prerequisites
- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **NPM**: Version 9.x or later
- **PostgreSQL**: Local database instance running

### Installation Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/KhanalShubham/Learning-Management-System.git
   cd Learning-Management-System
   ```
2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies**:
   ```bash
   cd ../backend
   npm install
   ```

---

## 🚀 2. Local Development Workflow

To start development, open two separate terminal sessions.

### Starting the Backend
1. Go into the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` configuration file from the template:
   ```bash
   copy .env.example .env
   ```
3. Generate the local database client code:
   ```bash
   npm run prisma:generate
   ```
4. Run the Express dev server:
   ```bash
   npm run dev
   ```
The backend API is now listening at `http://localhost:5000/api/v1`.

### Starting the Frontend
1. Go into the frontend directory:
   ```bash
   cd frontend
   ```
2. Create your `.env` configuration file from the template:
   ```bash
   copy .env.example .env
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The frontend portal is now running at `http://localhost:5173`.

---

## 🌿 3. Git Workflow & Git Flow

We follow the standard Git Flow model for development:

1. **Pull Latest Changes**:
   Always make sure you have the latest updates before starting work:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Create a Feature Branch**:
   Create a new branch matching our branch standards:
   ```bash
   git checkout -b feature/DESK-123-billing-modals
   ```
3. **Code & Commit**:
   Write your changes adhering to the coding standards and Conventional Commits.
4. **Validate Code Locally**:
   Run validation checks locally to verify build and style correctness:
   ```bash
   # In frontend/ and backend/
   npm run lint
   npm run build
   ```
5. **Push and PR**:
   Push the branch and open a Pull Request (PR) against `develop` on GitHub:
   ```bash
   git push origin feature/DESK-123-billing-modals
   ```

---

## 📝 4. Pull Request Process

When creating a Pull Request, please ensure you satisfy the following:
- Write a description explaining *what* changed and *why* it changed.
- Attach screenshots or visual clips for UI/layout updates.
- Verify that your PR triggers no linting warnings or TS build failures.
- Request reviews from at least one core engineering peer.

---

## 🏛️ 5. Architecture Decision Records (ADRs)

We formalize major architectural choices using **Architecture Decision Records (ADRs)**.
* **Storage Location**: Saved under `docs/architecture/` (e.g. `docs/architecture/ADR-006-student-engine.md`).
* **Trigger Condition**: Write an ADR whenever a decision alters database architecture, introduces a new engine, changes the integration pattern between modules, or alters shared framework configurations.
* **ADR Content Structure**:
  1. **Title**: Structured as `ADR-[Number]-[Short-Description]`.
  2. **Status**: `Draft | Proposed | Accepted | Rejected | Superseded`.
  3. **Context**: Explains the current state, problem, and requirements.
  4. **Decision**: Clearly describes the adopted technical path and implementation shape.
  5. **Rationale**: Outlines why alternative options were skipped and details design benefits.
  6. **Consequences**: Details trade-offs, follow-up migration demands, or downstream modifications.

---

## 💬 6. Request for Comments (RFC) Workflow

To prevent architectural drift and ensure alignment before writing heavy schema changes:
1. **Proposal**: Open an issue or draft document outlining the proposed design, schema adjustments, and permission matrix changes.
2. **Review/Discussion**: Gather feedback from core contributors regarding integration patterns, security profiles, and compliance with the Constitution.
3. **Approval**: Obtain explicit sign-off from the technical lead/core maintainers.
4. **Implementation**: Begin development on feature branches adhering to the agreed schema.
5. **ADR Writing**: Once merged, solidify the decisions in a permanent ADR file.

---

## 🚀 7. CI/CD Standards

Every Pull Request submitted to the integration branch (`develop` or `main`) runs through validation checks. Ensure your code satisfies these conditions before opening the PR:
```
Pull Request ➔ Setup & Install ➔ Lint & Format Check ➔ Type Safety (tsc) ➔ Test Suites Execution ➔ Production Build ➔ Security Audit ➔ Peer Review Approval ➔ Merge
```
* **Install**: Package installations must resolve cleanly without lockfile conflicts.
* **Lint**: Enforced code style checks via ESLint and Prettier (`npm run lint`).
* **Type Check**: TypeScript compiler checks (`tsc --noEmit` or `tsc -b`) must yield zero warnings or errors.
* **Build**: Running production compile operations (`npm run build`) in both frontend and backend directories must pass successfully.

---

## 🏷️ 8. Versioning Policy

This project adheres to **Semantic Versioning (SemVer)** principles:
* **Major Changes (`1.0.0`)**: Production-ready milestones or releases introducing breaking changes, database refactors, or backward-incompatible interface changes.
* **Minor Changes (`0.y.0`)**: Adding a new engine (e.g. Attendance, Finance) or major module features without breaking existing modules.
* **Patch Changes (`0.x.y`)**: Bug fixes, dependency updates, documentation improvements, security patches, or micro optimizations.
