import express from "express";
import { 
  getMilestones, createMilestone, deleteMilestone,
  getSprints, 
  getTasks, createTask, updateTask,
  createWorkspace, getTeamMembers, inviteTeamMember, acceptInvitation,
  updateTeamMember, deleteTeamMember,
  getNotifications, markAllNotificationsRead
} from "../controllers/dataController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/workspaces").post(protect, createWorkspace);
router.route("/team").get(protect, getTeamMembers);
router.route("/team/invite").post(protect, inviteTeamMember);
router.route("/team/:id").put(protect, updateTeamMember).delete(protect, deleteTeamMember);

router.route("/accept-invite/:token").get(acceptInvitation);

router.route("/milestones").get(protect, getMilestones).post(protect, createMilestone);
router.route("/milestones/:id").delete(protect, deleteMilestone);
router.route("/sprints").get(protect, getSprints);
router.route("/tasks").get(protect, getTasks).post(protect, createTask);
router.route("/tasks/:id").put(protect, updateTask);

router.route("/notifications").get(protect, getNotifications);
router.route("/notifications/read-all").put(protect, markAllNotificationsRead);

export default router;
