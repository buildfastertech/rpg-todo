import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/tasks
 * @desc    Get user tasks with filtering and pagination
 * @access  Private
 * @query   status - Filter by status (open, completed, archived)
 * @query   priority - Filter by priority (Low, Medium, High, Urgent)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (10, 25, or 50; default: 25)
 */
router.get('/', taskController.getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get('/:id', taskController.getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createTaskSchema),
  taskController.createTask
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(updateTaskSchema),
  taskController.updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task permanently
 * @access  Private
 */
router.delete('/:id', taskController.deleteTask);

/**
 * @route   PATCH /api/tasks/:id/complete
 * @desc    Mark task as completed and award XP
 * @access  Private
 */
router.patch('/:id/complete', taskController.completeTask);

/**
 * @route   PATCH /api/tasks/:id/archive
 * @desc    Archive task
 * @access  Private
 */
router.patch('/:id/archive', taskController.archiveTask);

/**
 * @route   PATCH /api/tasks/:id/unarchive
 * @desc    Unarchive task (move back to open)
 * @access  Private
 */
router.patch('/:id/unarchive', taskController.unarchiveTask);

export default router;

