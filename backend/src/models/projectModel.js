const db = require('../config/db');

// --- OPERATIONS PROJECT MODEL ---
const OperationsProjectModel = {
    create: async (userId, name, description) => {
        const [res] = await db.query(
            `INSERT INTO operations_projects (user_id, name, description) VALUES (?, ?, ?)`,
            [userId, name, description || null]
        );
        return { id: res.insertId, user_id: userId, name, description };
    },
    getAll: async (userId) => {
        const [rows] = await db.query(`SELECT * FROM operations_projects WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
        return rows;
    }
};

const create = async (userId, name, description) => {
    return OperationsProjectModel.create(userId, name, description);
};

const getAllByUserId = async (userId) => {
    return OperationsProjectModel.getAll(userId);
};

const deleteProject = async (id, userId) => {
    const [result] = await db.query(`DELETE FROM operations_projects WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

module.exports = {
    create,
    getAllByUserId,
    delete: deleteProject
};
