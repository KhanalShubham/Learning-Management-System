# Authentication & User Accounts Engine

## 🎯 Purpose
The Authentication & User Accounts Engine acts as the primary access gateway for the ERP. It manages user credentials, handles secure login sessions, manages JSON Web Tokens (JWT), maintains password resets, and resolves user roles and security permissions (RBAC).

---

## 🏗️ Architecture & Workflow
1. **Login Workflow**:
   * Client posts credentials to `POST /auth/login`.
   * Credentials validation and database password comparison (bcrypt verification).
   * Generates a pair of JWTs (Access Token + Refresh Token). Access Token is stored in-memory (or authorization header) on the client, and Refresh Token is returned as a secure HTTP-only cookie.
2. **Access Protection**:
   * Incoming requests are intercepted by `auth.middleware.ts` which decodes and validates access tokens.
3. **Token Refresh Queuing**:
   * When the access token expires, client requests are queued and a refresh request is executed automatically. If token refresh fails, the session is marked as expired, prompting user redirect.
4. **Password Reset Flow**:
   * Users request reset token via email. A transaction tokens system saves the token and triggers mail dispatch. User resets password using the token, which is invalidated after use.

---

## 🔑 Permissions
Auth configuration uses the dynamic authorization middleware checking for:
* Super Admin wildcard check: Bypass all permission limits.
* Custom user role permissions assigned to specific routes.

---

## 🌐 Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Log in user and set cookie session | No |
| `POST` | `/auth/logout` | Clear user refresh token session | Yes |
| `POST` | `/auth/refresh` | Generate new access/refresh tokens | Yes |
| `POST` | `/auth/forgot-password` | Request password reset verification link | No |
| `POST` | `/auth/reset-password` | Set new password with reset token | No |
| `GET` | `/auth/me` | Fetch active user credentials and privileges | Yes |

---

## 🗄️ Database Models
* `User`: Stores logins, user status, passwords, and links to profiles.
* `Role`: Stores custom role definitions (e.g., Administrator, Teacher).
* `Permission`: Stores permissions (e.g., `academic.create`, `students.admit`).
* `RolePermission`: Mapping table connecting roles and permission tiers.
* `UserRole`: Mapping table matching users and active role states.
* `PasswordResetToken`: Stores tokens and validation thresholds.

---

## 📦 Dependencies
* **Libraries**: `jsonwebtoken` (token generation), `bcrypt` (password hashes), `cookie-parser` (refresh cookie collection), `zod` (payload validation).
* **Cross-Engine**: Serves as the foundation middleware for all other engines.

---

## 🔮 Future Work
* Integrate Multi-Factor Authentication (MFA / 2FA) support.
* Add native OAuth2 configurations for single sign-on (SSO) with third parties.
