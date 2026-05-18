import Milestone from "../models/Milestone.js";
import Sprint from "../models/Sprint.js";
import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import TeamMember from "../models/TeamMember.js";
import Invitation from "../models/Invitation.js";
import Notification from "../models/Notification.js";
import crypto from "crypto";
import { sendInviteEmail } from "../utils/mailer.js";



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
    user.role = 'creator'; // Enforce creator role as per requirement
    await user.save();

    // Also add as a TeamMember
    await TeamMember.create({
      workspaceId: workspace._id,
      user_email: user.email,
      name: user.name,
      role: 'creator',
      status: 'accepted',
    });


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
    const members = await TeamMember.find({ workspaceId: req.user.workspaceId }).lean();
    
    const formatted = members.map(m => ({
      id: m._id.toString(),
      name: m.name,
      email: m.user_email,
      role: m.role,
      status: m.status, // pending / accepted
      initials: m.name ? m.name.substring(0,2).toUpperCase() : '??',
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

    // Check if already invited
    const existing = await TeamMember.findOne({ workspaceId: req.user.workspaceId, user_email: email });
    if (existing) {
      return res.status(400).json({ message: "User already in team or invited" });
    }

    // Create TeamMember with pending status
    const teamMember = await TeamMember.create({
      workspaceId: req.user.workspaceId,
      user_email: email,
      name: name || email.split('@')[0],
      role: role || 'co-creator',
      status: 'pending',
    });

    // Create Invitation token
    const token = crypto.randomBytes(32).toString('hex');
    await Invitation.create({
      email,
      workspaceId: req.user.workspaceId,
      token,
      status: 'pending',
    });

    // Send actual email
    try {
      const workspace = await Workspace.findById(req.user.workspaceId);
      await sendInviteEmail(email, token, workspace.name);
    } catch (mailError) {
      console.error("Mail send failed but team member was created", mailError);
    }

    console.log(`Invite link logged for testing: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${token}`);


    res.status(201).json({
      id: teamMember._id.toString(),
      name: teamMember.name,
      email: teamMember.user_email,
      role: teamMember.role,
      status: teamMember.status,
      initials: teamMember.name ? teamMember.name.substring(0,2).toUpperCase() : '??',
      inviteToken: token, // Returning token so frontend can show it or simulate email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await Invitation.findOne({ token, status: 'pending' });
    
    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

    // Update TeamMember status
    await TeamMember.findOneAndUpdate(
      { workspaceId: invitation.workspaceId, user_email: invitation.email },
      { status: 'accepted' }
    );

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // If user exists, update their workspaceId
    const user = await User.findOne({ email: invitation.email });
    if (user) {
      user.workspaceId = invitation.workspaceId;
      await user.save();
    }

    // Get workspace name for the response
    const workspace = await Workspace.findById(invitation.workspaceId);
    const workspaceName = workspace ? workspace.name : 'your team';

    res.json({ message: "Invitation accepted successfully", workspaceId: invitation.workspaceId, workspaceName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    const member = await TeamMember.findByIdAndUpdate(id, { name, role }, { new: true });
    res.json({
      id: member._id.toString(),
      name: member.name,
      email: member.user_email,
      role: member.role,
      status: member.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    await TeamMember.findByIdAndDelete(id);
    res.json({ message: "Member removed successfully" });
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
      assigned_members: req.body.assigned_members || [], // New field
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

    // Create a live notification for the new milestone
    await Notification.create({
      title: "New Milestone Created",
      message: `The milestone "${name}" has been successfully defined.`,
      workspaceId,
      icon: "Flag",
      color: "text-orange-500",
    });

    res.status(201).json({ ...milestone.toObject(), id: milestone._id.toString(), sprints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Delete Milestone ---
export const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete all sprints belonging to this milestone
    await Sprint.deleteMany({ milestoneId: id });
    
    // Delete the milestone itself
    const milestone = await Milestone.findByIdAndDelete(id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }
    
    res.json({ message: "Milestone deleted successfully" });
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

// --- Notifications ---
export const getNotifications = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }
    const notifications = await Notification.find({ workspaceId }).sort({ timestamp: -1 }).lean();
    res.json(notifications.map(n => ({ ...n, id: n._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }
    await Notification.updateMany({ workspaceId, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
