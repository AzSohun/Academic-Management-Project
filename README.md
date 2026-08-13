# Academic Management System (AMS)

A comprehensive role-based Assignment & Submission Management System built for educational institutions. The platform allows administrators to manage academic operations, teachers to create and grade assignments, and students to submit coursework seamlessly.

---

## 🚀 Key Features & Responsibilities

### 1. Admin Dashboard
* **User Management:** Oversee and manage users across the platform.
* **Class & Subject Management:** Create and manage classes/courses and subjects.
* **Allocations:** Assign teachers to specific subjects and classes.
* **System Oversight:** View all assignments and submissions, and manage application-level settings.
* **Robust Business Rules:** Built-in safeguards to prevent duplicate entities and unauthorized self-deletion.

### 2. Teacher Dashboard
* **Assignment Lifecycle:** Create, update, delete, and publish assignments (or save them as drafts).
* **Targeted Allocation:** Assign specific tasks to targeted classes/courses with custom titles, descriptions, deadlines, and maximum marks boundaries.
* **Evaluation:** Review student submissions, assign marks, provide constructive feedback, and change submission statuses when necessary.

### 3. Student Dashboard
* **Coursework Tracking:** View assignments assigned specifically to enrolled classes/courses along with details and deadlines.
* **Submission System:** Submit answers securely and update submissions prior to the deadline (where permitted).
* **Feedback Portal:** Monitor submission status, final marks, and teacher remarks.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js, React, TypeScript, Responsive UI, Tailwind CSS, Form Validation, API Integration |
| **Backend** | ASP.NET Core Web API, C#, RESTful API architecture, Fluent Validation, Centralized Error Handling, Swagger/OpenAPI |
| **Database** | PostgreSQL / Entity Framework Core (Code First approach with Migrations) |
| **Authentication** | Secure Login, JWT-based Authentication, and Role-Based Authorization (RBAC) |
| **Testing** | xUnit (In-Memory Database testing covering core business rules, authorization, and workflows) |

---

## 🧪 Testing & Verification
The backend includes a comprehensive test suite using **xUnit**. 
* **Test Status:** **14/14 Unit Tests Passing Successfully** ✅
* **Covered Scenarios:**
  * **Admin Service:** Duplicate class prevention and self-deletion block rules.
  * **Auth Service:** Successful token generation, invalid password validation, and unregistered email handling.
  * **Student Service:** Deadline validation (preventing late submissions and unauthorized updates).
  * **Teacher Service:** Role authorization checks and strict maximum-marks boundary enforcement.

---

## 🔐 Demo Credentials

Use the following credentials to explore the different role-based dashboards:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@scms.com` | `scms@Pass123` |
| **Teacher** | `abadur.rahman@scms.com` | `abadur.r@Pass123` |
| **Student** | `araf.islam@scms.com` | `araf.i@Pass123` |

---

## ⚙️ Easy Local Setup Instructions

Follow the steps below to run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone [https://github.com/AzSohun/Academic-Management-Project.git](https://github.com/AzSohun/Academic-Management-Project.git)
cd Academic-Management-Project
