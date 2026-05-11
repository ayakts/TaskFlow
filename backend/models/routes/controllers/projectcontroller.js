const Project = require('../models/project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            owner: req.user.id
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProjects = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const projects = await Project.find({
            $or: [{ owner: req.user.id }, { members: req.user.id }]
        })
        .limit(limit)
        .skip(skip)
        .populate('owner', 'name email');

        const total = await Project.countDocuments({
            $or: [{ owner: req.user.id }, { members: req.user.id }]
        });

        res.json({
            data: projects,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
        if (!project) return res.status(404).json({ message: "Not found" });
        
        await project.deleteOne();
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addMember = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
        if (!project) return res.status(403).json({ message: "Forbidden" });

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!project.members.includes(user._id)) {
            project.members.push(user._id);
            await project.save();
        }
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};