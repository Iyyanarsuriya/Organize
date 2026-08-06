# OrganizerPro Operations Application

This directory contains the standalone, single-sector codebase for **OrganizerPro Operations**.

## Architecture & Overview

The application is structured into a streamlined React (Vite) frontend and Node.js (Express) backend.

### Key Modules:
- **Operations Control Center**: Centralized hub connecting all operational modules.
- **Attendance Tracker**: Daily check-ins, permissions, overtime, leave allocations (CL/SL/EL), shifts, and holidays.
- **Expenses & Financial Tracker**: Income/expense vouchers, categorized transactions, and financial reports.
- **Operations Payroll**: Automated monthly salary slips, wage calculations (daily, monthly, piece-rate), and advance deductions.
- **Team Management**: Staff profiles, roles, permissions, and member portal credentials.
- **Reminders & Notes**: Task management, priority tagging, and sticky notes.
- **Employee Portal**: Dedicated portal for staff members to check leave balances, attendance logs, and payslips.

---

## Directory Structure

```
.
├── database/
│   ├── init_db.js              # Database creation and initialization script
│   └── schema_operations.sql   # SQL schema for organize_operations database
├── frontend/                   # React + Vite + Tailwind CSS frontend
│   └── src/
│       ├── components/         # Shared components (Navbar, Modals, Export Utils)
│       └── pages/
│           ├── Authentication/ # Login & Signup pages
│           └── OperationsSector/
│               ├── AttendanceTracker/
│               ├── EmployeePortal/
│               ├── ExpenseTracker/
│               ├── Payroll/
│               ├── ReminderTracker/
│               └── Team/
└── backend/                    # Node.js + Express + MySQL backend
    ├── database/
    └── src/
        ├── controllers/        # Operations API controllers
        ├── models/             # Database models for operations_ tables
        └── routes/             # Express API routers
```

---

## Database Setup

Initialize the MySQL database:

```bash
cd backend
node database/init_db.js
```

Database Name: `organize_operations` (configured in [`backend/.env`](file:///f:/manufacturing/backend/.env#L5))
