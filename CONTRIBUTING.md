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
