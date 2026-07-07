# Student Admission Engine API

Base path: `/api/v1/students`. All routes require authentication (`requireAuth`) plus one of the permissions below. All responses use the standard envelope: `{ success, message, data, errors }`.

| Permission | Grants |
|---|---|
| `students.read` | `GET` routes |
| `students.admit` | `POST /admission`, `POST /photo-upload`, `POST /document-upload` |
| `students.update` | `PUT /:id`, guardian and document management routes |
| `students.archive` | `POST /:id/status`, `DELETE /:id` |

## File uploads (plumbing only — no DB write)

### `POST /photo-upload`
Multipart, field `file`. Images only (JPEG/PNG/WEBP/SVG, 2MB max — same allowlist as Branding). Returns `{ photoUrl }`.

### `POST /document-upload`
Multipart, field `file`. Images or PDF (5MB max). Returns `{ fileUrl }`.

Both exist because a photo/document needs to be uploaded *before* the Student record exists (during the admission form). The returned URL goes into the `POST /admission` payload or a later `POST /:id/documents` call.

## Admission workflow

### `POST /admission`
```json
{
  "academicYearId": "uuid", "classId": "uuid", "sectionId": "uuid", "rollNumber": 1,
  "firstName": "Ram", "middleName": "", "lastName": "Sharma", "dateOfBirth": "2018-05-10", "gender": "MALE",
  "photoUrl": "https://...",
  "address": "...", "province": "...", "district": "...", "municipality": "...", "ward": "...",
  "temporaryAddress": "...", "temporaryProvince": "...", "temporaryDistrict": "...", "temporaryMunicipality": "...", "temporaryWard": "...",
  "bloodGroup": "O+", "allergies": "...", "medicalConditions": "...",
  "emergencyContactName": "...", "emergencyContactPhone": "...",
  "previousSchoolName": "...", "previousSchoolBoard": "...", "lastClassCompleted": "...", "transferCertificateNumber": "...",
  "feeCategory": "Regular",
  "guardians": [
    { "relation": "FATHER", "fullName": "Hari Sharma", "phone": "9800000000" },
    { "relation": "MOTHER", "fullName": "Sita Sharma", "phone": "9800000001" }
  ],
  "documents": [
    { "documentType": "BIRTH_CERTIFICATE", "fileUrl": "https://..." }
  ]
}
```
`academicYearId`/`classId`/`sectionId` are validated against the Academic Engine (year exists, class belongs to that year, section belongs to that class) before anything is written. Generates the admission number (`{schoolProfile.shortName}-{academicYear.startDate's year}-{seq}`, e.g. `DPS-2025-0001`, falling back to `SCH-` if no short code is configured) and creates the `Student`, its first `Enrollment` (carrying `classId`/`sectionId`/`rollNumber`), `StudentGuardian[]`, and `StudentDocument[]` atomically. `guardians` requires at least one entry; `documents` and `rollNumber` are optional. A duplicate `rollNumber` within the same section/year returns `409`. Returns `201` with the full student record (including relations).

## Student records

| Method | Path | Notes |
|---|---|---|
| GET | `/?academicYearId=&classId=&sectionId=&status=&search=&skip=&take=` | The academic-year/class/section filters match against `Enrollment`, not `Student` directly. `search` matches `firstName`, `lastName`, or `admissionNumber` (case-insensitive contains). Paginated (`skip`/`take`, default 0/20, max 100). |
| GET | `/:id` | Includes `enrollments` (all years, most recent first), `guardians`, and `documents`. |
| PUT | `/:id` | Profile fields only — class/section placement is never edited here; it lives on `Enrollment`, managed by the future Promotion/Transfer engines. |
| POST | `/:id/status` | `{ status: ACTIVE\|INACTIVE\|TRANSFERRED\|GRADUATED\|WITHDRAWN }` |
| DELETE | `/:id` | Cascades to `Enrollment`, guardians, and documents (no reference-count guard, unlike Class/Section — none of these have meaning independent of the student). |

## Guardians

| Method | Path | Notes |
|---|---|---|
| POST | `/:id/guardians` | `{ relation, fullName, phone, email?, occupation?, address? }`. Rejected (409) if that relation already exists for the student. |
| PUT | `/:id/guardians/:guardianId` | All fields except `relation` are updatable. |
| DELETE | `/:id/guardians/:guardianId` | — |

## Documents

| Method | Path | Notes |
|---|---|---|
| POST | `/:id/documents` | `{ documentType, fileUrl }` — `fileUrl` should come from `POST /document-upload`. |
| DELETE | `/:id/documents/:documentId` | — |

## Deferred to future sprints
- **Promotion** (year-end bulk move to the next class, creating a new `Enrollment` row) and **Transfer** (student leaving for another school, distinct from the `TRANSFERRED` status which already exists) are listed in the Student Engine's scope but not built in this sprint — there is no endpoint yet that creates a second `Enrollment` for an existing student.
- **Fee Category** is a plain string field; it becomes a proper FK once a Finance Engine exists.
