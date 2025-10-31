import supabase from '../config/supabase';
import { NotFoundError, BadRequestError } from '../utils/errors.util';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';
import type { Database } from '../types/database.types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestError(`Failed to fetch categories: ${error.message}`);
    }

    return (data || []).map((cat: any) => ({
      id: cat.id,
      userId: cat.user_id,
      name: cat.name,
      color: cat.color,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }));
  },

  async getCategoryById(categoryId: string, userId: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Category not found');
    }

    const category = data as CategoryRow;

    return {
      id: category.id,
      userId: category.user_id,
      name: category.name,
      color: category.color,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    };
  },

  async createCategory(userId: string, input: CreateCategoryInput): Promise<Category> {
    // Check if category with same name already exists for this user
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', input.name)
      .single();

    if (existing) {
      throw new BadRequestError('A category with this name already exists');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color || '#6B7280',
      } as any)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestError(`Failed to create category: ${error?.message}`);
    }

    const category = data as CategoryRow;

    return {
      id: category.id,
      userId: category.user_id,
      name: category.name,
      color: category.color,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    };
  },

  async updateCategory(categoryId: string, userId: string, input: UpdateCategoryInput): Promise<Category> {
    // Verify category ownership
    await this.getCategoryById(categoryId, userId);

    const updateData: any = {};

    if (input.name !== undefined) {
      // Check if new name conflicts with existing category
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', input.name)
        .neq('id', categoryId)
        .single();

      if (existing) {
        throw new BadRequestError('A category with this name already exists');
      }

      updateData.name = input.name;
    }

    if (input.color !== undefined) {
      updateData.color = input.color;
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await (supabase as any)
        .from('categories')
        .update(updateData)
        .eq('id', categoryId)
        .eq('user_id', userId);

      if (error) {
        throw new BadRequestError(`Failed to update category: ${error.message}`);
      }
    }

    return this.getCategoryById(categoryId, userId);
  },

  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    // Verify category ownership
    await this.getCategoryById(categoryId, userId);

    // Delete category (CASCADE will handle task_categories)
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestError(`Failed to delete category: ${error.message}`);
    }
  },

  async getOrCreateCategory(userId: string, name: string, color?: string): Promise<Category> {
    // Try to find existing category (case-insensitive)
    const { data: existing } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', name)
      .single();

    if (existing) {
      const category = existing as CategoryRow;
      return {
        id: category.id,
        userId: category.user_id,
        name: category.name,
        color: category.color,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      };
    }

    // Create new category
    return this.createCategory(userId, { name, color });
  },
};

