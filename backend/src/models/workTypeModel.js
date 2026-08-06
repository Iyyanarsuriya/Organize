const db = require('../config/db');

// --- SECTOR MAP ---
const TABLE_MAP = {
    operations: 'operations_work_types',
    manufacturing: 'operations_work_types'
};

// --- OPERATIONS SECTOR ---
const OperationsWorkTypeModel = {
    create: async (userId, name) => {
        const [res] = await db.query(`INSERT INTO operations_work_types (user_id, name) VALUES (?, ?)`, [userId, name]);
        return { id: res.insertId, name, user_id: userId };
    },
    getAll: async (userId) => {
        const [rows] = await db.query(`SELECT * FROM operations_work_types WHERE user_id = ? ORDER BY name ASC`, [userId]);
        return rows;
    }
};

// --- DISPATCHER HELPERS ---
const getSectorModel = (sector) => {
    return OperationsWorkTypeModel;
};

// --- CORE WORK TYPE FUNCTIONS (DISPATCHERS) ---
const create = async (userId, name, sector = 'operations') => {
    return getSectorModel(sector).create(userId, name);
};

const getAllByUserId = async (userId, sector = 'operations') => {
    return getSectorModel(sector).getAll(userId);
};

const deleteWorkType = async (id, userId, sector = 'operations') => {
    const table = TABLE_MAP[sector] || TABLE_MAP.operations;
    const [result] = await db.query(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

module.exports = {
    create,
    getAllByUserId,
    delete: deleteWorkType
};
