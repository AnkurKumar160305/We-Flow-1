import express from "express";
import { 
  getMilestones, createMilestone, 
  getSprints, 
  getTasks, createTask, updateTask,
  createWorkspace, getTeamMembers, inviteTeamMember
} from "../controllers/dataController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/workspaces").post(protect, createWorkspace);
router.route("/team").get(protect, getTeamMembers);
router.route("/team/invite").post(protect, inviteTeamMember);

router.route("/milestones").get(protect, getMilestones).post(protect, createMilestone);
router.route("/sprints").get(protect, getSprints);
router.route("/tasks").get(protect, getTasks).post(protect, createTask);
router.route("/tasks/:id").put(protect, updateTask);

export default router;
