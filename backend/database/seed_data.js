const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function seedData() {
    const dbName = process.env.DB_NAME || "organize_operations";
    console.log(`Starting data seeding for database: ${dbName}...`);

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            port: Number(process.env.DB_PORT) || 3306,
            database: dbName,
            multipleStatements: true
        });

        console.log("Connected to MySQL database.");

        // Hash default password
        const hashedPassword = await bcrypt.hash("Password123!", 10);

        // 1. Create Admin & Manager Users
        console.log("Seeding Users...");
        await connection.query(`
            INSERT INTO users (id, username, email, mobile_number, password, role, sector)
            VALUES 
            (1, 'admin', 'admin@organizerpro.com', '9876543210', ?, 'admin', 'Operations'),
            (2, 'manager', 'manager@organizerpro.com', '9876543211', ?, 'manager', 'Operations')
            ON DUPLICATE KEY UPDATE 
                password = VALUES(password),
                role = VALUES(role);
        `, [hashedPassword, hashedPassword]);

        const adminId = 1;

        // 2. Operations Projects
        console.log("Seeding Projects...");
        await connection.query(`
            INSERT INTO operations_projects (id, user_id, name, description, status)
            VALUES 
            (1, ?, 'Assembly Line Alpha', 'Primary electro-mechanical assembly line', 'ongoing'),
            (2, ?, 'Electronics & PCB Unit', 'Surface-mount technology and circuit soldering', 'ongoing'),
            (3, ?, 'Quality Testing & Audit', 'Final precision inspection and load testing', 'ongoing'),
            (4, ?, 'Warehouse & Logistics Hub', 'Raw materials inventory and finished goods dispatch', 'ongoing')
            ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status);
        `, [adminId, adminId, adminId, adminId]);

        // 3. Operations Shifts
        console.log("Seeding Shifts...");
        await connection.query(`
            INSERT INTO operations_shifts (id, user_id, name, start_time, end_time, break_duration, is_default)
            VALUES 
            (1, ?, 'Morning General Shift', '08:00:00', '16:00:00', 60, 1),
            (2, ?, 'Evening Operational Shift', '16:00:00', '00:00:00', 60, 0),
            (3, ?, 'Night Production Shift', '00:00:00', '08:00:00', 60, 0)
            ON DUPLICATE KEY UPDATE name = VALUES(name);
        `, [adminId, adminId, adminId]);

        // 4. Member Roles
        console.log("Seeding Member Roles...");
        await connection.query(`
            INSERT INTO operations_member_roles (id, user_id, name)
            VALUES 
            (1, ?, 'Senior Production Supervisor'),
            (2, ?, 'Assembly Line Technician'),
            (3, ?, 'Quality Control Inspector'),
            (4, ?, 'Inventory & Logistics Operator'),
            (5, ?, 'Maintenance Specialist')
            ON DUPLICATE KEY UPDATE name = VALUES(name);
        `, [adminId, adminId, adminId, adminId, adminId]);

        // 5. Work Types
        console.log("Seeding Work Types...");
        await connection.query(`
            INSERT INTO operations_work_types (id, user_id, name)
            VALUES 
            (1, ?, 'Mechanical Assembly'),
            (2, ?, 'Electrical Soldering'),
            (3, ?, 'Quality Audit'),
            (4, ?, 'Packaging & Tagging'),
            (5, ?, 'Equipment Calibration')
            ON DUPLICATE KEY UPDATE name = VALUES(name);
        `, [adminId, adminId, adminId, adminId, adminId]);

        // 6. Expense Categories
        console.log("Seeding Expense Categories...");
        await connection.query(`
            INSERT INTO operations_expense_categories (id, user_id, name, color, type)
            VALUES 
            (1, ?, 'Raw Materials', '#ef4444', 'expense'),
            (2, ?, 'Machine Maintenance', '#f59e0b', 'expense'),
            (3, ?, 'Utilities & Power', '#3b82f6', 'expense'),
            (4, ?, 'Freight & Logistics', '#8b5cf6', 'expense'),
            (5, ?, 'Staff Refreshments', '#ec4899', 'expense'),
            (6, ?, 'Product Sales', '#10b981', 'income'),
            (7, ?, 'Scrap & Waste Sales', '#14b8a6', 'income'),
            (8, ?, 'Consulting Services', '#6366f1', 'income')
            ON DUPLICATE KEY UPDATE name = VALUES(name);
        `, [adminId, adminId, adminId, adminId, adminId, adminId, adminId, adminId]);

        // 7. Reminder Categories
        console.log("Seeding Reminder Categories...");
        await connection.query(`
            INSERT INTO operations_reminder_categories (id, user_id, name, color)
            VALUES 
            (1, ?, 'Maintenance', '#ef4444'),
            (2, ?, 'Compliance', '#f59e0b'),
            (3, ?, 'Inventory', '#3b82f6'),
            (4, ?, 'Payroll', '#10b981')
            ON DUPLICATE KEY UPDATE name = VALUES(name);
        `, [adminId, adminId, adminId, adminId]);

        // 8. Operations Members (Employees & Workers)
        console.log("Seeding Members...");
        await connection.query(`
            INSERT INTO operations_members (id, user_id, name, role, phone, email, status, wage_type, daily_wage, cl_balance, sl_balance, el_balance, member_type, project_id, shift_id, created_by)
            VALUES 
            (1, ?, 'Rajesh Sharma', 'Senior Production Supervisor', '9876543210', 'rajesh@organizerpro.com', 'active', 'monthly', 48000.00, 10.00, 8.00, 14.00, 'employee', 1, 1, 'admin'),
            (2, ?, 'Ananya Roy', 'Quality Control Inspector', '9876543211', 'ananya@organizerpro.com', 'active', 'monthly', 38000.00, 12.00, 10.00, 15.00, 'employee', 3, 1, 'admin'),
            (3, ?, 'Vikram Patel', 'Assembly Line Technician', '9876543212', 'vikram@organizerpro.com', 'active', 'daily', 950.00, 6.00, 5.00, 8.00, 'worker', 1, 2, 'admin'),
            (4, ?, 'Suresh Kumar', 'Inventory & Logistics Operator', '9876543213', 'suresh@organizerpro.com', 'active', 'piece_rate', 0.00, 5.00, 4.00, 6.00, 'worker', 4, 1, 'admin'),
            (5, ?, 'Priya Nair', 'Maintenance Specialist', '9876543214', 'priya@organizerpro.com', 'active', 'monthly', 42000.00, 11.00, 9.00, 12.00, 'employee', 2, 3, 'admin')
            ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), email = VALUES(email), daily_wage = VALUES(daily_wage);
        `, [adminId, adminId, adminId, adminId, adminId]);


        // Create Member User Accounts in \`users\` table for Member Portal Login
        console.log("Seeding Member User Credentials for Portal...");
        await connection.query(`
            INSERT INTO users (id, username, email, mobile_number, password, role, owner_id, local_id, sector)
            VALUES 
            (3, 'Rajesh Sharma', 'rajesh@organizerpro.com', '9876543210', ?, 'staff', 1, 1, 'Operations'),
            (4, 'Ananya Roy', 'ananya@organizerpro.com', '9876543211', ?, 'staff', 1, 2, 'Operations'),
            (5, 'Vikram Patel', 'vikram@organizerpro.com', '9876543212', ?, 'staff', 1, 3, 'Operations')
            ON DUPLICATE KEY UPDATE username = VALUES(username);
        `, [hashedPassword, hashedPassword, hashedPassword]);

        // 9. Operations Attendance (Past 30 days)
        console.log("Seeding Attendance Records...");
        const today = new Date();
        const attendanceRows = [];

        // Generate attendance records for past 25 days for members 1 to 5
        for (let d = 25; d >= 0; d--) {
            const dateObj = new Date(today);
            dateObj.setDate(today.getDate() - d);
            const dateStr = dateObj.toISOString().split('T')[0];
            const dayOfWeek = dateObj.getDay(); // 0 is Sunday

            for (let memberId = 1; memberId <= 5; memberId++) {
                let status = 'present';
                let checkIn = '08:05:00';
                let checkOut = '16:10:00';
                let totalHours = 8.00;
                let otDuration = null;
                let otReason = null;
                let permDuration = null;
                let permReason = null;

                if (dayOfWeek === 0) {
                    status = 'week_off';
                    checkIn = null;
                    checkOut = null;
                    totalHours = 0.00;
                } else if (d === 5 && memberId === 3) {
                    status = 'CL';
                    checkIn = null;
                    checkOut = null;
                    totalHours = 0.00;
                } else if (d === 10 && memberId === 2) {
                    status = 'SL';
                    checkIn = null;
                    checkOut = null;
                    totalHours = 0.00;
                } else if (d === 2 && memberId === 1) {
                    status = 'present';
                    otDuration = '2.5 hrs';
                    otReason = 'High priority client assembly sprint';
                    totalHours = 10.50;
                    checkOut = '18:30:00';
                } else if (d === 3 && memberId === 5) {
                    status = 'permission';
                    permDuration = '1.5 hrs';
                    permReason = 'Medical checkup';
                    checkIn = '09:30:00';
                } else if (d === 15 && memberId === 4) {
                    status = 'half-day';
                    totalHours = 4.00;
                    checkOut = '12:00:00';
                }

                attendanceRows.push([
                    adminId,
                    memberId,
                    status,
                    'Daily Attendance Log',
                    dateStr,
                    'System auto-logged attendance',
                    (memberId % 4) + 1, // project_id
                    checkIn,
                    checkOut,
                    totalHours,
                    'Office',
                    permDuration,
                    permDuration ? '10:00 AM' : null,
                    permDuration ? '11:30 AM' : null,
                    permReason,
                    otDuration,
                    otReason,
                    'admin'
                ]);
            }
        }

        // Clean existing mock attendance for predictable dataset
        await connection.query(`DELETE FROM operations_attendance WHERE user_id = ?;`, [adminId]);

        const attSql = `
            INSERT INTO operations_attendance 
            (user_id, member_id, status, subject, date, note, project_id, check_in, check_out, total_hours, work_mode, permission_duration, permission_start_time, permission_end_time, permission_reason, overtime_duration, overtime_reason, created_by)
            VALUES ?;
        `;
        await connection.query(attSql, [attendanceRows]);

        // 10. Work Logs (Piece-rate production)
        console.log("Seeding Work Logs...");
        await connection.query(`DELETE FROM operations_work_logs WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_work_logs (user_id, member_id, date, units_produced, rate_per_unit, work_type, notes)
            VALUES 
            (?, 4, CURDATE() - INTERVAL 1 DAY, 180.00, 15.00, 'Packaging & Tagging', 'Batch #A-101 completed ahead of schedule'),
            (?, 4, CURDATE() - INTERVAL 2 DAY, 210.00, 15.00, 'Packaging & Tagging', 'Batch #A-100 full inspection and packing'),
            (?, 4, CURDATE() - INTERVAL 3 DAY, 160.00, 15.00, 'Packaging & Tagging', 'Custom crate packing for export'),
            (?, 4, CURDATE() - INTERVAL 4 DAY, 195.00, 15.00, 'Packaging & Tagging', 'High volume cardboard boxing')
        ;`, [adminId, adminId, adminId, adminId]);

        // 11. Advances & Loans
        console.log("Seeding Member Advances...");
        await connection.query(`DELETE FROM operations_advances WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_advances (member_id, amount, advance_date, reason, total_deducted, balance, monthly_deduction, status, user_id, created_by)
            VALUES 
            (3, 5000.00, CURDATE() - INTERVAL 40 DAY, 'Festival & Emergency Medical Advance', 2000.00, 3000.00, 1000.00, 'active', ?, 'admin'),
            (4, 3000.00, CURDATE() - INTERVAL 20 DAY, 'Equipment & Tooling Advance', 1000.00, 2000.00, 1000.00, 'active', ?, 'admin')
        ;`, [adminId, adminId]);

        // 12. Payroll Settings
        console.log("Seeding Payroll Settings...");
        await connection.query(`
            INSERT INTO operations_payroll_settings (user_id, working_days_per_month, working_hours_per_day, working_hours_per_month, overtime_multiplier, auto_deduct_advances, advance_deduction_percentage, expense_approval_threshold, payroll_requires_approval, updated_by)
            VALUES (?, 26, 8, 208, 1.50, 1, 100, 10000.00, 1, 'admin')
            ON DUPLICATE KEY UPDATE 
                working_days_per_month = 26,
                overtime_multiplier = 1.50;
        `, [adminId]);

        // 13. Operations Payroll Payslips
        console.log("Seeding Payroll Records...");
        await connection.query(`DELETE FROM operations_payroll WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_payroll 
            (member_id, month, year, days_present, days_absent, days_half, days_leave, days_holiday, days_weekend, overtime_hours, base_amount, overtime_amount, gross_amount, advance_deducted, loan_deducted, other_deductions, total_deductions, net_amount, status, approved_by, approved_at, paid_at, payment_mode, project_id, notes, user_id, created_by)
            VALUES 
            (1, 7, 2026, 24, 0, 0, 2, 1, 4, 8.50, 48000.00, 2950.00, 50950.00, 0.00, 0.00, 500.00, 500.00, 50450.00, 'paid', 'admin', NOW(), NOW(), 'bank', 1, 'July salary paid via direct HDFC transfer', ?, 'admin'),
            (2, 7, 2026, 25, 0, 0, 1, 1, 4, 4.00, 38000.00, 1096.00, 39096.00, 0.00, 0.00, 0.00, 0.00, 39096.00, 'paid', 'admin', NOW(), NOW(), 'bank', 3, 'July salary finalized', ?, 'admin'),
            (3, 7, 2026, 22, 2, 0, 2, 1, 4, 12.00, 20900.00, 2137.50, 23037.50, 1000.00, 0.00, 0.00, 1000.00, 22037.50, 'approved', 'admin', NOW(), NULL, 'bank', 1, 'July wage statement verified', ?, 'admin'),
            (4, 7, 2026, 23, 1, 1, 1, 1, 4, 0.00, 24750.00, 0.00, 24750.00, 1000.00, 0.00, 0.00, 1000.00, 23750.00, 'approved', 'admin', NOW(), NULL, 'cash', 4, 'Piece rate calculation based on 1650 units', ?, 'admin'),
            (5, 7, 2026, 24, 0, 0, 2, 1, 4, 6.00, 42000.00, 1817.00, 43817.00, 0.00, 0.00, 0.00, 0.00, 43817.00, 'paid', 'admin', NOW(), NOW(), 'upi', 2, 'July maintenance salary released', ?, 'admin')
        ;`, [adminId, adminId, adminId, adminId, adminId]);

        // 14. Approvals
        console.log("Seeding Operations Approvals...");
        await connection.query(`DELETE FROM operations_approvals WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_approvals 
            (entity_type, entity_id, amount, title, description, requested_by, requested_at, approver_level, required_level, status, approved_by, approved_at, user_id)
            VALUES 
            ('expense', 101, 18500.00, 'High Grade Stainless Steel Sheets Procurement', 'Emergency raw material order for Batch #99', 'Rajesh Sharma', NOW() - INTERVAL 2 DAY, 1, 1, 'pending', NULL, NULL, ?),
            ('payroll', 1, 50450.00, 'July 2026 Monthly Executive Payroll - Rajesh Sharma', 'Final payslip verification & tax adjustment', 'admin', NOW() - INTERVAL 5 DAY, 1, 1, 'approved', 'admin', NOW() - INTERVAL 4 DAY, ?),
            ('attendance', 302, 0.00, 'Overtime Permission Request - 2.5 Hours', 'Assembly line sprint for export deadline', 'Vikram Patel', NOW() - INTERVAL 1 DAY, 1, 1, 'pending', NULL, NULL, ?)
        ;`, [adminId, adminId, adminId]);

        // 15. Transactions (Income & Expenses)
        console.log("Seeding Transactions...");
        await connection.query(`DELETE FROM operations_transactions WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_transactions 
            (user_id, title, amount, type, category, date, project_id, member_id, payment_status, payment_mode, auto_generated, quantity, unit_price)
            VALUES 
            (?, 'Bulk Circuit Board Delivery Payment', 145000.00, 'income', 'Product Sales', NOW() - INTERVAL 2 DAY, 2, 1, 'completed', 'Bank', 0, 500.00, 290.00),
            (?, 'Industrial Raw Aluminum Ingot Invoice', 42000.00, 'expense', 'Raw Materials', NOW() - INTERVAL 3 DAY, 1, NULL, 'completed', 'Bank', 0, 100.00, 420.00),
            (?, 'Monthly Factory Power & High Voltage Electricity Bill', 18500.00, 'expense', 'Utilities & Power', NOW() - INTERVAL 5 DAY, 1, NULL, 'completed', 'Bank', 0, 1.00, 18500.00),
            (?, 'CNC Milling Machine Spindle Repair & Lubricants', 6400.00, 'expense', 'Machine Maintenance', NOW() - INTERVAL 7 DAY, 1, 5, 'completed', 'UPI', 0, 1.00, 6400.00),
            (?, 'Finished Goods Freight Shipment - South Region', 12800.00, 'expense', 'Freight & Logistics', NOW() - INTERVAL 10 DAY, 4, 4, 'completed', 'Bank', 0, 1.00, 12800.00),
            (?, 'Scrap Metal & Off-cut Sales Proceeds', 8500.00, 'income', 'Scrap & Waste Sales', NOW() - INTERVAL 12 DAY, 1, NULL, 'completed', 'Cash', 0, 1.00, 8500.00),
            (?, 'Staff Canteen Tea, Snacks & Hydration Support', 3200.00, 'expense', 'Staff Refreshments', NOW() - INTERVAL 14 DAY, 1, NULL, 'completed', 'Cash', 0, 1.00, 3200.00),
            (?, 'Export Quality Mechanical Control Panel Order', 220000.00, 'income', 'Product Sales', NOW() - INTERVAL 18 DAY, 1, 1, 'completed', 'Bank', 0, 10.00, 22000.00)
        ;`, [adminId, adminId, adminId, adminId, adminId, adminId, adminId, adminId]);

        // 16. Vehicle Logs
        console.log("Seeding Vehicle Logs...");
        await connection.query(`DELETE FROM operations_vehicle_logs WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_vehicle_logs (user_id, vehicle_name, vehicle_number, driver_name, in_time, out_time, start_km, end_km, expense_amount, income_amount, notes)
            VALUES 
            (?, 'Tata Heavy Goods Truck', 'KA-01-MJ-8821', 'Suresh Kumar', NOW() - INTERVAL 1 DAY + INTERVAL 8 HOUR, NOW() - INTERVAL 1 DAY + INTERVAL 17 HOUR, 14200.00, 14380.00, 2400.00, 6500.00, 'Inter-factory raw material dispatch and return load'),
            (?, 'Mahindra Bolero Pickup Van', 'KA-04-EX-1290', 'Ramesh V', NOW() - INTERVAL 2 DAY + INTERVAL 9 HOUR, NOW() - INTERVAL 2 DAY + INTERVAL 15 HOUR, 28450.00, 28540.00, 1100.00, 0.00, 'Local hardware store spare parts pickup')
        ;`, [adminId, adminId]);

        // 17. Reminders
        console.log("Seeding Reminders...");
        await connection.query(`DELETE FROM operations_reminders WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_reminders (user_id, title, description, due_date, priority, is_completed, status, category)
            VALUES 
            (?, 'Quarterly CNC Machine Calibration & Oil Service', 'Schedule technician visit for Spindle #2 and Hydraulic oil replacement', NOW() + INTERVAL 2 DAY, 'high', 0, 'pending', 'Maintenance'),
            (?, 'Monthly Factory Pollution & Fire Safety Compliance Submission', 'Upload annual inspection certs to municipal portal', NOW() + INTERVAL 5 DAY, 'medium', 0, 'pending', 'Compliance'),
            (?, 'Reorder Stock: High Grade Soldering Wire (Min threshold alert)', 'Current stock down to 4 rolls', NOW() + INTERVAL 1 DAY, 'high', 0, 'pending', 'Inventory'),
            (?, 'Finalize & Approve August Staff Advance Deductions', 'Verify advance balances with accountant', NOW() - INTERVAL 2 DAY, 'low', 1, 'completed', 'Payroll')
        ;`, [adminId, adminId, adminId, adminId]);

        // 18. Notes
        console.log("Seeding Notes...");
        await connection.query(`DELETE FROM operations_notes WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_notes (user_id, title, content, color, is_pinned)
            VALUES 
            (?, 'Shift Handover & Safety Protocol', 'Ensure all emergency stop switches are tested before starting the morning assembly run. Wear safety goggles in Area 3.', 'yellow', 1),
            (?, 'Vendor Contacts & Escalation', 'Metal Supplies Ltd: +91 91234 56789 (Mr. Mehta)\\nCircuit Tech Pvt Ltd: +91 98112 23344 (Ms. Kapoor)', 'blue', 1),
            (?, 'ISO 9001 Quality Inspection Specs', 'Tolerance range for Series 4 casing must strictly remain within ±0.02mm. Reject batches exceeding variance.', 'green', 0)
        ;`, [adminId, adminId, adminId]);

        // 19. Holidays
        console.log("Seeding Holidays...");
        await connection.query(`DELETE FROM operations_holidays WHERE user_id = ?;`, [adminId]);
        await connection.query(`
            INSERT INTO operations_holidays (user_id, name, date, type)
            VALUES 
            (?, 'Independence Day', '2026-08-15', 'National'),
            (?, 'Ganesh Chaturthi', '2026-08-27', 'Regional'),
            (?, 'Gandhi Jayanti', '2026-10-02', 'National'),
            (?, 'Diwali Celebration', '2026-11-08', 'National'),
            (?, 'Christmas Day', '2026-12-25', 'National')
        ;`, [adminId, adminId, adminId, adminId, adminId]);

        console.log("\n==============================================");
        console.log("SUCCESS! All 22 database tables seeded cleanly.");
        console.log("==============================================");

    } catch (error) {
        console.error("Data seeding failed:", error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed.");
        }
    }
}

seedData();
