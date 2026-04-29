import Milestone from "../models/Milestone.js";
import Sprint from "../models/Sprint.js";
import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";

// --- Workspaces ---
export const createWorkspace = async (req, res) => {
  try {
    const { name, tagline, role } = req.body;
    
    // Create workspace
    const workspace = await Workspace.create({
      name,
      tagline,
      creatorId: req.user._id,
    });

    // Update the creator's user record
    const user = await User.findById(req.user._id);
    user.workspaceId = workspace._id;
    if (role) {
      user.role = role.toLowerCase();
    } else {
      user.role = 'creator';
    }
    await user.save();

    res.status(201).json({ ...workspace.toObject(), id: workspace._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Team Members ---
export const getTeamMembers = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.json([]);
    }
    const members = await User.find({ workspaceId: req.user.workspaceId }).lean();
    
    const formatted = members.map(m => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      role: m.role || 'member',
      avatarUrl: m.avatar,
      initials: m.name ? m.name.substring(0,2).toUpperCase() : '??',
      tasksCompleted: 0,
      tasksInProgress: 0,
      isOnline: true,
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteTeamMember = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    
    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "You must create a workspace first" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        role: role.toLowerCase() || 'member',
        workspaceId: req.user.workspaceId,
      });
    } else {
      user.workspaceId = req.user.workspaceId;
      user.role = role.toLowerCase() || 'member';
      await user.save();
    }

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar,
      initials: user.name ? user.name.substring(0,2).toUpperCase() : '??',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Milestones ---
export const getMilestones = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const milestones = await Milestone.find(workspaceId ? { workspaceId } : {}).lean();
    
    // Attach sprints
    for (let milestone of milestones) {
      milestone.id = milestone._id.toString();
      const sprints = await Sprint.find({ milestoneId: milestone._id }).lean();
      milestone.sprints = sprints.map(s => ({ ...s, id: s._id.toString() }));
    }
    
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMilestone = async (req, res) => {
  try {
    const { workspaceId, name, description, expectedOutcome, startDate, endDate, configuredSprints } = req.body;
    
    const milestone = await Milestone.create({
      workspaceId,
      name,
      description,
      expectedOutcome,
      startDate,
      endDate,
      createdBy: req.user._id,
    });

    const sprints = [];
    if (configuredSprints && configuredSprints.length > 0) {
      for (const sprintData of configuredSprints) {
        const sprint = await Sprint.create({
          milestoneId: milestone._id,
          workspaceId,
          name: sprintData.name,
          startDate: sprintData.startDate,
          endDate: sprintData.endDate,
          status: sprintData.status || "upcoming",
          assignees: sprintData.assignees || "",
          goalSummary: sprintData.goalSummary,
          description: sprintData.description,
        });
        sprints.push({ ...sprint.toObject(), id: sprint._id.toString() });
      }
    }

    res.status(201).json({ ...milestone.toObject(), id: milestone._id.toString(), sprints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Sprints ---
export const getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find().lean();
    res.json(sprints.map(s => ({ ...s, id: s._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Tasks ---
export const getTasks = async (req, res) => {
  try {
    const { sprintId, assigneeId } = req.query;
    const filter = {};
    if (sprintId) filter.sprintId = sprintId;
    if (assigneeId) {
      if (assigneeId === 'me') filter.assigneeId = req.user._id;
      else filter.assigneeId = assigneeId;
    }
    const tasks = await Task.find(filter).lean();
    res.json(tasks.map(t => ({ ...t, id: t._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const taskData = req.body;
    if (!taskData.assigneeId && req.user) {
      taskData.assigneeId = req.user._id;
    }
    const task = await Task.create(taskData);
    res.status(201).json({ ...task.toObject(), id: task._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ ...task.toObject(), id: task._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
