const db = require('../../config/db');

const memberPortalController = {
    // Employee / Member Login
    loginMember: async (req, res) => {
        try {
            const { phone, name } = req.body;
            if (!phone && !name) {
                return res.status(400).json({ success: false, message: 'Please provide phone number or name to login' });
            }

            let query = `SELECT * FROM operations_members WHERE status = 'active' AND (phone = ? OR name = ?) LIMIT 1`;
            const [rows] = await db.query(query, [phone || '', name || '']);

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Member not found or inactive' });
            }

            const member = rows[0];
            return res.json({
                success: true,
                message: 'Login successful',
                member: {
                    id: member.id,
                    user_id: member.user_id,
                    name: member.name,
                    role: member.role || 'Employee',
                    phone: member.phone,
                    email: member.email,
                    cl_balance: member.cl_balance || 0,
                    sl_balance: member.sl_balance || 0,
                    el_balance: member.el_balance || 0,
                    wage_type: member.wage_type || 'monthly',
                    daily_wage: member.daily_wage || 0,
                    monthly_salary: member.monthly_salary || 0,
                    account_role: 'employee'
                }
            });
        } catch (error) {
            console.error('Member login error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Fetch personal details for a specific member
    getMyDetails: async (req, res) => {
        try {
            const memberId = req.query.member_id || req.params.member_id;
            const email = req.query.email;

            if (!memberId && !email) {
                return res.status(400).json({ success: false, message: 'Member ID or Email is required' });
            }

            // A. Lookup user record from `users` table
            let userRecord = null;
            if (memberId || email) {
                const [users] = await db.query(
                    `SELECT * FROM users WHERE id = ? OR (email = ? AND email != '')`,
                    [memberId || 0, email || '']
                );
                if (users.length > 0) {
                    userRecord = users[0];
                }
            }

            const searchEmail = email || userRecord?.email || '';
            const searchName = userRecord?.username || '';
            const searchPhone = userRecord?.mobile_number || '';

            // B. Fetch Member Profile from `operations_members`
            let [members] = await db.query(
                `SELECT * FROM operations_members WHERE id = ? OR (email = ? AND email != '') OR (name = ? AND name != '') OR (phone = ? AND phone != '')`,
                [memberId || 0, searchEmail, searchName, searchPhone]
            );

            let member = members[0];

            if (member) {
                if (!member.email && searchEmail) member.email = searchEmail;
                if (!member.phone && searchPhone) member.phone = searchPhone;

                // Sync phone & email to operations_members if missing
                if (userRecord && (!members[0].email || !members[0].phone)) {
                    await db.query(
                        `UPDATE operations_members SET email = COALESCE(NULLIF(email, ''), ?), phone = COALESCE(NULLIF(phone, ''), ?) WHERE id = ?`,
                        [searchEmail, searchPhone, member.id]
                    );
                }
            } else if (userRecord) {
                member = {
                    id: userRecord.id,
                    user_id: userRecord.id,
                    name: userRecord.username,
                    email: userRecord.email,
                    phone: userRecord.mobile_number,
                    role: userRecord.role === 'admin' ? 'Administrator' : 'User / Member',
                    status: 'active',
                    cl_balance: 0,
                    sl_balance: 0,
                    el_balance: 0,
                    wage_type: 'monthly',
                    daily_wage: 0,
                    monthly_salary: 0
                };
            }

            if (!member) {
                return res.status(404).json({ success: false, message: 'Member profile not found' });
            }

            // C. Fetch Attendance Records for this member
            const [attendance] = await db.query(
                `SELECT * FROM operations_attendance WHERE member_id = ? OR member_id = ? ORDER BY date DESC LIMIT 100`,
                [member.id, memberId || 0]
            );

            // D. Calculate Attendance & Leave Stats
            const total = attendance.length;
            const present = attendance.filter(a => a.status === 'present').length;
            const absent = attendance.filter(a => a.status === 'absent').length;
            const halfDay = attendance.filter(a => a.status === 'half_day').length;
            const clTaken = attendance.filter(a => a.status === 'CL').length;
            const slTaken = attendance.filter(a => a.status === 'SL').length;
            const elTaken = attendance.filter(a => a.status === 'EL').length;
            const permissionCount = attendance.filter(a => a.permission_duration > 0).length;
            const overtimeCount = attendance.filter(a => a.overtime_duration > 0).length;

            // E. Fetch Financial Transactions / Salary Ledger
            const [transactions] = await db.query(
                `SELECT * FROM operations_transactions WHERE member_id = ? OR member_id = ? ORDER BY date DESC LIMIT 50`,
                [member.id, memberId || 0]
            );

            return res.json({
                success: true,
                profile: {
                    id: member.id,
                    name: member.name,
                    role: member.role || 'Employee',
                    phone: member.phone,
                    email: member.email,
                    status: member.status || 'active',
                    cl_balance: member.cl_balance !== undefined && member.cl_balance !== null ? Number(member.cl_balance) : 0,
                    sl_balance: member.sl_balance !== undefined && member.sl_balance !== null ? Number(member.sl_balance) : 0,
                    el_balance: member.el_balance !== undefined && member.el_balance !== null ? Number(member.el_balance) : 0,
                    wage_type: member.wage_type || 'monthly',
                    daily_wage: member.daily_wage || 0,
                    monthly_salary: member.monthly_salary || 0
                },
                stats: {
                    total,
                    present,
                    absent,
                    halfDay,
                    clTaken,
                    slTaken,
                    elTaken,
                    permissionCount,
                    overtimeCount
                },
                attendance,
                transactions
            });
        } catch (error) {
            console.error('Fetch member details error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = memberPortalController;
