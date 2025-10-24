import supabase from '../config/supabase';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { generateToken } from '../utils/jwt.util';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/errors.util';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
    level: number;
    totalXp: number;
  };
  token: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    level: number;
    totalXp: number;
  };
  token: string;
  leveledUp?: boolean;
}

export const authService = {
  async register(input: RegisterInput): Promise<RegisterResponse> {
    const { username, email, password } = input;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      throw new ConflictError('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        level: 1,
      } as any)
      .select('id, username, email, level')
      .single();

    if (userError || !user) {
      console.error('User creation error:', userError);
      throw new BadRequestError('Failed to create user');
    }

    const userData: any = user;

    // Award registration XP (5 XP)
    const { data: xpResult, error: xpError } = await supabase.rpc('award_xp', {
      p_user_id: userData.id,
      p_xp_value: 5,
      p_description: 'Registration bonus',
      p_task_id: null,
    } as any);

    if (xpError) {
      console.error('XP award error:', xpError);
    }

    const xpData: any = xpResult?.[0] || {};
    const totalXp = xpData.new_total_xp || 5;
    const level = xpData.new_level || 1;

    // Generate JWT token
    const token = generateToken({
      userId: userData.id,
      email: userData.email,
    });

    return {
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        level,
        totalXp,
      },
      token,
    };
  },

  async login(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, password, level')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userData: any = user;

    // Verify password
    const isPasswordValid = await comparePassword(password, userData.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Get current total XP
    const { data: currentXp } = await supabase.rpc('get_user_total_xp', {
      p_user_id: userData.id,
    } as any);

    // Check if user already got login XP today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayLogin } = await supabase
      .from('points_ledger')
      .select('id')
      .eq('user_id', userData.id)
      .eq('description', 'Daily login')
      .gte('created_at', today)
      .maybeSingle();

    let totalXp = currentXp || 0;
    let level = userData.level;
    let leveledUp = false;

    // Award daily login XP if not already awarded today
    if (!todayLogin) {
      const { data: xpResult, error: xpError } = await supabase.rpc('award_xp', {
        p_user_id: userData.id,
        p_xp_value: 2,
        p_description: 'Daily login',
        p_task_id: null,
      } as any);

      if (!xpError && xpResult?.[0]) {
        const xpData: any = xpResult[0];
        totalXp = xpData.new_total_xp;
        level = xpData.new_level;
        leveledUp = xpData.leveled_up;
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: userData.id,
      email: userData.email,
    });

    return {
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        level,
        totalXp,
      },
      token,
      leveledUp,
    };
  },
};

