# System Configuration Engine

## 🎯 Purpose
The System Configuration Engine establishes global operational metadata for the ERP. This includes maintaining the school profile, managing institutional branding assets (logos, signatures), structuring academic years and terms calendars, setting up grading scales, and housing general system settings.

---

## 🏗️ Architecture & Workflow
1. **School Profile Configuration**:
   * Saves profile characteristics (official name, short code, coordinates, contact info).
   * Manages Cloudinary assets uploads for school official header logo and verified signatures.
2. **Academic Scheduling**:
   * Creates academic years (e.g. `2025/2026`) and scopes active calendars.
   * Defines terms partitions (e.g. First Term, Mid-Term, Final Exams) within an active academic year.
3. **Grading Metrics**:
   * Configures standardized grade ranges (marks bounds, GPA points, remarks).

---

## 🔑 Permissions
* `system.read`: View system configs and parameters.
* `system.write`: Change profile details, upload logos, and modify grading scales.

---

## 🌐 Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/system-config/profile` | Read institutional profile metadata | Yes (`system.read`) |
| `PUT` | `/system-config/profile` | Update profile data and configuration | Yes (`system.write`) |
| `GET` | `/system-config/academic-years` | List academic years | Yes (`system.read`) |
| `POST` | `/system-config/academic-years` | Create a new academic calendar year | Yes (`system.write`) |
| `GET` | `/system-config/grading-scale` | List custom GPA and marks scales | Yes (`system.read`) |

---

## 🗄️ Database Models
* `SchoolProfile`: Contains campus name, short prefix code (used for ticket/roll generations), address, and branding resources.
* `SchoolLeadership`: Stores registry lists of school board/principals directory.
* `AcademicYear`: Standard academic cycle mapping (Year Label, Start Date, End Date, Status).
* `AcademicTerm`: Scoped calendar periods within an Academic Year.
* `GradingScale`: Maps grades (e.g., A+, B) to range rules, GPAs, and remarks.
* `SystemSetting`: Key-value registry for system-wide flags.

---

## 📦 Dependencies
* **Files Utilities**: Integrates with Cloudinary API and upload middleware for handling profile branding assets.
* **Downstream Consumers**: Used by all student/faculty/academic modules to map enrollment sequences and validate active calendar boundaries.

---

## 🔮 Future Work
* Build a School Onboarding Setup Wizard to initialize a new school's data interactively.
* Support localized calendar conversions (e.g. converting between Nepalese Bikram Sambat and Gregorian calendars).
