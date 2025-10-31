export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      task_categories: {
        Row: {
          task_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          task_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          task_id?: string
          category_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          email: string
          password: string
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          password: string
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password?: string
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string
          status: 'open' | 'completed' | 'archived'
          priority: 'Low' | 'Medium' | 'High' | 'Urgent'
          xp_value: number
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date: string
          status?: 'open' | 'completed' | 'archived'
          priority: 'Low' | 'Medium' | 'High' | 'Urgent'
          xp_value: number
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string
          status?: 'open' | 'completed' | 'archived'
          priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
          xp_value?: number
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          achievement_name: string
          achievement_description: string
          achievement_type: 'task_milestone' | 'level_milestone' | 'special'
          requirement_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          achievement_name: string
          achievement_description: string
          achievement_type: 'task_milestone' | 'level_milestone' | 'special'
          requirement_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          achievement_name?: string
          achievement_description?: string
          achievement_type?: 'task_milestone' | 'level_milestone' | 'special'
          requirement_value?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      achievement_user: {
        Row: {
          user_id: string
          achievement_id: string
          unlocked_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          achievement_id: string
          unlocked_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      custom_labels: {
        Row: {
          id: string
          task_id: string
          label_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          label_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          label_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      points_ledger: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          description: string
          xp_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          description: string
          xp_value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          description?: string
          xp_value?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string
          username: string
          email: string
          level: number
          created_at: string
          total_xp: number
          completed_task_count: number
          total_achievements: number
        }
      }
    }
    Functions: {
      get_user_total_xp: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_level_from_xp: {
        Args: { xp: number }
        Returns: number
      }
      get_completed_task_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_urgent_tasks_this_week: {
        Args: { p_user_id: string }
        Returns: Database['public']['Tables']['tasks']['Row'][]
      }
      award_xp: {
        Args: {
          p_user_id: string
          p_xp_value: number
          p_description: string
          p_task_id?: string | null
        }
        Returns: {
          new_total_xp: number
          new_level: number
          leveled_up: boolean
        }[]
      }
    }
  }
}

