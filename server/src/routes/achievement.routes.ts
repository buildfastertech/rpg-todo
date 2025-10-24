import { Router } from 'express';
import { achievementController } from '../controllers/achievement.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All achievement routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/achievements
 * @desc    Get all available achievements
 * @access  Private
 */
router.get('/', achievementController.getAllAchievements);

/**
 * @route   GET /api/achievements/user
 * @desc    Get user's unlocked achievements
 * @access  Private
 */
router.get('/user', achievementController.getUserAchievements);

/**
 * @route   GET /api/achievements/progress
 * @desc    Get all achievements with user's progress
 * @access  Private
 */
router.get('/progress', achievementController.getAchievementsWithProgress);

/**
 * @route   POST /api/achievements/check
 * @desc    Check and award eligible achievements
 * @access  Private
 */
router.post('/check', achievementController.checkAchievements);

export default router;

