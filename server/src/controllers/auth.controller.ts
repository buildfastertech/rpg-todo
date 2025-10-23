import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: RegisterInput = req.body;
      const result = await authService.register(input);

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

  async logout(req: Request, res: Response): void {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  },
};

