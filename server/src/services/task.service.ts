import supabase from '../config/supabase';
import { NotFoundError, BadRequestError } from '../utils/errors.util';
import type { CreateTaskInput, UpdateTaskInput, TaskPriorityType, TaskStatusType } from '../validators/task.validator';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: TaskStatusType;
  priority: TaskPriorityType;
  xpValue: number;
  category: string | null;
  categories?: Category[];
  labels?: Label[];
  createdAt: string;
  updatedAt: string;
}

interface TaskFilters {
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  priorities?: TaskPriorityType[];
  category?: string;
  categories?: string[];
  label?: string;
  labels?: string[];
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CompleteTaskResult {
  task: Task;
  xpAwarded: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
}

export const taskService = {
  // Calculate XP based on priority
  calculateXP(priority: TaskPriorityType): number {
    const xpMap: Record<TaskPriorityType, number> = {
      Low: 10,
      Medium: 25,
      High: 50,
      Urgent: 75,
    };
    return xpMap[priority];
  },

  async getTasks(userId: string, filters: TaskFilters): Promise<{ tasks: Task[]; total: number }> {
    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .order('priority', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Handle priority filters (single or multiple)
    if (filters.priorities && filters.priorities.length > 0) {
      query = query.in('priority', filters.priorities);
    } else if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    // Handle category filters (single or multiple)
    let categoryFilteredTaskIds: string[] | null = null;
    const categoriesToFilter = filters.categories && filters.categories.length > 0 
      ? filters.categories 
      : filters.category 
      ? [filters.category] 
      : null;

    if (categoriesToFilter) {
      const { data: categoryTasks } = await supabase
        .from('task_categories')
        .select('task_id, categories!inner(name)')
        .in('categories.name', categoriesToFilter);

      if (categoryTasks) {
        categoryFilteredTaskIds = [...new Set(categoryTasks.map((ct: any) => ct.task_id))];
        
        if (categoryFilteredTaskIds.length === 0) {
          return { tasks: [], total: 0 };
        }
        
        query = query.in('id', categoryFilteredTaskIds);
      }
    }

    // Handle label filters (single or multiple)
    let labelFilteredTaskIds: string[] | null = null;
    const labelsToFilter = filters.labels && filters.labels.length > 0 
      ? filters.labels 
      : filters.label 
      ? [filters.label] 
      : null;

    if (labelsToFilter) {
      const { data: labelTasks } = await supabase
        .from('task_labels')
        .select('task_id, labels!inner(name)')
        .in('labels.name', labelsToFilter);

      if (labelTasks) {
        labelFilteredTaskIds = [...new Set(labelTasks.map((lt: any) => lt.task_id))];
        
        if (labelFilteredTaskIds.length === 0) {
          return { tasks: [], total: 0 };
        }
        
        // If we also have category filter, intersect the task IDs
        if (categoryFilteredTaskIds) {
          const intersectedIds = labelFilteredTaskIds.filter(id => 
            categoryFilteredTaskIds!.includes(id)
          );
          
          if (intersectedIds.length === 0) {
            return { tasks: [], total: 0 };
          }
          
          query = query.in('id', intersectedIds);
        } else {
          query = query.in('id', labelFilteredTaskIds);
        }
      }
    }

    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestError(`Failed to fetch tasks: ${error.message}`);
    }

    // Fetch categories for all tasks
    const taskIds = (data || []).map((task: any) => task.id);
    let categoriesMap: { [taskId: string]: Category[] } = {};
    let labelsMap: { [taskId: string]: Label[] } = {};

    if (taskIds.length > 0) {
      const { data: taskCategoriesData } = await supabase
        .from('task_categories')
        .select('task_id, categories(id, name, color)')
        .in('task_id', taskIds);

      if (taskCategoriesData) {
        taskCategoriesData.forEach((tc: any) => {
          if (!categoriesMap[tc.task_id]) {
            categoriesMap[tc.task_id] = [];
          }
          if (tc.categories) {
            categoriesMap[tc.task_id].push({
              id: tc.categories.id,
              name: tc.categories.name,
              color: tc.categories.color,
            });
          }
        });
      }

      // Fetch labels for all tasks
      const { data: taskLabelsData } = await supabase
        .from('task_labels')
        .select('task_id, labels(id, name, color)')
        .in('task_id', taskIds);

      if (taskLabelsData) {
        taskLabelsData.forEach((tl: any) => {
          if (!labelsMap[tl.task_id]) {
            labelsMap[tl.task_id] = [];
          }
          if (tl.labels) {
            labelsMap[tl.task_id].push({
              id: tl.labels.id,
              name: tl.labels.name,
              color: tl.labels.color,
            });
          }
        });
      }
    }

    const tasks = (data || []).map((task: any) => ({
      id: task.id,
      userId: task.user_id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      status: task.status,
      priority: task.priority,
      xpValue: task.xp_value,
      category: task.category,
      categories: categoriesMap[task.id] || [],
      labels: labelsMap[task.id] || [],
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));

    return { tasks, total: count || 0 };
  },

  async getTaskById(taskId: string, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Task not found');
    }

    const taskData: any = data;

    // Fetch categories for this task
    const { data: taskCategoriesData } = await supabase
      .from('task_categories')
      .select('categories(id, name, color)')
      .eq('task_id', taskId);

    const categories = (taskCategoriesData || []).map((tc: any) => ({
      id: tc.categories.id,
      name: tc.categories.name,
      color: tc.categories.color,
    }));

    // Fetch labels for this task
    const { data: taskLabelsData } = await supabase
      .from('task_labels')
      .select('labels(id, name, color)')
      .eq('task_id', taskId);

    const labels = (taskLabelsData || []).map((tl: any) => ({
      id: tl.labels.id,
      name: tl.labels.name,
      color: tl.labels.color,
    }));

    return {
      id: taskData.id,
      userId: taskData.user_id,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.due_date,
      status: taskData.status,
      priority: taskData.priority,
      xpValue: taskData.xp_value,
      category: taskData.category,
      categories: categories,
      labels: labels,
      createdAt: taskData.created_at,
      updatedAt: taskData.updated_at,
    };
  },

  async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const xpValue = this.calculateXP(input.priority);

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description || null,
        due_date: input.dueDate,
        priority: input.priority,
        xp_value: xpValue,
        category: input.category || null,
        status: 'open',
      } as any)
      .select()
      .single();

    if (error || !task) {
      throw new BadRequestError(`Failed to create task: ${error?.message}`);
    }

    const taskData: any = task;

    // Add categories if provided
    if (input.categoryIds && input.categoryIds.length > 0) {
      const categoryInserts = input.categoryIds.map((categoryId) => ({
        task_id: taskData.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from('task_categories')
        .insert(categoryInserts as any);

      if (categoryError) {
        console.error('Error adding categories:', categoryError);
      }
    }

    // Add labels if provided
    if (input.labelIds && input.labelIds.length > 0) {
      const labelInserts = input.labelIds.map((labelId) => ({
        task_id: taskData.id,
        label_id: labelId,
      }));

      const { error: labelError } = await supabase
        .from('task_labels')
        .insert(labelInserts as any);

      if (labelError) {
        console.error('Error adding labels:', labelError);
      }
    }

    return this.getTaskById(taskData.id, userId);
  },

  async updateTask(taskId: string, userId: string, input: UpdateTaskInput): Promise<Task> {
    // Verify task ownership
    await this.getTaskById(taskId, userId);

    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
    if (input.category !== undefined) updateData.category = input.category;

    // Recalculate XP if priority changes
    if (input.priority !== undefined) {
      updateData.priority = input.priority;
      updateData.xp_value = this.calculateXP(input.priority);
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await (supabase as any)
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        throw new BadRequestError(`Failed to update task: ${error.message}`);
      }
    }

    // Update categories if provided
    if (input.categoryIds !== undefined) {
      // Delete existing category associations
      await supabase
        .from('task_categories')
        .delete()
        .eq('task_id', taskId);

      // Add new category associations
      if (input.categoryIds.length > 0) {
        const categoryInserts = input.categoryIds.map((categoryId) => ({
          task_id: taskId,
          category_id: categoryId,
        }));

        await supabase
          .from('task_categories')
          .insert(categoryInserts as any);
      }
    }

    // Update labels if provided
    if (input.labelIds !== undefined) {
      // Delete existing label associations
      await supabase
        .from('task_labels')
        .delete()
        .eq('task_id', taskId);

      // Add new label associations
      if (input.labelIds.length > 0) {
        const labelInserts = input.labelIds.map((labelId) => ({
          task_id: taskId,
          label_id: labelId,
        }));

        await supabase
          .from('task_labels')
          .insert(labelInserts as any);
      }
    }

    return this.getTaskById(taskId, userId);
  },

  async deleteTask(taskId: string, userId: string): Promise<void> {
    // Verify task ownership
    await this.getTaskById(taskId, userId);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestError(`Failed to delete task: ${error.message}`);
    }
  },

  async completeTask(taskId: string, userId: string): Promise<CompleteTaskResult> {
    // Get task details
    const task = await this.getTaskById(taskId, userId);

    if (task.status === 'completed') {
      throw new BadRequestError('Task is already completed');
    }

    // Update task status
    const { error: updateError } = await (supabase as any)
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (updateError) {
      throw new BadRequestError(`Failed to complete task: ${updateError.message}`);
    }

    // Award XP via ledger
    const { data: xpResult, error: xpError } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_xp_value: task.xpValue,
      p_description: `Completed task: ${task.title}`,
      p_task_id: taskId,
    } as any);

    if (xpError) {
      console.error('Error awarding XP:', xpError);
      throw new BadRequestError('Failed to award XP');
    }

    const xpData: any = xpResult?.[0] || { new_total_xp: 0, new_level: 1, leveled_up: false };

    // Get updated task
    const updatedTask = await this.getTaskById(taskId, userId);

    // Check for new achievements (import at top of file)
    const { achievementService } = await import('./achievement.service');
    const newAchievements = await achievementService.checkAndAwardAchievements(userId);

    return {
      task: updatedTask,
      xpAwarded: task.xpValue,
      newTotalXp: xpData.new_total_xp,
      newLevel: xpData.new_level,
      leveledUp: xpData.leveled_up,
      newAchievements: newAchievements,
    } as any;
  },

  async archiveTask(taskId: string, userId: string): Promise<Task> {
    // Verify task ownership
    await this.getTaskById(taskId, userId);

    const { error } = await (supabase as any)
      .from('tasks')
      .update({ status: 'archived' })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestError(`Failed to archive task: ${error.message}`);
    }

    return this.getTaskById(taskId, userId);
  },

  async unarchiveTask(taskId: string, userId: string): Promise<Task> {
    // Verify task ownership
    const task = await this.getTaskById(taskId, userId);

    if (task.status !== 'archived') {
      throw new BadRequestError('Task is not archived');
    }

    const { error } = await (supabase as any)
      .from('tasks')
      .update({ status: 'open' })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestError(`Failed to unarchive task: ${error.message}`);
    }

    return this.getTaskById(taskId, userId);
  },
};

