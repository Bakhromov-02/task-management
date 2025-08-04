import { Request, Response } from 'express';

import { User } from "../models";
import { jwtService, ResponseHandler } from '../utils';
import { LoginRequest, RegisterRequest, UserQuery, UserRole } from "../types";

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      ResponseHandler.badRequest(res, "User already exists with this email");
      return;
    }

    const user = new User({ email, password, role: UserRole.user });
    await user.save();

    const token = jwtService.generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    ResponseHandler.created(res, "User registered successfully", {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    ResponseHandler.error(res, 'Registration failed');
  }
};

export const createAdmin = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "admin") {
      ResponseHandler.forbidden(res, "Only admins can create admin users");
      return;
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      ResponseHandler.badRequest(res, "User already exists with this email");
      return;
    }

    const newUser = new User({ email, password, role: UserRole.admin });
    await newUser.save();

    ResponseHandler.created(
      res,
      `${UserRole.admin} user created successfully`,
      {
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
        createdBy: {
          id: req.user._id,
          email: req.user.email,
        },
      }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    ResponseHandler.error(res, "Failed to create admin user");
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      ResponseHandler.unauthorized(res, "Invalid credentials");
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      ResponseHandler.unauthorized(res, "Invalid credentials");
      return;
    }

    const token = jwtService.generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    ResponseHandler.success(res, "Login successful", {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    ResponseHandler.error(res, "Login failed");
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      ResponseHandler.unauthorized(res, "User not found");
      return;
    }

    ResponseHandler.success(res, "success", {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    ResponseHandler.error(res, 'Failed to retrieve profile');
  }
};

export const getAllUsers = async (
  req: Request<{}, {}, {}, UserQuery>,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const { email, role } = req.query;

    const query: any = {};

    if (email) {
      query.email = { $regex: email, $options: "i" };
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    ResponseHandler.paginated(
      res,
      "Users retrieved successfully",
      users.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
      page,
      limit,
      total
    );
  } catch (error) {
    console.error("Get all users error:", error);
    ResponseHandler.error(res, "Failed to retrieve users");
  }
}
