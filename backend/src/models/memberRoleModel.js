const db = require('../config/db');

// --- SECTOR MAP ---
const TABLE_MAP = {
    operations: 'operations_member_roles',
    manufacturing: 'operations_member_roles'
};

// --- OPERATIONS SECTOR ---
const OperationsMemberRoleModel = {
    create: async (userId, name) => {
        const [res] = await db.query(`INSERT INTO operations_member_roles (user_id, name) VALUES (?, ?)`, [userId, name]);
        return { id: res.insertId, name, user_id: userId };
    },
    getAll: async (userId) => {
        const [rows] = await db.query(`SELECT * FROM operations_member_roles WHERE user_id = ? ORDER BY name ASC`, [userId]);
        return rows;
    }
};

// --- DISPATCHER HELPERS ---
const getSectorModel = (sector) => {
    return OperationsMemberRoleModel;
};

// --- CORE MEMBER ROLE FUNCTIONS (DISPATCHERS) ---
const create = async (userId, name, sector = 'operations') => {
    return getSectorModel(sector).create(userId, name);
};

const getAllByUserId = async (userId, sector = 'operations') => {
    return getSectorModel(sector).getAll(userId);
};

const deleteResult = async (id, userId, sector = 'operations') => {
    const table = TABLE_MAP[sector] || TABLE_MAP.operations;
    const [result] = await db.query(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

module.exports = {
    create,
    getAllByUserId,
    delete: deleteResult
};
