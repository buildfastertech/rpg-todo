import { Response, NextFunction } from 'express';
import { achievementService } from '../services/achievement.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const achievementController = {
  async getAllAchievements(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievements = await achievementService.getAllAchievements();

      res.json({
        success: true,
        data: {
          achievements,
          count: achievements.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserAchievements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const achievements = await achievementService.getUserAchievements(userId);

      res.json({
        success: true,
        data: {
          achievements,
          count: achievements.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getAchievementsWithProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const achievements = await achievementService.getAchievementsWithProgress(userId);

      const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

      res.json({
        success: true,
        data: {
          achievements,
          totalCount: achievements.length,
          unlockedCount,
          lockedCount: achievements.length - unlockedCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async checkAchievements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const newAchievements = await achievementService.checkAndAwardAchievements(userId);

      res.json({
        success: true,
        message: newAchievements.length > 0
          ? `Congratulations! You unlocked ${newAchievements.length} achievement(s)!`
          : 'No new achievements unlocked',
        data: {
          newAchievements,
          count: newAchievements.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

