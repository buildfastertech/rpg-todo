import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { AuthRequest } from '../middleware/auth.middleware';
import type { CreateTaskInput, UpdateTaskInput, TaskStatusType, TaskPriorityType } from '../validators/task.validator';

export const taskController = {
  async getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { status, priority, priorities, category, categories, label, labels, sortBy, sortOrder, page = '1', limit = '25' } = req.query;

      // Parse array parameters (they come as comma-separated strings or arrays)
      const parsePriorities = (): TaskPriorityType[] | undefined => {
        if (priorities) {
          const arr = Array.isArray(priorities) ? priorities : String(priorities).split(',');
          return arr.map(p => String(p).trim() as TaskPriorityType);
        }
        return undefined;
      };

      const parseCategories = (): string[] | undefined => {
        if (categories) {
          return Array.isArray(categories) ? categories.map(c => String(c)) : String(categories).split(',').map(c => c.trim());
        }
        return undefined;
      };

      const parseLabels = (): string[] | undefined => {
        if (labels) {
          return Array.isArray(labels) ? labels.map(l => String(l)) : String(labels).split(',').map(l => l.trim());
        }
        return undefined;
      };

      const filters = {
        status: status as TaskStatusType | undefined,
        priority: priority as TaskPriorityType | undefined,
        priorities: parsePriorities(),
        category: category as string | undefined,
        categories: parseCategories(),
        label: label as string | undefined,
        labels: parseLabels(),
        sortBy: sortBy as string | undefined,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      // Validate pagination
      if (filters.page < 1) {
        res.status(400).json({
          success: false,
          message: 'Page must be greater than 0',
        });
        return;
      }

      if (![10, 25, 50].includes(filters.limit)) {
        res.status(400).json({
          success: false,
          message: 'Limit must be 10, 25, or 50',
        });
        return;
      }

      const result = await taskService.getTasks(userId, filters);

      res.json({
        success: true,
        data: {
          tasks: result.tasks,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / filters.limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const task = await taskService.getTaskById(id, userId);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const input: CreateTaskInput = req.body;

      const task = await taskService.createTask(userId, input);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const input: UpdateTaskInput = req.body;

      const task = await taskService.updateTask(id, userId, input);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await taskService.deleteTask(id, userId);

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async completeTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await taskService.completeTask(id, userId);

      res.json({
        success: true,
        message: result.leveledUp 
          ? `Task completed! You earned ${result.xpAwarded} XP and leveled up to Level ${result.newLevel}!` 
          : `Task completed! You earned ${result.xpAwarded} XP.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async archiveTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const task = await taskService.archiveTask(id, userId);

      res.json({
        success: true,
        message: 'Task archived successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async unarchiveTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const task = await taskService.unarchiveTask(id, userId);

      res.json({
        success: true,
        message: 'Task unarchived successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },
};

