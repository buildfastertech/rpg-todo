import supabase from '../config/supabase';
import { NotFoundError, BadRequestError } from '../utils/errors.util';
import type { CreateLabelInput, UpdateLabelInput } from '../validators/label.validator';
import type { Database } from '../types/database.types';

type LabelRow = Database['public']['Tables']['labels']['Row'];

interface Label {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export const labelService = {
  async getLabels(userId: string): Promise<Label[]> {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestError(`Failed to fetch labels: ${error.message}`);
    }

    return (data || []).map((label: any) => ({
      id: label.id,
      userId: label.user_id,
      name: label.name,
      color: label.color,
      createdAt: label.created_at,
      updatedAt: label.updated_at,
    }));
  },

  async getLabelById(labelId: string, userId: string): Promise<Label> {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('id', labelId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Label not found');
    }

    const label = data as LabelRow;

    return {
      id: label.id,
      userId: label.user_id,
      name: label.name,
      color: label.color,
      createdAt: label.created_at,
      updatedAt: label.updated_at,
    };
  },

  async createLabel(userId: string, input: CreateLabelInput): Promise<Label> {
    // Check if label with same name already exists for this user
    const { data: existing } = await supabase
      .from('labels')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', input.name)
      .single();

    if (existing) {
      throw new BadRequestError('A label with this name already exists');
    }

    const { data, error } = await supabase
      .from('labels')
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color || '#6B7280',
      } as any)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestError(`Failed to create label: ${error?.message}`);
    }

    const label = data as LabelRow;

    return {
      id: label.id,
      userId: label.user_id,
      name: label.name,
      color: label.color,
      createdAt: label.created_at,
      updatedAt: label.updated_at,
    };
  },

  async updateLabel(labelId: string, userId: string, input: UpdateLabelInput): Promise<Label> {
    // Verify label ownership
    await this.getLabelById(labelId, userId);

    const updateData: any = {};

    if (input.name !== undefined) {
      // Check if new name conflicts with existing label
      const { data: existing } = await supabase
        .from('labels')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', input.name)
        .neq('id', labelId)
        .single();

      if (existing) {
        throw new BadRequestError('A label with this name already exists');
      }

      updateData.name = input.name;
    }

    if (input.color !== undefined) {
      updateData.color = input.color;
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await (supabase as any)
        .from('labels')
        .update(updateData)
        .eq('id', labelId)
        .eq('user_id', userId);

      if (error) {
        throw new BadRequestError(`Failed to update label: ${error.message}`);
      }
    }

    return this.getLabelById(labelId, userId);
  },

  async deleteLabel(labelId: string, userId: string): Promise<void> {
    // Verify label ownership
    await this.getLabelById(labelId, userId);

    // Delete label (CASCADE will handle task_labels)
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', labelId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestError(`Failed to delete label: ${error.message}`);
    }
  },

  async getOrCreateLabel(userId: string, name: string, color?: string): Promise<Label> {
    // Try to find existing label (case-insensitive)
    const { data: existing } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', name)
      .single();

    if (existing) {
      const label = existing as LabelRow;
      return {
        id: label.id,
        userId: label.user_id,
        name: label.name,
        color: label.color,
        createdAt: label.created_at,
        updatedAt: label.updated_at,
      };
    }

    // Create new label
    return this.createLabel(userId, { name, color });
  },
};

