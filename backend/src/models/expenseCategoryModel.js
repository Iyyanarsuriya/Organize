const db = require('../config/db');

const getAllByUserId = async (userId) => {
    const query = `SELECT * FROM operations_expense_categories WHERE user_id = ? ORDER BY type, name`;
    let [rows] = await db.query(query, [userId]);

    const hasGeneral = rows.some(r => r.name === 'General');
    if (rows.length === 0 || !hasGeneral) {
        await seed(userId);
        [rows] = await db.query(query, [userId]);
    }

    return rows;
};

const seed = async (userId) => {
    const defaults = [
        { name: 'General', color: '#64748b', type: 'expense' },
        { name: 'Salary', color: '#2d5bff', type: 'income' },
        { name: 'Investment', color: '#10b981', type: 'income' }
    ];

    const query = `INSERT INTO operations_expense_categories (user_id, name, color, type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name`;

    for (const cat of defaults) {
        await db.query(query, [userId, cat.name, cat.color, cat.type]);
    }
};

const create = async (data) => {
    const { user_id, name, type } = data;
    const query = `INSERT INTO operations_expense_categories (user_id, name, type, color) VALUES (?, ?, ?, ?)`;
    const params = [user_id, name, type || 'expense', data.color || '#2d5bff'];

    const [result] = await db.query(query, params);
    return { id: result.insertId, ...data };
};

const deleteCategory = async (id, userId) => {
    const [result] = await db.query(
        `DELETE FROM operations_expense_categories WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getAllByUserId,
    create,
    delete: deleteCategory,
    seed
};
