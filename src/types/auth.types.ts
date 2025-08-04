import { Request } from 'express';

import { IUser } from '../models';

import { UserRole } from './user.types';
import { PaginationQuery } from './pagination';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CreateAdminRequest extends RegisterRequest {
  role?: UserRole.admin;
}
export interface UserQuery extends PaginationQuery {
  email?: string;
  role?: UserRole;
}
