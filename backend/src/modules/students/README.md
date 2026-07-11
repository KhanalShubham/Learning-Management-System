# Student Admission & Management Engine

## 🎯 Purpose
The Student Admission & Management Engine governs the student lifecycle. It handles transactional admissions, maintains student files, organizes parent/guardian contacts records, tracks year-over-year enrollment placements (historical transcripts support), and processes promotional student routing.

---

## 🏗️ Architecture & Workflow
1. **Admission Flow (`POST /students/admission`)**:
   * Runs atomically in a single Prisma database transaction.
   * Generates a sequential admission number (e.g. `DPS-2025-0001`) by pulling the school's short prefix code and the admission year.
   * Validates target Class and Section exist and are active.
   * Inserts the `Student` record, up to three `StudentGuardian` links, and default `Enrollment` placement rows.
2. **Promotions Flow (`POST /students/:id/promote`)**:
   * Creates a new `Enrollment` record for the targeted subsequent Academic Year, Class, and Section.
   * Preserves older enrollments, which ensures historic transcript roll mappings are retained.
3. **Audit Trail Logging**:
   * Write audit entries on mutations: `STUDENT_ADMITTED`, `STUDENT_PROMOTED`, etc.

---

## 🔑 Permissions
* `students.read`: Query the student directory, details, and enrollment histories.
* `students.admit`: Run the transactional admission workflow.
* `students.update`: Modify student metadata, guardian listings, and address details.
* `students.archive`: Archive a student record or flag status transitions.

---

## 🌐 Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/students/admission` | Admit student, save guardians, and upload files | Yes (`students.admit`) |
| `GET` | `/students` | Paginated search list of student records | Yes (`students.read`) |
| `GET` | `/students/:id` | Fetch detail card of a student, guardians, and documents | Yes (`students.read`) |
| `POST` | `/students/:id/promote` | Promote a student to a new class level | Yes (`students.update`) |

---

## 🗄️ Database Models
* `Student`: Core personal details (separated names, blood group, address lists).
* `Enrollment`: Yearly mapping table containing a student's placement (`academicYearId`, `classId`, `sectionId`) and `rollNumber`.
* `StudentGuardian`: Father, Mother, or Local Guardian metadata links.
* `StudentDocument`: Stores links to Cloudinary-stored scanned documents (birth certificates, migration paper PDFs).

---

## 📦 Dependencies
* **Upload Pipeline**: Composes Cloudinary media helpers for PDF documents and image attachments storage.
* **Academic Engine Validation**: References Academic Year, Class, and Section repositories to enforce referential integrity during admission.
* **Audit System**: Invokes the shared audit logs writer to record student actions.

---

## 🔮 Future Work
* Integrate Student attendance mapping links.
* Support parent portals allowing guardians to log in and review details.
