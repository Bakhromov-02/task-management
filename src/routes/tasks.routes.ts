import express from 'express';

import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  getTaskById, 
} from '../controllers/tasks.controller';
import { authenticate } from "../middleware/auth.middleware";
import { validateTask, handleValidationErrors } from '../middleware/validation.middleware';

const router = express.Router();

router.get('/', authenticate, getTasks);
router.post('/', authenticate, validateTask, handleValidationErrors, createTask);
router.get('/:id', authenticate, getTaskById);
router.patch('/:id', authenticate, validateTask, handleValidationErrors, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;