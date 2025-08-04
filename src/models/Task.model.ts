import mongoose, { Document, Schema } from 'mongoose';
import { TaskPriority, TaskStatus } from '../types';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: TaskStatus,
      default: TaskStatus.pending,
    },
    priority: {
      type: String,
      enum: TaskPriority,
      default: TaskPriority.medium,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  console.log('Pre-update hook triggered');
  const update = this.getUpdate() as any;
  
  if (update && update.status) {
    if (update.status === TaskStatus.completed && !update.completedAt) {
      update.completedAt = new Date();
    } else if (update.status === TaskStatus.pending) {
      update.completedAt = null;
    }
  }
  next();
});

export const Task = mongoose.model<ITask>("Task", taskSchema);