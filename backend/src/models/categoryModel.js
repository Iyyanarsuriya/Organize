const db = require('../config/db');

// --- OPERATIONS CATEGORY MODEL ---
const OperationsCategoryModel = {
    getAll: async (userId) => {
        let [rows] = await db.query(`SELECT * FROM operations_reminder_categories WHERE user_id = ? ORDER BY name ASC`, [userId]);
        const hasGeneral = rows.some(r => r.name === 'General');
        if (rows.length === 0 || !hasGeneral) {
            await OperationsCategoryModel.seed(userId);
            [rows] = await db.query(`SELECT * FROM operations_reminder_categories WHERE user_id = ? ORDER BY name ASC`, [userId]);
        }
        return rows;
    },
    create: async (data) => {
        const { user_id, name, color } = data;
        const [res] = await db.query(`INSERT INTO operations_reminder_categories (user_id, name, color) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=name`, [user_id, name, color || '#2d5bff']);
        return { id: res.insertId, ...data };
    },
    seed: async (userId) => {
        const defaults = [
            { name: 'General', color: '#64748b' }
        ];
        for (const cat of defaults) await OperationsCategoryModel.create({ user_id: userId, name: cat.name, color: cat.color });
    }
};

const getAllByUserId = async (userId) => {
    return OperationsCategoryModel.getAll(userId);
};

const create = async (categoryData) => {
    return OperationsCategoryModel.create(categoryData);
};

const deleteResult = async (id, userId) => {
    const [result] = await db.query(`DELETE FROM operations_reminder_categories WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

const seedDefaultCategories = async (userId) => {
    return OperationsCategoryModel.seed(userId);
};

module.exports = {
    getAllByUserId,
    create,
    delete: deleteResult,
    seedDefaultCategories
};
