import express from 'express';

import { UserRole } from '../types';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getTaskAnalytics, getUserTaskStats } from '../controllers/analytics.controller';

const router = express.Router();

router.get("/", authenticate, authorize(UserRole.admin), getTaskAnalytics);
router.get('/user-stats', authenticate, getUserTaskStats);

export default router;