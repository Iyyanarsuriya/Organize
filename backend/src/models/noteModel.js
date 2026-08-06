const db = require('../config/db');

// --- OPERATIONS NOTE MODEL ---
const OperationsNoteModel = {
    create: async (data) => {
        const { user_id, title, content, color, is_pinned } = data;
        const [res] = await db.query(`INSERT INTO operations_notes (user_id, title, content, color, is_pinned) VALUES (?, ?, ?, ?, ?)`, [user_id, title, content || '', color || 'yellow', is_pinned || 0]);
        return { id: res.insertId, ...data };
    },
    update: async (id, data) => {
        const { title, content, color, is_pinned } = data;
        const [res] = await db.query(`UPDATE operations_notes SET title=?, content=?, color=?, is_pinned=? WHERE id=?`, [title, content, color, is_pinned, id]);
        return res.affectedRows > 0;
    }
};

const create = async (data) => {
    return OperationsNoteModel.create(data);
};

const findAllByUserId = async (userId) => {
    const [rows] = await db.query(`SELECT * FROM operations_notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC`, [userId]);
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query(`SELECT * FROM operations_notes WHERE id = ?`, [id]);
    return rows[0];
};

const update = async (id, data) => {
    return OperationsNoteModel.update(id, data);
};

const deleteResult = async (id) => {
    const [result] = await db.query(`DELETE FROM operations_notes WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};

module.exports = {
    create,
    findAllByUserId,
    findById,
    update,
    delete: deleteResult
};
