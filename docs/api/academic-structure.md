# Academic Engine API

Base path: `/api/v1/academic-structure`. All routes require authentication (`requireAuth`) plus one of the permissions below. All responses use the standard envelope: `{ success, message, data, errors }`.

| Permission | Grants |
|---|---|
| `academic.read` | All `GET` routes below |
| `academic.create` | All `POST` create routes (not `/archive`) |
| `academic.update` | All `PUT` update routes |
| `academic.archive` | All `POST .../archive` routes and all `DELETE` routes |

## Aggregate

### `GET /structure?academicYearId=<uuid>`
Returns the whole tree for one academic year (defaults to whichever `AcademicYear` has `isCurrent: true` if `academicYearId` is omitted).

```json
{
  "academicYear": { "id": "...", "label": "2082/83", "isCurrent": true, "...": "..." },
  "summary": { "classes": 10, "sections": 24, "subjects": 18, "classSubjects": 72, "examTypes": 3 },
  "classes": [
    {
      "id": "...", "name": "Grade 10", "displayOrder": 10,
      "sections": [{ "id": "...", "name": "A", "capacity": 40 }],
      "subjects": [{ "id": "...", "fullMarks": 100, "passMarks": 40, "subject": { "id": "...", "name": "Mathematics" } }]
    }
  ],
  "subjects": [{ "id": "...", "name": "Mathematics", "code": "MATH" }],
  "examTypes": [{ "id": "...", "name": "First Terminal", "weightage": 20 }]
}
```

`summary` is computed in-memory from the fetched tree — no extra queries.

## Classes — `/classes`
| Method | Path | Body / Query |
|---|---|---|
| POST | `/classes` | `{ academicYearId, name, displayOrder, description? }` |
| GET | `/classes?academicYearId=&includeArchived=` | — |
| GET | `/classes/:id` | — |
| PUT | `/classes/:id` | `{ name?, displayOrder?, description? }` |
| POST | `/classes/:id/archive` | — |
| DELETE | `/classes/:id` | Rejected (409) if the class has sections or class subjects — archive instead |

Unique per `(academicYearId, name)`.

## Sections — `/sections`
| Method | Path | Body / Query |
|---|---|---|
| POST | `/sections` | `{ classId, name, capacity?, roomNumber? }` |
| GET | `/sections?classId=&includeArchived=` | — |
| GET | `/sections/:id` | — |
| PUT | `/sections/:id` | `{ name?, capacity?, roomNumber? }` |
| POST | `/sections/:id/archive` | — |
| DELETE | `/sections/:id` | — |

Unique per `(classId, name)`.

## Subjects — `/subjects`
Global catalog, not year-scoped.

| Method | Path | Body / Query |
|---|---|---|
| POST | `/subjects` | `{ name, code?, description?, isOptional? }` |
| GET | `/subjects?includeArchived=` | — |
| GET | `/subjects/:id` | — |
| PUT | `/subjects/:id` | `{ name?, code?, description?, isOptional? }` |
| POST | `/subjects/:id/archive` | — |
| DELETE | `/subjects/:id` | — |

`name` and `code` are each globally unique.

## Class Subjects — `/class-subjects`
Per-class subject assignment with marks configuration.

| Method | Path | Body / Query |
|---|---|---|
| POST | `/class-subjects` | `{ classId, subjectId, fullMarks, passMarks, hasPractical, theoryMarks?, practicalMarks?, practicalPassMarks? }` |
| GET | `/class-subjects?classId=` | — |
| GET | `/class-subjects/:id` | — |
| PUT | `/class-subjects/:id` | Same fields as create, all optional |
| DELETE | `/class-subjects/:id` | — |

Marks validation (`validateMarksConsistency` in `class-subject.validator.ts`):
- `passMarks` ≤ `fullMarks`.
- If `hasPractical`: `theoryMarks` and `practicalMarks` are required and must sum to `fullMarks`; `passMarks` ≤ `theoryMarks`; `practicalPassMarks` required, between 1 and `practicalMarks`.
- If not `hasPractical`: `theoryMarks`/`practicalMarks`/`practicalPassMarks` must all be blank.

Unique per `(classId, subjectId)`. No archive route — `ClassSubject` is a pure join and is deleted rather than archived.

## Exam Types — `/exam-types`
Reusable exam *templates* (First Terminal, Mid-Term, Final, Practical, Internal Assessment). Not scheduled exam instances — those belong to a future Examination Engine.

| Method | Path | Body / Query |
|---|---|---|
| POST | `/exam-types` | `{ academicYearId, name, code?, description?, displayOrder, weightage, isPublished? }` |
| GET | `/exam-types?academicYearId=&includeArchived=` | — |
| GET | `/exam-types/:id` | — |
| PUT | `/exam-types/:id` | Same fields as create (minus `academicYearId`), all optional |
| POST | `/exam-types/:id/archive` | — |
| DELETE | `/exam-types/:id` | — |

Unique per `(academicYearId, name)`. `weightage` values across an academic year's active exam types are not currently validated to sum to 100 — this is a candidate check for the future Examination Engine once real exam instances consume it.
