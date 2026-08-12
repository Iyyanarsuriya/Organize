const MemberRole = require('../../models/memberRoleModel');

exports.getRoles = async (req, res) => {
    try {
        const roles = await MemberRole.getAllByUserId(req.user.data_owner_id);
        res.json({ success: true, data: roles });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.addRole = async (req, res) => {
    try {
        if (!req.body.name) return res.status(400).json({ success: false, message: "Name required" });
        const result = await MemberRole.create(req.user.data_owner_id, req.body.name);
        res.status(201).json({ success: true, data: result });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteRole = async (req, res) => {
    try {
        const deleted = await MemberRole.delete(req.params.id, req.user.data_owner_id);
        res.json({ success: deleted, message: deleted ? "Deleted" : "Not found" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
