const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const authRoutes = require("./routes/Common/authRoutes");
const pushRoutes = require("./routes/Common/pushRoutes");
const transactionRoutes = require("./routes/Common/transactionRoutes");
const categoryRoutes = require("./routes/Common/categoryRoutes");
const expenseCategoryRoutes = require("./routes/Common/expenseCategoryRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

app.use("/api/auth", authRoutes);
app.use("/api/push", pushRoutes);

// Middleware to inject sector
const withSector = (sector) => (req, res, next) => {
    req.query.sector = sector;
    if (req.body && typeof req.body === 'object') {
        req.body.sector = sector;
    }
    next();
};

// ==========================================
// ==========================================
// OPERATIONS SECTOR ROUTES
// ==========================================
const opsRouter = express.Router();
opsRouter.use(withSector('manufacturing'));
opsRouter.use('/reminders', require("./routes/Operations/reminderRoutes"));
opsRouter.use('/reminder-categories', require("./routes/Operations/reminderCategoryRoutes"));
opsRouter.use('/transactions', transactionRoutes);
opsRouter.use('/members', require("./routes/Common/memberRoutes"));
opsRouter.use('/member-roles', require("./routes/Common/memberRoleRoutes"));
opsRouter.use('/attendance', require("./routes/Operations/attendanceRoutes"));
opsRouter.use('/projects', require("./routes/Common/projectRoutes"));
opsRouter.use('/work-logs', require("./routes/Operations/dailyWorkLogRoutes"));
opsRouter.use('/vehicle-logs', require("./routes/Operations/vehicleLogRoutes"));
opsRouter.use('/team', require("./routes/Operations/teamRoutes"));
opsRouter.use('/notes', require("./routes/Operations/noteRoutes"));
opsRouter.use('/expense-categories', require("./routes/Operations/opsExpenseCategoryRoutes"));
opsRouter.use('/payroll', require("./routes/Operations/payrollRoutes"));
opsRouter.use('/member-portal', require("./routes/Common/memberPortalRoutes"));

app.use('/api/operations-sector', opsRouter);
app.use('/api/manufacturing-sector', opsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', sector: 'manufacturing', timestamp: new Date() }));

// 404 Handler
app.use((req, res) => {
    console.error(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found', method: req.method, url: req.url });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Operations Backend Server running on port ${PORT}`);
});
