const db = require('../config/db');

// --- OPERATIONS MEMBER MODEL ---
const OperationsMemberModel = {
    create: async (data) => {
        const { user_id, name, role, phone, email, status, project_id, shift_id, wage_type, daily_wage, member_type, cl_balance, sl_balance, el_balance, created_by } = data;
        const [res] = await db.query(
            `INSERT INTO operations_members (user_id, name, role, phone, email, status, project_id, shift_id, wage_type, daily_wage, member_type, cl_balance, sl_balance, el_balance, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, name, role, phone, email, status || 'active', project_id || null, shift_id || null, wage_type || 'daily', daily_wage || 0, member_type || 'worker', cl_balance || 0, sl_balance || 0, el_balance || 0, created_by]
        );
        return { id: res.insertId, ...data };
    },
    update: async (id, userId, data) => {
        const { name, role, phone, email, status, project_id, shift_id, wage_type, daily_wage, member_type, cl_balance, sl_balance, el_balance } = data;
        const [res] = await db.query(
            `UPDATE operations_members SET name=?, role=?, phone=?, email=?, status=?, project_id=?, shift_id=?, wage_type=?, daily_wage=?, member_type=?, cl_balance=?, sl_balance=?, el_balance=? WHERE id=? AND user_id=?`,
            [name, role, phone, email, status, project_id || null, shift_id || null, wage_type, daily_wage, member_type, cl_balance, sl_balance, el_balance, id, userId]
        );
        return res.affectedRows > 0;
    },
    getAll: async (userId, memberType) => {
        let query = `
            SELECT m.*, p.name as project_name, s.name as shift_name 
            FROM operations_members m 
            LEFT JOIN operations_projects p ON m.project_id = p.id 
            LEFT JOIN operations_shifts s ON m.shift_id = s.id
            WHERE m.user_id = ?`;
        const params = [userId];
        if (memberType && memberType !== 'all') { query += ' AND m.member_type = ?'; params.push(memberType); }
        query += ' ORDER BY m.created_at DESC';
        const [rows] = await db.query(query, params);
        return rows;
    }
};

const create = async (data) => {
    return OperationsMemberModel.create(data);
};

const getAllByUserId = async (userId, memberType = null) => {
    return OperationsMemberModel.getAll(userId, memberType);
};

const getById = async (id, userId) => {
    const [rows] = await db.query(`SELECT * FROM operations_members WHERE id = ? AND user_id = ?`, [id, userId]);
    return rows[0];
};

const update = async (id, userId, data) => {
    return OperationsMemberModel.update(id, userId, data);
};

const deleteMember = async (id, userId) => {
    const [result] = await db.query(`DELETE FROM operations_members WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

const getActiveMembers = async (userId, memberType = null) => {
    let query = `
        SELECT m.*, s.name as shift_name, s.start_time, s.end_time 
        FROM operations_members m
        LEFT JOIN operations_shifts s ON m.shift_id = s.id
        WHERE m.user_id = ? AND m.status = "active"`;
    let params = [userId];

    if (memberType && memberType !== 'all') { query += ' AND m.member_type = ?'; params.push(memberType); }
    query += ' ORDER BY m.name ASC';
    const [rows] = await db.query(query, params);
    return rows;
};

const getGuests = async (userId) => {
    const query = `
        SELECT DISTINCT guest_name, 'guest' as member_type, 'active' as status, 0 as id 
        FROM operations_transactions 
        WHERE user_id = ? AND member_id IS NULL AND guest_name IS NOT NULL AND guest_name != ''
        UNION SELECT DISTINCT guest_name, 'guest' as member_type, 'active' as status, 0 as id FROM operations_work_logs WHERE user_id = ? AND member_id IS NULL AND guest_name IS NOT NULL AND guest_name != ''
        ORDER BY guest_name ASC`;
    const [rows] = await db.query(query, [userId, userId]);
    return rows.map((row, index) => ({ ...row, id: `guest-${index}`, name: row.guest_name, role: 'Guest / Temp', phone: '-', email: '-', wage_type: 'daily', daily_wage: 0 }));
};

module.exports = {
    create,
    getAllByUserId,
    getById,
    update,
    delete: deleteMember,
    getActiveMembers,
    getGuests
};
