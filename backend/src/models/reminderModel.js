const db = require('../config/db');

const sanitizeDate = (date) => {
    if (!date) return null;
    if (typeof date === 'string') {
        if (date.length === 10) return date + ' 12:00:00';
        if (date.includes('T')) return date.replace('T', ' ').slice(0, 19);
    }
    if (date instanceof Date) {
        return date.toISOString().replace('T', ' ').slice(0, 19);
    }
    return date;
};

const formatUtcDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
        return dateStr.replace(' ', 'T') + 'Z';
    }
    return dateStr;
};

const formatLocalDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
        return dateStr.replace(' ', 'T');
    }
    return dateStr;
};

// --- OPERATIONS REMINDER MODEL ---
const OperationsReminderModel = {
    create: async (data) => {
        const { user_id, title, description, due_date, priority, category } = data;
        const [res] = await db.query(
            `INSERT INTO operations_reminders (user_id, title, description, due_date, priority, status, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, title, description, sanitizeDate(due_date), priority || 'medium', 'pending', category || 'General']
        );
        return {
            id: res.insertId,
            ...data,
            is_completed: 0,
            status: 'pending',
            category: category || 'General',
            created_at: new Date().toISOString()
        };
    },
    updateStatus: async (id, userId, is_completed) => {
        const status = is_completed ? 'completed' : 'pending';
        const [res] = await db.query(`UPDATE operations_reminders SET is_completed = ?, status = ? WHERE id = ? AND user_id = ?`, [is_completed, status, id, userId]);
        return res.affectedRows > 0;
    },
    update: async (id, userId, data) => {
        const { title, description, due_date, priority, category } = data;
        const [res] = await db.query(
            `UPDATE operations_reminders SET title=?, description=?, due_date=?, priority=?, category=? WHERE id=? AND user_id=?`,
            [title, description, sanitizeDate(due_date), priority, category, id, userId]
        );
        return res.affectedRows > 0;
    }
};

const create = async (data) => {
    return OperationsReminderModel.create(data);
};

const getAllByUserId = async (userId) => {
    const [rows] = await db.query(`SELECT * FROM operations_reminders WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
    return rows.map(r => ({
        ...r,
        due_date: formatUtcDate(r.due_date),
        created_at: formatLocalDate(r.created_at),
        completed_at: formatLocalDate(r.completed_at)
    }));
};

const getById = async (id, userId) => {
    const [rows] = await db.query(`SELECT * FROM operations_reminders WHERE id = ? AND user_id = ?`, [id, userId]);
    if (!rows[0]) return null;
    const r = rows[0];
    return {
        ...r,
        due_date: formatUtcDate(r.due_date),
        created_at: formatLocalDate(r.created_at),
        completed_at: formatLocalDate(r.completed_at)
    };
};

const updateStatus = async (id, userId, is_completed) => {
    return OperationsReminderModel.updateStatus(id, userId, is_completed);
};

const update = async (id, userId, data) => {
    return OperationsReminderModel.update(id, userId, data);
};

const deleteReminder = async (id, userId) => {
    const [result] = await db.query(`DELETE FROM operations_reminders WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

module.exports = {
    create,
    getAllByUserId,
    getById,
    updateStatus,
    update,
    delete: deleteReminder
};
