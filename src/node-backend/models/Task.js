import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["todo", "doing", "done", "blocked"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    departmentId: {
      type: String,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
    },
    bucketId: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockerNote: {
      type: String,
    },
    doneSubLabel: {
      type: String,
      enum: ["needs_review", "shipped", null],
      default: null,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
