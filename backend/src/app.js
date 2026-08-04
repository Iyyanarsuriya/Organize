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
// MANUFACTURING SECTOR ROUTES
// ==========================================
const mfgRouter = express.Router();
mfgRouter.use(withSector('manufacturing'));
mfgRouter.use('/reminders', require("./routes/Manufacturing/reminderRoutes"));
mfgRouter.use('/reminder-categories', require("./routes/Manufacturing/reminderCategoryRoutes"));
mfgRouter.use('/transactions', transactionRoutes);
mfgRouter.use('/members', require("./routes/Common/memberRoutes"));
mfgRouter.use('/member-roles', require("./routes/Common/memberRoleRoutes"));
mfgRouter.use('/attendance', require("./routes/Manufacturing/attendanceRoutes"));
mfgRouter.use('/projects', require("./routes/Common/projectRoutes"));
mfgRouter.use('/work-logs', require("./routes/Manufacturing/dailyWorkLogRoutes"));
mfgRouter.use('/vehicle-logs', require("./routes/Manufacturing/vehicleLogRoutes"));
mfgRouter.use('/team', require("./routes/Manufacturing/teamRoutes"));
mfgRouter.use('/notes', require("./routes/Manufacturing/noteRoutes"));
mfgRouter.use('/expense-categories', require("./routes/Manufacturing/mfgExpenseCategoryRoutes"));
mfgRouter.use('/payroll', require("./routes/Manufacturing/payrollRoutes"));

app.use('/api/manufacturing-sector', mfgRouter);

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
    console.log(`Manufacturing Backend Server running on port ${PORT}`);
});
