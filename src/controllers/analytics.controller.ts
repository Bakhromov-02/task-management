import { Response } from "express";

import { Task, User } from "../models";
import { ResponseHandler } from "../utils";
import { AuthRequest, TaskStatus } from "../types";

export const getTaskAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return ResponseHandler.forbidden(res, "Admin access required");
    }

    const [analytics, totalUsers] = await Promise.all([
      Task.aggregate([
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalTasks: { $sum: 1 },
                  completedTasks: {
                    $sum: {
                      $cond: [{ $eq: ["$status", TaskStatus.completed] }, 1, 0],
                    },
                  },
                  pendingTasks: {
                    $sum: {
                      $cond: [{ $eq: ["$status", TaskStatus.pending] }, 1, 0],
                    },
                  },
                },
              },
              {
                $addFields: {
                  completionRate: {
                    $cond: [
                      { $gt: ["$totalTasks", 0] },
                      {
                        $round: [
                          {
                            $multiply: [
                              { $divide: ["$completedTasks", "$totalTasks"] },
                              100,
                            ],
                          },
                          2,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            ],

            tasksByPriority: [
              {
                $group: {
                  _id: "$priority",
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],

            tasksByStatus: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],

            tasksPerUser: [
              {
                $group: {
                  _id: "$userId",
                  totalTasks: { $sum: 1 },
                  completedTasks: {
                    $sum: {
                      $cond: [{ $eq: ["$status", TaskStatus.completed] }, 1, 0],
                    },
                  },
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "_id",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $unwind: "$user",
              },
              {
                $project: {
                  email: "$user.email",
                  role: "$user.role",
                  totalTasks: 1,
                  completedTasks: 1,
                  completionRate: {
                    $cond: [
                      { $gt: ["$totalTasks", 0] },
                      {
                        $round: [
                          {
                            $multiply: [
                              { $divide: ["$completedTasks", "$totalTasks"] },
                              100,
                            ],
                          },
                          2,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
              {
                $sort: { totalTasks: -1 },
              },
            ],

            recentActivity: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                  },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  tasksCreated: { $sum: 1 },
                },
              },
              {
                $sort: { _id: 1 },
              },
            ],

            topPerformers: [
              {
                $group: {
                  _id: "$userId",
                  totalTasks: { $sum: 1 },
                  completedTasks: {
                    $sum: {
                      $cond: [{ $eq: ["$status", TaskStatus.completed] }, 1, 0],
                    },
                  },
                },
              },
              {
                $match: {
                  totalTasks: { $gte: 3 }, // Only users with at least 3 tasks
                },
              },
              {
                $addFields: {
                  completionRate: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$completedTasks", "$totalTasks"] },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "_id",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $unwind: "$user",
              },
              {
                $project: {
                  email: "$user.email",
                  totalTasks: 1,
                  completedTasks: 1,
                  completionRate: 1,
                },
              },
              {
                $sort: { completionRate: -1 },
              },
              {
                $limit: 10,
              },
            ],
          },
        },
      ]),

      User.countDocuments({ role: "user" }),
    ]);

    const summary = analytics[0].summary[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      completionRate: 0,
    };

    summary.totalUsers = totalUsers;

    const result = {
      summary,
      tasksByPriority: analytics[0].tasksByPriority,
      tasksByStatus: analytics[0].tasksByStatus,
      tasksPerUser: analytics[0].tasksPerUser,
      recentActivity: analytics[0].recentActivity,
      topPerformers: analytics[0].topPerformers,
    };

    ResponseHandler.success(res, "Analytics retrieved successfully", result);
  } catch (error) {
    console.error("Analytics error:", error);
    ResponseHandler.error(res, "Failed to retrieve analytics");
  }
};

export const getUserTaskStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const userStats = await Task.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          completionRate: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              {
                $multiply: [
                  { $divide: ["$completedTasks", "$totalTasks"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);

    const stats = userStats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      highPriorityTasks: 0,
      completionRate: 0,
    };

    ResponseHandler.success(res, "User task stats fetched successfully", {
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching user stats" });
  }
};
