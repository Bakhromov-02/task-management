import { Request } from 'express';

import { IUser } from '../models';

import { UserRole } from './user.types';

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
  // role?: UserRole;
}

export interface CreateAdminRequest extends RegisterRequest {
  role?: UserRole.admin;
}
