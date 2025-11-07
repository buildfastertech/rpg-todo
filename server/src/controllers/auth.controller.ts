import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: RegisterInput = req.body;
      const result = await authService.register(input);

      // Handle redirect to login case (email already exists)
      if (result.redirectToLogin) {
        res.status(200).json({
          success: true,
          message: 'Please login to continue',
          data: {
            redirectToLogin: true,
          },
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const result = await authService.login(input);

      res.json({
        success: true,
        message: result.leveledUp 
          ? 'Login successful! You leveled up!' 
          : 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  },
};

