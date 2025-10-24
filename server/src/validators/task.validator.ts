import { z } from 'zod';

// Task priority enum
export const TaskPriority = z.enum(['Low', 'Medium', 'High', 'Urgent']);
export type TaskPriorityType = z.infer<typeof TaskPriority>;

// Task status enum
export const TaskStatus = z.enum(['open', 'completed', 'archived']);
export type TaskStatusType = z.infer<typeof TaskStatus>;

// Create task schema
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  dueDate: z.string()
    .datetime('Invalid date format')
    .optional()
    .nullable(),
  priority: TaskPriority,
  category: z.string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  labels: z.array(z.string().max(50))
    .max(20, 'Maximum 20 labels per task')
    .optional(),
});

// Update task schema
export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  dueDate: z.string()
    .datetime('Invalid date format')
    .optional()
    .nullable(),
  priority: TaskPriority.optional(),
  category: z.string()
    .max(50, 'Category must be less than 50 characters')
    .optional()
    .nullable(),
  labels: z.array(z.string().max(50))
    .max(20, 'Maximum 20 labels per task')
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

