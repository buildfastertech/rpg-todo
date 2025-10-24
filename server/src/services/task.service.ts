import supabase from '../config/supabase';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.util';
import type { CreateTaskInput, UpdateTaskInput, TaskPriorityType, TaskStatusType } from '../validators/task.validator';

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
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
}

interface Label {
  id: string;
  labelName: string;
}

interface TaskFilters {
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  page: number;
  limit: number;
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
      .select('*, custom_labels(id, label_name)', { count: 'exact' })
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .order('priority', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestError(`Failed to fetch tasks: ${error.message}`);
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
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      labels: task.custom_labels || [],
    }));

    return { tasks, total: count || 0 };
  },

  async getTaskById(taskId: string, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, custom_labels(id, label_name)')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Task not found');
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      dueDate: data.due_date,
      status: data.status,
      priority: data.priority,
      xpValue: data.xp_value,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      labels: data.custom_labels || [],
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
      })
      .select()
      .single();

    if (error || !task) {
      throw new BadRequestError(`Failed to create task: ${error?.message}`);
    }

    // Add labels if provided
    if (input.labels && input.labels.length > 0) {
      const labelInserts = input.labels.map((label) => ({
        task_id: task.id,
        label_name: label,
      }));

      const { error: labelError } = await supabase
        .from('custom_labels')
        .insert(labelInserts);

      if (labelError) {
        console.error('Error adding labels:', labelError);
      }
    }

    return this.getTaskById(task.id, userId);
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
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        throw new BadRequestError(`Failed to update task: ${error.message}`);
      }
    }

    // Update labels if provided
    if (input.labels !== undefined) {
      // Delete existing labels
      await supabase
        .from('custom_labels')
        .delete()
        .eq('task_id', taskId);

      // Add new labels
      if (input.labels.length > 0) {
        const labelInserts = input.labels.map((label) => ({
          task_id: taskId,
          label_name: label,
        }));

        await supabase
          .from('custom_labels')
          .insert(labelInserts);
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
    const { error: updateError } = await supabase
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
    });

    if (xpError) {
      console.error('Error awarding XP:', xpError);
      throw new BadRequestError('Failed to award XP');
    }

    const xpData = xpResult?.[0] || { new_total_xp: 0, new_level: 1, leveled_up: false };

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
    };
  },

  async archiveTask(taskId: string, userId: string): Promise<Task> {
    // Verify task ownership
    await this.getTaskById(taskId, userId);

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'archived' } as any)
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

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'open' } as any)
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestError(`Failed to unarchive task: ${error.message}`);
    }

    return this.getTaskById(taskId, userId);
  },
};

