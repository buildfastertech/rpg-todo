import { Response, NextFunction } from 'express';
import { labelService } from '../services/label.service';
import { AuthRequest } from '../middleware/auth.middleware';
import type { CreateLabelInput, UpdateLabelInput } from '../validators/label.validator';

export const labelController = {
  async getLabels(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const labels = await labelService.getLabels(userId);
      res.json({
        success: true,
        data: labels,
      });
    } catch (error) {
      next(error);
    }
  },

  async getLabelById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const label = await labelService.getLabelById(id, userId);
      res.json({
        success: true,
        data: label,
      });
    } catch (error) {
      next(error);
    }
  },

  async createLabel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const input: CreateLabelInput = req.body;
      const label = await labelService.createLabel(userId, input);
      res.status(201).json({
        success: true,
        message: 'Label created successfully',
        data: label,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLabel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const input: UpdateLabelInput = req.body;
      const label = await labelService.updateLabel(id, userId, input);
      res.json({
        success: true,
        message: 'Label updated successfully',
        data: label,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteLabel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await labelService.deleteLabel(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

