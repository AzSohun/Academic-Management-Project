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
| **Admin** | `admin@ams.com` | `Admin@123` |
| **Teacher** | `abadur.rahman@ams.com` | `Teacher@123` |
| **Student** | `araf.islam@ams.com` | `Student@123` |

---

## ⚙️ Easy Local Setup Instructions

Follow the steps below to run the project locally on your machine:

### Prerequisites
- **Backend:** .NET 8 SDK or higher, SQL Server or PostgreSQL
- **Frontend:** Node.js 18+ and npm/yarn
- **Database:** PostgreSQL (recommended) or SQL Server

### 1. Clone the Repository
```bash
git clone https://github.com/AzSohun/Academic-Management-Project.git
cd AMS-Project
```

### 2. Backend Setup (ASP.NET Core)

#### Step 2.1: Navigate to Backend Directory
```bash
cd Backend/AcademicManagementSystem
```

#### Step 2.2: Install Dependencies
```bash
dotnet restore
```

#### Step 2.3: Configure Database Connection
Update `appsettings.Development.json` with your database connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AcademicManagementSystem;User Id=sa;Password=YourPassword;"
  }
}
```

#### Step 2.4: Run Database Migrations
```bash
dotnet ef database update
```

#### Step 2.5: Run the Backend Server
```bash
dotnet run
```
The API will be available at `https://localhost:5001`
Swagger documentation: `https://localhost:5001/swagger`

---

### 3. Frontend Setup (Next.js)

#### Step 3.1: Navigate to Frontend Directory
```bash
cd Frontend
```

#### Step 3.2: Install Dependencies
```bash
npm install
# or
yarn install
```

#### Step 3.3: Configure Environment Variables
Create a `.env.local` file in the Frontend directory with:
```env
NEXT_PUBLIC_API_URL=https://localhost:5001
```

#### Step 3.4: Run the Development Server
```bash
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:3000`

---

### 4. Running Tests

#### Backend Unit Tests (xUnit)
```bash
cd Backend/AcademicManagementSystem.Tests
dotnet test --verbosity normal
```

**Expected Output:** 14/14 tests passing ✅

Test coverage includes:
- Admin Service Tests (duplicate prevention, self-deletion block)
- Auth Service Tests (token generation, password validation)
- Student Service Tests (deadline validation, unauthorized access prevention)
- Teacher Service Tests (authorization checks, marks boundary enforcement)

#### Frontend Tests (Optional)
```bash
cd Frontend
npm run test
```

---

### 5. Project Structure
```
AMS-Project/
├── Backend/
│   ├── AcademicManagementSystem/        # Main API project
│   │   ├── Controllers/                 # API endpoints
│   │   ├── Services/                    # Business logic
│   │   ├── Models/                      # Database models
│   │   ├── DTOs/                        # Data transfer objects
│   │   ├── Interfaces/                  # Service contracts
│   │   ├── Data/                        # Database context
│   │   └── Migrations/                  # EF Core migrations
│   └── AcademicManagementSystem.Tests/  # Unit tests
├── Frontend/
│   ├── app/                             # Next.js app directory
│   ├── components/                      # React components
│   ├── context/                         # React context (auth)
│   ├── pages/                           # Page routes
│   └── lib/                             # Utilities and API calls
└── README.md
```

---

## 📋 Quick Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Database connection fails** | Verify PostgreSQL is running and connection string is correct in `appsettings.json` |
| **Frontend can't reach backend** | Check `NEXT_PUBLIC_API_URL` in `.env.local` and ensure backend is running on the correct port |
| **Tests fail** | Run `dotnet ef database update` to ensure test database is migrated |
| **Port already in use** | Change port in `Program.cs` (backend) or `next.config.ts` (frontend) |

---

## 📖 Additional Resources
- [ASP.NET Core Documentation](https://docs.microsoft.com/dotnet/core/introduction)
- [Next.js Documentation](https://nextjs.org/docs)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)
- [JWT Authentication](https://jwt.io/)

---

## ✅ Verification Checklist

Before deployment, ensure:
- ✅ All 14 unit tests pass
- ✅ Frontend builds without errors (`npm run build`)
- ✅ Backend API is accessible and documented via Swagger
- ✅ Database migrations are applied successfully
- ✅ All three user roles can login with demo credentials
- ✅ No console errors in browser developer tools
