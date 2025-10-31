import { Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { AuthRequest } from '../middleware/auth.middleware';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export const categoryController = {
  async getCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const categories = await categoryService.getCategories(userId);

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategoryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const category = await categoryService.getCategoryById(id, userId);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const input: CreateCategoryInput = req.body;

      const category = await categoryService.createCategory(userId, input);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const input: UpdateCategoryInput = req.body;

      const category = await categoryService.updateCategory(id, userId, input);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await categoryService.deleteCategory(id, userId);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

