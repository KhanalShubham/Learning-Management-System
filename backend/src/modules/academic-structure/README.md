# Academic Structure Engine

## 🎯 Purpose
The Academic Structure Engine organizes standard academic definitions for classes, course sections, course subjects, class-subject assignments, and exam template blueprints.

---

## 🏗️ Architecture & Workflow
1. **Academic Tree Organization**:
   * Models hierarchy: `Class` ➔ `Section` ➔ `Subject` ➔ `ClassSubject` (combination binding class, section, subject, and designated teacher).
2. **Aggregates Endpoint**:
   * To prevent high database round-trip overhead on client loading, the `GET /academic-structure/structure` endpoint aggregates classes, sections, subjects, and assignments in a single query compiled via custom repository methods.
3. **Reference Safeguards (Soft Archiving)**:
   * Supports `RecordStatus: ACTIVE | ARCHIVED` states.
   * Restricts deleting a class, section, or subject if active records (such as student enrollments) point to it.

---

## 🔑 Permissions
* `academic.read`: Fetch classes, subjects, and general academic structure trees.
* `academic.create`: Register classes, sections, and subject categories.
* `academic.update`: Modify class limits or subject descriptions.
* `academic.archive`: Retire academic records or delete unreferenced structures.

---

## 🌐 Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/academic-structure/structure` | Fetch the entire integrated academic structures tree | Yes (`academic.read`) |
| `POST` | `/academic-structure/classes` | Create a class tier | Yes (`academic.create`) |
| `POST` | `/academic-structure/sections` | Create course sections under a class | Yes (`academic.create`) |
| `POST` | `/academic-structure/class-subjects/:id/assign-teacher` | Link a teacher to a class subject | Yes (`academic.update`) |

---

## 🗄️ Database Models
* `Class`: Class level (e.g., Grade 10, Nursery).
* `Section`: Subdivisions within a class (e.g., Section A, Section B).
* `Subject`: Academic courses details (e.g., Mathematics, Science).
* `ClassSubject`: Pivot model linking a Class, a Section, a Subject, and a teaching faculty.
* `ExamType`: Global templates mapping exams (Final Terminal, Mid-Term, etc.).

---

## 📦 Dependencies
* **Core Dependency**: Consumes `AcademicYear` references from the Configuration Engine to structure yearly assignments.
* **Faculty Engine Composition**: Compores `ITeacherRepository` downstream to check teacher status before class-subject assignments.
* **Downstream Consumers**: Forms base validation targets for Student admission placement, student promotion, examination results records, and class roll numbers.

---

## 🔮 Future Work
* Build classroom allocation mapping models linked to class subjects.
* Implement class timetable structures scheduling weekly lessons.
