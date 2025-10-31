import { Router } from 'express';
import { labelController } from '../controllers/label.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createLabelSchema, updateLabelSchema } from '../validators/label.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/labels - Get all labels for the authenticated user
router.get('/', labelController.getLabels);

// GET /api/labels/:id - Get a specific label by ID
router.get('/:id', labelController.getLabelById);

// POST /api/labels - Create a new label
router.post('/', validateRequest(createLabelSchema), labelController.createLabel);

// PUT /api/labels/:id - Update a label
router.put('/:id', validateRequest(updateLabelSchema), labelController.updateLabel);

// DELETE /api/labels/:id - Delete a label
router.delete('/:id', labelController.deleteLabel);

export default router;

