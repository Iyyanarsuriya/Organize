const Attendance = require('../../models/attendanceModel');
const db = require('../../config/db');

// --- SHARED UTILS ---
const checkPastDateRestriction = (req, targetDate) => {
    if (!req.user.owner_id) return null;
    const today = new Date().toISOString().split('T')[0];
    const checkDate = new Date(targetDate).toISOString().split('T')[0];
    return checkDate < today ? "Child users cannot modify attendance for previous days." : null;
};

// --- OPERATIONS ATTENDANCE CONTROLLER ---
const OperationsAttendanceController = {
    checkLock: async (userId, date) => {
        const month = new Date(date).getMonth() + 1;
        const year = new Date(date).getFullYear();
        const [locks] = await db.query(`SELECT id FROM operations_attendance_locks WHERE user_id = ? AND month = ? AND year = ? AND unlocked_at IS NULL`, [userId, month, year]);
        return locks.length > 0;
    },
    create: async (req, res) => {
        if (await OperationsAttendanceController.checkLock(req.user.data_owner_id, req.body.date)) {
            return res.status(403).json({ success: false, message: "Attendance is locked." });
        }
        const attendance = await Attendance.create({ ...req.body, user_id: req.user.data_owner_id, created_by: req.user.username });
        res.status(201).json({ success: true, data: attendance });
    },
    quickMark: async (req, res) => {
        const { status, member_id, date } = req.body;
        const userId = req.user.data_owner_id;

        try {
            if (await OperationsAttendanceController.checkLock(userId, date)) {
                return res.status(403).json({ success: false, message: "Attendance is locked for this period." });
            }

            const [existing] = await db.query(
                `SELECT status FROM operations_attendance WHERE user_id = ? AND member_id = ? AND DATE(date) = ?`,
                [userId, member_id, date]
            );

            const oldStatus = existing.length > 0 ? existing[0].status : null;

            if (oldStatus !== status) {
                const leaveTypes = ['CL', 'SL', 'EL'];

                if (leaveTypes.includes(oldStatus)) {
                    const oldField = `${oldStatus.toLowerCase()}_balance`;
                    await db.query(`UPDATE operations_members SET ${oldField} = ${oldField} + 1 WHERE id = ?`, [member_id]);
                }

                if (leaveTypes.includes(status)) {
                    const [member] = await db.query('SELECT cl_balance, sl_balance, el_balance FROM operations_members WHERE id = ?', [member_id]);
                    if (member.length > 0) {
                        const newField = `${status.toLowerCase()}_balance`;
                        if (member[0][newField] <= 0) {
                            return res.status(200).json({ success: false, message: `Insufficient ${status} balance.` });
                        }
                        await db.query(`UPDATE operations_members SET ${newField} = ${newField} - 1 WHERE id = ?`, [member_id]);
                    }
                }
            }

            const result = await Attendance.quickMark({ ...req.body, user_id: userId, updated_by: req.user.username });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Operations quickMark error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// --- CONTROLLER EXPORTS ---

const createAttendance = async (req, res) => {
    try {
        const restriction = checkPastDateRestriction(req, req.body.date);
        if (restriction) return res.status(403).json({ success: false, message: restriction });
        return OperationsAttendanceController.create(req, res);
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAttendances = async (req, res) => {
    try {
        const data = await Attendance.getAllByUserId(req.user.data_owner_id, { ...req.query, sector: 'operations' });
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateAttendance = async (req, res) => {
    try {
        const updated = await Attendance.update(req.params.id, req.user.data_owner_id, { ...req.body, updated_by: req.user.username, sector: 'operations' });
        res.status(updated ? 200 : 404).json({ success: updated, message: updated ? "Updated" : "Not found" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteAttendance = async (req, res) => {
    try {
        const deleted = await Attendance.delete(req.params.id, req.user.data_owner_id, 'operations');
        res.status(deleted ? 200 : 404).json({ success: deleted, message: deleted ? "Deleted" : "Not found" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAttendanceStats = async (req, res) => {
    try {
        const data = await Attendance.getStats(req.user.data_owner_id, { ...req.query, sector: 'operations' });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMemberSummary = async (req, res) => {
    try {
        const data = await Attendance.getMemberSummary(req.user.data_owner_id, { ...req.query, sector: 'operations' });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const quickMarkAttendance = async (req, res) => {
    try {
        const restriction = checkPastDateRestriction(req, req.body.date);
        if (restriction) return res.status(403).json({ success: false, message: restriction });
        return OperationsAttendanceController.quickMark(req, res);
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const bulkMarkAttendance = async (req, res) => {
    try {
        const result = await Attendance.bulkMark({ ...req.body, user_id: req.user.data_owner_id, updated_by: req.user.username, sector: 'operations' });
        res.status(200).json({ success: true, data: result });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// --- HOLIDAYS & SHIFTS ---
const getHolidays = async (req, res) => { try { res.json({ success: true, data: await Attendance.getHolidays(req.user.data_owner_id, 'operations') }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const createHoliday = async (req, res) => { try { res.json({ success: true, data: await Attendance.createHoliday({ ...req.body, user_id: req.user.data_owner_id, sector: 'operations' }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const deleteHoliday = async (req, res) => { try { await Attendance.deleteHoliday(req.params.id, req.user.data_owner_id, 'operations'); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };

const getShifts = async (req, res) => {
    try {
        const data = await Attendance.getShifts(req.user.data_owner_id, 'operations');
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const createShift = async (req, res) => {
    try {
        const data = await Attendance.createShift({ ...req.body, user_id: req.user.data_owner_id, sector: 'operations' });
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const deleteShift = async (req, res) => { try { await Attendance.deleteShift(req.params.id, req.user.data_owner_id, 'operations'); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };

// --- LOCKING ---
const lockAttendance = async (req, res) => {
    try {
        const { month, year } = req.body;
        const userId = req.user.data_owner_id;
        await db.query(`
            INSERT INTO operations_attendance_locks (user_id, month, year, locked_by, status, unlocked_at) 
            VALUES (?, ?, ?, ?, 'locked', NULL)
            ON DUPLICATE KEY UPDATE locked_by = VALUES(locked_by), status = 'locked', unlocked_at = NULL, locked_at = NOW()
        `, [userId, month, year, req.user.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const unlockAttendance = async (req, res) => {
    try {
        const { month, year, reason } = req.body;
        await db.query(`UPDATE operations_attendance_locks SET unlocked_by = ?, unlocked_at = NOW(), unlock_reason = ?, status = 'unlocked' WHERE user_id = ? AND month = ? AND year = ?`, [req.user.id, reason, req.user.data_owner_id, month, year]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getLockStatus = async (req, res) => {
    try {
        const { month, year } = req.query;
        const [locks] = await db.query(`SELECT * FROM operations_attendance_locks WHERE user_id = ? AND month = ? AND year = ?`, [req.user.data_owner_id, month, year]);
        res.json({ success: true, data: locks });
    } catch (e) {
        console.error('getLockStatus error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports = {
    createAttendance, getAttendances, updateAttendance, deleteAttendance, getAttendanceStats, getMemberSummary, quickMarkAttendance, bulkMarkAttendance,
    getHolidays, createHoliday, deleteHoliday, getShifts, createShift, deleteShift, lockAttendance, unlockAttendance, getLockStatus
};
