const db = require('../config/db');

// Helper to sanitize date
const sanitizeDate = (date) => {
    if (!date) return date;
    if (typeof date === 'string') {
        if (date.length === 10) return date + ' 12:00:00';
        if (date.includes('T')) return date.replace('T', ' ').slice(0, 19);
    }
    return date;
};

// Helper function to build SQL filters
const buildFilters = (baseQuery, params, filters) => {
    let query = baseQuery;
    const { period, projectId, startDate, endDate, memberId, type, category } = filters;

    if (type) {
        query += ' AND t.type = ?';
        params.push(type);
    }

    if (category) {
        query += ' AND t.category = ?';
        params.push(category);
    }

    if (projectId && projectId !== 'all') {
        query += ' AND t.project_id = ?';
        params.push(projectId);
    }

    if (memberId && memberId !== 'all') {
        query += ' AND t.member_id = ?';
        params.push(memberId);
    }

    if (startDate && endDate) {
        query += ' AND t.date BETWEEN ? AND ?';
        params.push(startDate + ' 00:00:00', endDate + ' 23:59:59');
    } else if (period) {
        const now = new Date();
        let start = new Date();

        if (period === 'day' || period === 'today') {
            start.setHours(0, 0, 0, 0);
            query += ' AND t.date >= ?';
            params.push(start.toISOString().slice(0, 19).replace('T', ' '));
        } else if (period === 'week') {
            start.setDate(now.getDate() - 7);
            query += ' AND t.date >= ?';
            params.push(start.toISOString().slice(0, 19).replace('T', ' '));
        } else if (period === 'month') {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            query += ' AND t.date >= ?';
            params.push(start.toISOString().slice(0, 19).replace('T', ' '));
        } else if (period === 'year') {
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            query += ' AND t.date >= ?';
            params.push(start.toISOString().slice(0, 19).replace('T', ' '));
        }
    }

    return { query, params };
};

const executeFilteredQuery = async (baseQuery, params, filters) => {
    const built = buildFilters(baseQuery, params, filters);
    let finalQuery = built.query + ' ORDER BY t.date DESC, t.created_at DESC';
    const [rows] = await db.query(finalQuery, built.params);
    return rows;
};

// --- OPERATIONS SECTOR MODEL ---
const OperationsTransactionModel = {
    create: async (data) => {
        const { user_id, title, amount, type, category, date, project_id, member_id, guest_name, payment_status, quantity, unit_price } = data;
        const [res] = await db.query(
            `INSERT INTO operations_transactions (user_id, title, amount, type, category, date, project_id, member_id, guest_name, payment_status, quantity, unit_price) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, title, amount, type, category || 'Other', sanitizeDate(date), project_id, member_id, guest_name, payment_status || 'completed', quantity || 1, unit_price || 0]
        );
        return { id: res.insertId, ...data };
    },
    update: async (id, userId, data) => {
        const { title, amount, type, category, date, project_id, member_id, guest_name, payment_status, quantity, unit_price } = data;
        const [res] = await db.query(
            `UPDATE operations_transactions SET title=?, amount=?, type=?, category=?, date=?, project_id=?, member_id=?, guest_name=?, payment_status=?, quantity=?, unit_price=? WHERE id=? AND user_id=?`,
            [title, amount, type, category, sanitizeDate(date), project_id, member_id, guest_name, payment_status || 'completed', quantity || 1, unit_price || 0, id, userId]
        );
        return res.affectedRows > 0;
    },
    getAll: async (userId, filters) => {
        let query = `
            SELECT t.*, CASE WHEN t.member_id IS NOT NULL THEN w.name ELSE t.guest_name END as member_name,
            w.member_type, p.name as project_name
            FROM operations_transactions t 
            LEFT JOIN operations_members w ON t.member_id = w.id
            LEFT JOIN operations_projects p ON t.project_id = p.id
            WHERE t.user_id = ?`;
        const params = [userId];
        return await executeFilteredQuery(query, params, filters);
    }
};

const create = async (data) => {
    return OperationsTransactionModel.create(data);
};

const getAllByUserId = async (userId, filters = {}) => {
    return OperationsTransactionModel.getAll(userId, filters);
};

const update = async (id, userId, data) => {
    return OperationsTransactionModel.update(id, userId, data);
};

const deleteTransaction = async (id, userId) => {
    const [result] = await db.query(`DELETE FROM operations_transactions WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

const getStats = async (userId, period, projectId, startDate, endDate, memberId, filters = {}) => {
    let baseQuery = `SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income, SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense FROM operations_transactions t WHERE t.user_id = ?`;
    const params = [userId];

    const built = buildFilters(baseQuery, params, { ...filters, period, projectId, startDate, endDate, memberId });
    const [rows] = await db.query(built.query, built.params);
    return rows[0];
};

const getCategoryStats = async (userId, period, projectId, startDate, endDate, memberId, filters = {}) => {
    let baseQuery = `SELECT category, type, SUM(amount) as total FROM operations_transactions t WHERE t.user_id = ?`;
    let params = [userId];

    const built = buildFilters(baseQuery, params, { ...filters, period, projectId, startDate, endDate, memberId });
    let finalQuery = built.query + " GROUP BY category, type";

    const [rows] = await db.query(finalQuery, built.params);
    return rows;
};

module.exports = {
    create,
    getAllByUserId,
    update,
    delete: deleteTransaction,
    getStats,
    getCategoryStats
};

