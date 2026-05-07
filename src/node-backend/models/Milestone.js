import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    expectedOutcome: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned_members: [
      {
        type: String, // Storing emails as per requirement "assigned_members (only accepted)" and "user_email" in TeamMember
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Milestone = mongoose.model("Milestone", milestoneSchema);

export default Milestone;
