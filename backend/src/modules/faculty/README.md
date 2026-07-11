# Faculty Management Engine

## 🎯 Purpose
The Faculty Management Engine houses administrative files, designations, and qualifications for teachers and campus staff. It handles teacher onboarding workflows, emergency contact trees, salary scale validation, and employee leave allocations.

---

## 🏗️ Architecture & Workflow
1. **Teacher Registration (`POST /faculty/teachers`)**:
   * Executed inside a single transaction.
   * Generates a global sequential employee ID code (e.g. `DPS-EMP-0001`) via a dedicated sequence model.
   * Saves personal details, addresses, multiple emergency contacts, document file references, and instantiates default leave balances.
2. **Lifecycle Status Transitions**:
   * Supports active states (`ACTIVE`, `ON_LEAVE`, `SUSPENDED`) and terminal states (`RESIGNED`, `TERMINATED`, `RETIRED`).
   * Terminal transitions require the high-privilege `teachers.archive` permission.
3. **Salary Field Masking**:
   * Access to `basicSalary` is gated by the `teachers.salary` permission. Callers without this permission are served response payloads with the field omitted entirely.

---

## 🔑 Permissions
* `teachers.read`: Browse the faculty directory and view teacher bios.
* `teachers.create`: Onboard new faculty members and configure designations.
* `teachers.update`: Edit standard profile info and modify qualifications records.
* `teachers.archive`: Terminate or retire faculty accounts.
* `teachers.salary`: High-privilege permission required to write/view salary details.
* `teachers.leave`: Adjust allocated leave entitlements.

---

## 🌐 Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/faculty/teachers` | Register a new faculty member | Yes (`teachers.create`) |
| `GET` | `/faculty/teachers` | Search and filter teachers | Yes (`teachers.read`) |
| `GET` | `/faculty/teachers/:id` | Fetch full profile data | Yes (`teachers.read`) |
| `PATCH` | `/faculty/teachers/:id/leave-balance` | Modify staff leave entitlement balances | Yes (`teachers.leave`) |

---

## 🗄️ Database Models
* `Department`: School departments (e.g., Science Department, Humanities).
* `Designation`: Faculty titles (e.g., Head of Department, Secondary Teacher).
* `Teacher`: Employee profile information, dates of hire, basic salary.
* `TeacherQualification`: Educational degrees, certifications, and institutions.
* `TeacherEmergencyContact`: Multiple contacts records designating a primary.
* `TeacherDocument`: Scanned academic papers or contract agreements PDFs.
* `TeacherLeaveBalance`: Yearly allocated and consumed counts for leaves.
* `EmployeeNumberSequence`: Singleton sequence counter tracking employee ID tags.

---

## 📦 Dependencies
* **Upload Pipeline**: Composes Cloudinary media helpers for PDF documents and image attachments storage.
* **Audit logs system**: Invokes the shared audit logs writer to record mutations.
* **Academic Engine Connection**: Backs assignments references on `ClassSubject` mappings in the academic engine.

---

## 🔮 Future Work
* Integrate a leave request submission and approval calendar system.
* Build payroll generation sheets linked to basic salaries and attendance counts.
