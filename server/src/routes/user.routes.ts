import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with stats
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile (username)
 * @access  Private
 */
router.put(
  '/profile',
  validateRequest(updateProfileSchema),
  userController.updateProfile
);

/**
 * @route   GET /api/users/stats
 * @desc    Get detailed user statistics
 * @access  Private
 */
router.get('/stats', userController.getStats);

/**
 * @route   GET /api/users/xp-history
 * @desc    Get user XP transaction history
 * @access  Private
 * @query   limit - Number of entries to return (1-100, default: 20)
 */
router.get('/xp-history', userController.getXPHistory);

export default router;

