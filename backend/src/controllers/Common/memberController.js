const Member = require('../../models/memberModel');

// --- OPERATIONS MEMBER CONTROLLER ---
const OperationsMemberController = {
    create: async (req, res) => {
        const member = await Member.create({ ...req.body, user_id: req.user.data_owner_id, sector: 'operations' });
        res.status(201).json({ success: true, data: member });
    }
};

const createMember = async (req, res) => {
    try {
        return await OperationsMemberController.create(req, res);
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMembers = async (req, res) => {
    try {
        const { memberType } = req.query;
        const members = await Member.getAllByUserId(req.user.data_owner_id, memberType, 'operations');
        res.status(200).json({ success: true, data: members });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getActiveMembers = async (req, res) => {
    try {
        const { memberType } = req.query;
        const members = await Member.getActiveMembers(req.user.data_owner_id, memberType, 'operations');
        res.status(200).json({ success: true, data: members });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getGuests = async (req, res) => {
    try {
        const guests = await Member.getGuests(req.user.data_owner_id, 'operations');
        res.status(200).json({ success: true, data: guests });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateMember = async (req, res) => {
    try {
        const updated = await Member.update(req.params.id, req.user.data_owner_id, { ...req.body, sector: 'operations' });
        res.status(updated ? 200 : 404).json({ success: updated, message: updated ? "Updated" : "Not found" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteMember = async (req, res) => {
    try {
        const deleted = await Member.delete(req.params.id, req.user.data_owner_id, 'operations');
        res.status(deleted ? 200 : 404).json({ success: deleted, message: deleted ? "Deleted" : "Not found" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
    createMember,
    getMembers,
    getActiveMembers,
    getGuests,
    updateMember,
    deleteMember
};
