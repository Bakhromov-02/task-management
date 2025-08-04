import { PaginationQuery } from "./pagination";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: keyof typeof TaskPriority;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: keyof typeof TaskStatus;
}

export interface TaskQuery extends PaginationQuery {
  status?: keyof typeof TaskStatus;
  priority?: keyof typeof TaskPriority;
  search?: string;
  userId?: string;
}

export enum TaskStatus {
  "pending" = "pending",
  "completed" = "completed",
}

export enum TaskPriority {
  "low" = "low",
  "medium" = "medium",
  "high" = "high",
}