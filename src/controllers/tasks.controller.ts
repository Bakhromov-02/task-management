import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Task } from '../models';
import { ResponseHandler } from '../utils';
import { CreateTaskRequest, TaskQuery, UserRole } from '../types';


export const getTasks = async (
  req: Request<{}, {}, {}, TaskQuery>,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const { status, priority, search, userId } = req.query;

    const query: any = {};

    if (userId && req.user?.role === UserRole.admin) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        ResponseHandler.badRequest(res, "Invalid user ID format");
        return;
      }
      query.userId = userId;
    } else if (req.user && req.user.role !== UserRole.admin) {
      query.userId = req.user._id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    ResponseHandler.paginated(
      res,
      "Tasks retrieved successfully",
      tasks,
      page,
      limit,
      total
    );
  } catch (error) {
    console.error("Get tasks error:", error);
    ResponseHandler.error(res, "Failed to retrieve tasks");
  }
};

export const getTaskById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ResponseHandler.badRequest(res, 'Invalid task ID format');
      return;
    }
    
    const query: any = { _id: id };
    
    if (!req.user || req.user.role !== "admin") {
      query.userId = req.user?._id;
    }
    
    const task = await Task.findOne(query).populate("userId", "email role");
    
    if (!task) {
      ResponseHandler.notFound(res, 'Task not found');
      return;
    }
    
    ResponseHandler.success(res, 'Task retrieved successfully', { task });
  } catch (error) {
    console.error('Get task error:', error);
    ResponseHandler.error(res, 'Failed to retrieve task');
  }
};

export const createTask = async (req: Request<{}, {}, CreateTaskRequest>, res: Response): Promise<void> => {
  try {
    const { title, description, priority = "medium" } = req.body;
    
    if (!req.user) {
      ResponseHandler.unauthorized(res, 'Authentication required');
      return;
    }
    
    const task = new Task({
      title,
      description,
      priority,
      userId: req.user._id
    });
    
    await task.save();
    await task.populate('userId', 'email role');
    
    ResponseHandler.created(res, 'Task created successfully', { task });
  } catch (error) {
    console.error('Create task error:', error);
    ResponseHandler.error(res, 'Failed to create task');
  }
};

export const updateTask = async (req: Request<{ id: string }, {}, CreateTaskRequest>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ResponseHandler.badRequest(res, 'Invalid task ID format');
      return;
    }
    
    if (!req.user) {
      ResponseHandler.unauthorized(res, 'Authentication required');
      return;
    }
    
    const query: any = { _id: id };
    
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    
    const task = await Task.findOneAndUpdate(
      query,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'email role');
    
    if (!task) {
      ResponseHandler.notFound(res, 'Task not found or access denied');
      return;
    }
    
    ResponseHandler.success(res, 'Task updated successfully', { task });
  } catch (error) {
    console.error('Update task error:', error);
    ResponseHandler.error(res, 'Failed to update task');
  }
};

export const deleteTask = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ResponseHandler.badRequest(res, 'Invalid task ID format');
      return;
    }
    
    if (!req.user) {
      ResponseHandler.unauthorized(res, 'Authentication required');
      return;
    }
    
    const query: any = { _id: id };
    
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    
    const task = await Task.findOneAndDelete(query);
    
    if (!task) {
      ResponseHandler.notFound(res, 'Task not found or access denied');
      return;
    }
    
    ResponseHandler.success(res, 'Task deleted successfully');
  } catch (error) {
    console.error('Delete task error:', error);
    ResponseHandler.error(res, 'Failed to delete task');
  }
};