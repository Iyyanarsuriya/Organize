const db = require('../config/db');

const create = async (userId, name) => {
    const [res] = await db.query(
        `INSERT INTO operations_member_roles (user_id, name) VALUES (?, ?)`,
        [userId, name]
    );
    return { id: res.insertId, name, user_id: userId };
};

const getAllByUserId = async (userId) => {
    const [rows] = await db.query(
        `SELECT * FROM operations_member_roles WHERE user_id = ? ORDER BY name ASC`,
        [userId]
    );
    return rows;
};

const deleteResult = async (id, userId) => {
    const [result] = await db.query(
        `DELETE FROM operations_member_roles WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
};

module.exports = { create, getAllByUserId, delete: deleteResult };
