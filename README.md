# Manufacturing Sector Codebase Copy

This directory contains a clean, separate copy of all frontend and backend components related to the **Manufacturing Sector** of the OrganizerPro application. 

The original codebase has been left completely untouched. This standalone copy is intended for reference, isolated testing, or migration.

## Directory Structure

```
manufacturing/
├── database/
│   └── schema_manufacturing.sql    # Extracted SQL schemas for all manufacturing & shared tables
├── frontend/                       # React frontend files (from client/src/pages/ManufacturingSector)
│   ├── AttendanceTracker/
│   │   ├── AttendanceTracker.jsx
│   │   ├── CalendarManager.jsx
│   │   └── ShiftManager.jsx
│   ├── ExpenseTracker/
│   │   ├── Dashboard.jsx
│   │   ├── ExpenseTrackerMain.jsx
│   │   ├── Reports.jsx
│   │   ├── SalaryCalculator.jsx
│   │   └── Transactions.jsx
│   ├── Payroll/
│   │   └── ManufacturingPayroll.jsx
│   ├── ReminderTracker/
│   │   ├── MfgReminderDashboard.jsx
│   │   └── Reminders.jsx
│   ├── Team/
│   │   └── TeamManagement.jsx
│   └── ManufacturingHome.jsx
└── backend/                        # Node.js Express backend files
    ├── controllers/                # Manufacturing sector controllers
    │   ├── dailyWorkLogController.js
    │   ├── mfgExpenseCategoryController.js
    │   ├── noteController.js
    │   ├── payrollController.js
    │   ├── reminderCategoryController.js
    │   ├── reminderController.js
    │   ├── teamController.js
    │   └── vehicleLogController.js
    ├── routes/                     # Manufacturing sector API routes
    │   ├── attendanceRoutes.js
    │   ├── dailyWorkLogRoutes.js
    │   ├── mfgExpenseCategoryRoutes.js
    │   ├── noteRoutes.js
    │   ├── payrollRoutes.js
    │   ├── reminderCategoryRoutes.js
    │   ├── reminderRoutes.js
    │   ├── teamRoutes.js
    │   └── vehicleLogRoutes.js
    └── models/                     # Database models utilized by manufacturing routes
        ├── approvalModel.js
        ├── attendanceModel.js
        ├── dailyWorkLogModel.js
        ├── vehicleLogModel.js
        ├── workTypeModel.js
        ├── memberModel.js
        ├── projectModel.js
        ├── reminderModel.js
        ├── noteModel.js
        ├── expenseCategoryModel.js
        ├── categoryModel.js
        ├── transactionModel.js
        └── userModel.js
```

## Architecture & Integration

1. **Routing Mapping (Backend)**:
   In the main application, these routes are mounted in Express under:
   ```javascript
   const mfgRouter = express.Router();
   mfgRouter.use(withSector('manufacturing'));
   // Routes are mounted under /api/manufacturing-sector/...
   ```

2. **Database Isolation**:
   The manufacturing sector uses sector-specific tables prefix-isolated with `manufacturing_` to separate its data from other business sectors (IT, Hotel, Education). Shared tables such as `users` manage authentication globally.
