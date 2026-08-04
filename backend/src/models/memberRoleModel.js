const db = require('../config/db');

// --- SECTOR MAP ---
const TABLE_MAP = {
    manufacturing: 'manufacturing_member_roles'
};

// --- MANUFACTURING SECTOR ---
const ManufacturingMemberRoleModel = {
    create: async (userId, name) => {
        const [res] = await db.query(`INSERT INTO manufacturing_member_roles (user_id, name) VALUES (?, ?)`, [userId, name]);
        return { id: res.insertId, name, user_id: userId };
    },
    getAll: async (userId) => {
        const [rows] = await db.query(`SELECT * FROM manufacturing_member_roles WHERE user_id = ? ORDER BY name ASC`, [userId]);
        return rows;
    }
};

// --- DISPATCHER HELPERS ---
const getSectorModel = (sector) => {
    return ManufacturingMemberRoleModel;
};

// --- CORE MEMBER ROLE FUNCTIONS (DISPATCHERS) ---
const create = async (userId, name, sector = 'manufacturing') => {
    return getSectorModel(sector).create(userId, name);
};

const getAllByUserId = async (userId, sector = 'manufacturing') => {
    return getSectorModel(sector).getAll(userId);
};

const deleteResult = async (id, userId, sector = 'manufacturing') => {
    const table = TABLE_MAP[sector] || TABLE_MAP.manufacturing;
    const [result] = await db.query(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

module.exports = {
    create,
    getAllByUserId,
    delete: deleteResult
};
