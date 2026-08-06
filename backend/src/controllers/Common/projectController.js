const Project = require('../../models/projectModel');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.getAllByUserId(req.user.data_owner_id, 'operations');
        res.json({ success: true, data: projects });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name required" });
        const result = await Project.create(req.user.data_owner_id, name, description, 'operations');
        res.status(201).json({ success: true, data: result });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteProject = async (req, res) => {
    try {
        const success = await Project.delete(req.params.id, req.user.data_owner_id, 'operations');
        res.json({ success, message: success ? "Deleted" : "Not found" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
