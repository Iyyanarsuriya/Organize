const Transaction = require('../../models/transactionModel');

// --- OPERATIONS TRANSACTION HANDLER ---
const OperationsTransactionHandler = {
    create: async (req) => {
        const { title, amount, type, category, category_id, date, project_id, member_id, description, guest_name, payment_status, quantity, unit_price } = req.body;
        return await Transaction.create({
            user_id: req.user.data_owner_id, title, amount, type, category, date, sector: 'operations', description, guest_name, payment_status, quantity, unit_price,
            category_id: (category_id === 'None' || category_id === '') ? null : category_id,
            project_id: (project_id === 'None' || project_id === '') ? null : project_id,
            member_id: (member_id === 'None' || member_id === '') ? null : member_id
        });
    }
};

// --- EXPORTED CONTROLLER FUNCTIONS ---

exports.createTransaction = async (req, res) => {
    try {
        const { title, amount, type, date } = req.body;
        if (!title || !amount || !type || !date) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const transaction = await OperationsTransactionHandler.create(req);
        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        console.error("Create transaction error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const filters = { ...req.query, sector: 'operations' };
        const transactions = await Transaction.getAllByUserId(req.user.data_owner_id, filters);
        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const updated = await Transaction.update(req.params.id, req.user.data_owner_id, { ...req.body, sector: 'operations' });
        res.json({ success: updated, message: updated ? "Updated successfully" : "Transaction not found" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const success = await Transaction.delete(req.params.id, req.user.data_owner_id, 'operations');
        res.json({ success, message: success ? "Deleted successfully" : "Transaction not found" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransactionStats = async (req, res) => {
    try {
        const { period, projectId, startDate, endDate, memberId } = req.query;
        const filters = { ...req.query, sector: 'operations' };
        const stats = await Transaction.getStats(req.user.data_owner_id, period, projectId, startDate, endDate, memberId, filters);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategoryStats = async (req, res) => {
    try {
        const { period, projectId, startDate, endDate, memberId } = req.query;
        const filters = { ...req.query, sector: 'operations' };
        const stats = await Transaction.getCategoryStats(req.user.data_owner_id, period, projectId, startDate, endDate, memberId, filters);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
