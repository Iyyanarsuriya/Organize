const User = require('../../models/userModel');
const Member = require('../../models/memberModel');
const bcrypt = require('bcryptjs');

exports.getSubUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Only the Workspace Owner can manage team members.' });
        }

        const subUsers = await User.findByOwnerId(req.user.data_owner_id, 'operations');
        res.json(subUsers);
    } catch (error) {
        console.error('getSubUsers error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createSubUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Only the Workspace Owner can add team members.' });
        }

        let { username, email, password, role } = req.body;
        username = username?.trim();
        email = email?.trim().toLowerCase();
        password = password?.trim();

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const localId = await User.getNextLocalId(req.user.data_owner_id);

        const userId = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user',
            owner_id: req.user.data_owner_id,
            local_id: localId,
            sector: 'operations',
            created_by: req.user.username
        });

        try {
            await Member.create({
                user_id: req.user.data_owner_id,
                name: username,
                role: role || 'worker',
                email: email,
                status: 'active',
                sector: 'operations',
                member_type: 'worker',
                created_by: req.user.username
            });
        } catch (memberError) {
            console.error('Failed to auto-create member for user:', memberError);
        }

        res.status(201).json({ message: 'Team member added successfully', userId });
    } catch (error) {
        console.error('createSubUser error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteSubUser = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Only the Workspace Owner can remove team members.' });
        }

        const { id } = req.params;
        const success = await User.delete(id, req.user.data_owner_id);

        if (!success) {
            return res.status(404).json({ error: 'User not found or you do not have permission to delete them.' });
        }

        res.json({ message: 'Users removed successfully' });
    } catch (error) {
        console.error('deleteSubUser error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
