const db = require('../config/db');

// --- OPERATIONS TABLE CONFIGURATION ---
const getTables = () => ({ holidays: 'operations_holidays', shifts: 'operations_shifts' });

// --- OPERATIONS ATTENDANCE MODEL ---
const OperationsAttendanceModel = {
    create: async (data) => {
        const {
            user_id, status, date, member_id, project_id, created_by,
            subject, note, check_in, check_out, total_hours, work_mode,
            permission_duration, permission_start_time, permission_end_time, permission_reason,
            overtime_duration, overtime_reason
        } = data;

        const [res] = await db.query(
            `INSERT INTO operations_attendance (
                user_id, status, date, member_id, project_id, created_by,
                subject, note, check_in, check_out, total_hours, work_mode,
                permission_duration, permission_start_time, permission_end_time, permission_reason,
                overtime_duration, overtime_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, status, date, member_id, project_id, created_by,
                subject || 'Daily Attendance', note, check_in, check_out, total_hours || 0, work_mode || 'Office',
                permission_duration, permission_start_time, permission_end_time, permission_reason,
                overtime_duration, overtime_reason
            ]
        );
        return { id: res.insertId, ...data };
    },

    update: async (id, userId, data) => {
        const {
            status, date, project_id, updated_by,
            subject, note, check_in, check_out, total_hours, work_mode,
            permission_duration, permission_start_time, permission_end_time, permission_reason,
            overtime_duration, overtime_reason
        } = data;

        const [res] = await db.query(
            `UPDATE operations_attendance SET 
                status=?, date=?, project_id=?, updated_by=?,
                subject=?, note=?, check_in=?, check_out=?, total_hours=?, work_mode=?,
                permission_duration=?, permission_start_time=?, permission_end_time=?, permission_reason=?,
                overtime_duration=?, overtime_reason=?
            WHERE id=? AND user_id=?`,
            [
                status, date, project_id, updated_by,
                subject, note, check_in, check_out, total_hours, work_mode,
                permission_duration, permission_start_time, permission_end_time, permission_reason,
                overtime_duration, overtime_reason,
                id, userId
            ]
        );
        return res.affectedRows > 0;
    },

    delete: async (id, userId) => {
        const [res] = await db.query(`DELETE FROM operations_attendance WHERE id = ? AND user_id = ?`, [id, userId]);
        return res.affectedRows > 0;
    },

    getAll: async (userId, filters = {}) => {
        let query = `
            SELECT a.*, w.name as member_name, w.role as member_role, p.name as project_name 
            FROM operations_attendance a 
            LEFT JOIN operations_members w ON a.member_id = w.id 
            LEFT JOIN operations_projects p ON a.project_id = p.id
            WHERE a.user_id = ?`;
        const params = [userId];

        if (filters.projectId) { query += ' AND a.project_id = ?'; params.push(filters.projectId); }
        if (filters.memberId) { query += ' AND a.member_id = ?'; params.push(filters.memberId); }

        if (filters.startDate && filters.endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            params.push(filters.startDate, filters.endDate);
        } else if (filters.period) {
            if (filters.period.length === 10) {
                query += ' AND DATE(a.date) = ?';
                params.push(filters.period);
            } else if (filters.period.length === 7) {
                query += " AND DATE_FORMAT(a.date, '%Y-%m') = ?";
                params.push(filters.period);
            } else if (filters.period.length === 4) {
                query += " AND DATE_FORMAT(a.date, '%Y') = ?";
                params.push(filters.period);
            }
        }

        query += ' ORDER BY a.date DESC, a.created_at DESC';
        const [rows] = await db.query(query, params);
        return rows;
    },

    getStats: async (userId, filters = {}) => {
        let query = `SELECT status, COUNT(*) as count FROM operations_attendance WHERE user_id=?`;
        const params = [userId];

        if (filters.projectId) { query += ' AND project_id = ?'; params.push(filters.projectId); }
        if (filters.memberId) { query += ' AND member_id = ?'; params.push(filters.memberId); }

        if (filters.startDate && filters.endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(filters.startDate, filters.endDate);
        } else if (filters.period) {
            if (filters.period.length === 10) {
                query += ' AND DATE(date) = ?';
                params.push(filters.period);
            } else {
                query += " AND DATE_FORMAT(date, '%Y-%m') = ?";
                params.push(filters.period);
            }
        }

        query += ` GROUP BY status`;
        const [rows] = await db.query(query, params);
        return rows;
    },

    getSummary: async (userId, filters = {}) => {
        let query = `
            SELECT 
                w.id, w.name, w.role,
                COUNT(a.id) as total,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late,
                SUM(CASE WHEN a.status = 'half-day' THEN 1 ELSE 0 END) as half_day,
                SUM(CASE WHEN a.status = 'permission' THEN 1 ELSE 0 END) as permission,
                SUM(CASE WHEN a.status = 'week_off' THEN 1 ELSE 0 END) as week_off,
                SUM(CASE WHEN a.status = 'holiday' THEN 1 ELSE 0 END) as holiday,
                SUM(CASE WHEN a.status = 'CL' THEN 1 ELSE 0 END) as CL,
                SUM(CASE WHEN a.status = 'SL' THEN 1 ELSE 0 END) as SL,
                SUM(CASE WHEN a.status = 'EL' THEN 1 ELSE 0 END) as EL,
                SUM(CASE WHEN a.status = 'OD' THEN 1 ELSE 0 END) as OD,
                COALESCE(SUM(a.total_hours), 0) as total_hours
            FROM operations_members w 
            LEFT JOIN operations_attendance a ON w.id = a.member_id AND a.user_id = ?`;
        const params = [userId];

        if (filters.startDate && filters.endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            params.push(filters.startDate, filters.endDate);
        } else if (filters.period) {
            if (filters.period.length === 10) {
                query += ' AND DATE(a.date) = ?';
                params.push(filters.period);
            } else {
                query += " AND DATE_FORMAT(a.date, '%Y-%m') = ?";
                params.push(filters.period);
            }
        }

        query += ` WHERE w.user_id = ? AND w.status = 'active'`;
        params.push(userId);

        if (filters.role) {
            query += ` AND w.role = ?`;
            params.push(filters.role);
        }

        query += ` GROUP BY w.id ORDER BY w.name ASC`;
        const [rows] = await db.query(query, params);
        return rows;
    },

    quickMark: async (data) => {
        const { user_id, member_id, date, status, updated_by } = data;
        const [existing] = await db.query(`SELECT id FROM operations_attendance WHERE user_id=? AND member_id=? AND DATE(date)=?`, [user_id, member_id, date]);

        if (existing.length > 0) {
            const {
                subject, note, check_in, check_out, total_hours, work_mode,
                permission_duration, permission_start_time, permission_end_time, permission_reason,
                overtime_duration, overtime_reason, project_id
            } = data;

            const updates = [];
            const params = [];

            if (status !== undefined) { updates.push('status=?'); params.push(status); }
            if (updated_by !== undefined) { updates.push('updated_by=?'); params.push(updated_by); }
            if (subject !== undefined) { updates.push('subject=?'); params.push(subject); }
            if (note !== undefined) { updates.push('note=?'); params.push(note); }
            if (check_in !== undefined) { updates.push('check_in=?'); params.push(check_in); }
            if (check_out !== undefined) { updates.push('check_out=?'); params.push(check_out); }
            if (total_hours !== undefined) { updates.push('total_hours=?'); params.push(total_hours); }
            if (work_mode !== undefined) { updates.push('work_mode=?'); params.push(work_mode); }
            if (permission_duration !== undefined) { updates.push('permission_duration=?'); params.push(permission_duration); }
            if (permission_start_time !== undefined) { updates.push('permission_start_time=?'); params.push(permission_start_time); }
            if (permission_end_time !== undefined) { updates.push('permission_end_time=?'); params.push(permission_end_time); }
            if (permission_reason !== undefined) { updates.push('permission_reason=?'); params.push(permission_reason); }
            if (overtime_duration !== undefined) { updates.push('overtime_duration=?'); params.push(overtime_duration); }
            if (overtime_reason !== undefined) { updates.push('overtime_reason=?'); params.push(overtime_reason); }
            if (project_id !== undefined) { updates.push('project_id=?'); params.push(project_id); }

            if (updates.length > 0) {
                params.push(existing[0].id);
                await db.query(`UPDATE operations_attendance SET ${updates.join(', ')} WHERE id=?`, params);
            }
            return { id: existing[0].id, updated: true };
        }
        return OperationsAttendanceModel.create({ ...data, created_by: updated_by });
    }
};

// --- CORE ATTENDANCE FUNCTIONS ---
const findById = async (id) => {
    const [rows] = await db.query(`SELECT * FROM operations_attendance WHERE id = ?`, [id]);
    return rows[0];
};

const create = async (data) => OperationsAttendanceModel.create(data);
const getAllByUserId = async (userId, filters = {}) => OperationsAttendanceModel.getAll(userId, filters);
const update = async (id, userId, data) => OperationsAttendanceModel.update(id, userId, data);
const deleteResult = async (id, userId) => OperationsAttendanceModel.delete(id, userId);
const getStats = async (userId, filters = {}) => OperationsAttendanceModel.getStats(userId, filters);
const getMemberSummary = async (userId, filters = {}) => OperationsAttendanceModel.getSummary(userId, filters);
const quickMark = async (data) => OperationsAttendanceModel.quickMark(data);

const bulkMark = async (data) => {
    const { user_id, member_ids, date, status, updated_by, check_in, payloads } = data;

    if (payloads && Array.isArray(payloads)) {
        const promises = payloads.map(p => OperationsAttendanceModel.quickMark({ ...p, user_id, updated_by }));
        await Promise.all(promises);
        return { count: payloads.length };
    }

    if (!member_ids || member_ids.length === 0) return { count: 0 };
    const promises = member_ids.map(mid => OperationsAttendanceModel.quickMark({ user_id, member_id: mid, date, status, updated_by, check_in }));
    await Promise.all(promises);
    return { count: member_ids.length };
};

// --- HOLIDAY MANAGEMENT ---
const getHolidays = async (userId) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM operations_holidays WHERE user_id = ? ORDER BY date`, [userId]);
        return rows;
    } catch (e) { return []; }
};

const createHoliday = async (data) => {
    const { user_id, name, date, type } = data;
    const [result] = await db.execute(
        `INSERT INTO operations_holidays (user_id, name, date, type) VALUES (?, ?, ?, ?)`,
        [user_id, name, date, type || 'National']
    );
    return { id: result.insertId, ...data };
};

const deleteHoliday = async (id, userId) => {
    const [result] = await db.execute(`DELETE FROM operations_holidays WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

// --- SHIFT MANAGEMENT ---
const getShifts = async (userId) => {
    const [rows] = await db.execute(`SELECT * FROM operations_shifts WHERE user_id = ?`, [userId]);
    return rows;
};

const createShift = async (data) => {
    const { user_id, name, start_time, end_time, break_duration, is_default } = data;

    if (is_default) {
        await db.execute(`UPDATE operations_shifts SET is_default = 0 WHERE user_id = ?`, [user_id]);
    }

    const [result] = await db.execute(
        `INSERT INTO operations_shifts (user_id, name, start_time, end_time, break_duration, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, name, start_time, end_time, break_duration || 60, is_default || 0]
    );
    return { id: result.insertId, ...data };
};

const deleteShift = async (id, userId) => {
    const [result] = await db.execute(`DELETE FROM operations_shifts WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

module.exports = {
    create,
    findById,
    getAllByUserId,
    update,
    delete: deleteResult,
    getStats,
    getMemberSummary,
    quickMark,
    bulkMark,
    getHolidays,
    createHoliday,
    deleteHoliday,
    getShifts,
    createShift,
    deleteShift
};
