import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// ---------- SIGNUP ----------
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return res.status(400).json({ error: error.message });

    if (data.session?.refresh_token) {
      res.cookie('refreshToken', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    res.status(201).json({
      message: 'User created',
      user: data.user,
      accessToken: data.session?.access_token,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- LOGIN ----------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    if (data.session?.refresh_token) {
      res.cookie('refreshToken', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    res.status(200).json({
      message: 'Login successful',
      user: data.user,
      accessToken: data.session?.access_token,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- REFRESH ----------
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) return res.status(401).json({ error: error.message });

    // update cookie with new refresh token
    if (data.session?.refresh_token) {
      res.cookie('refreshToken', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    res.status(200).json({ accessToken: data.session?.access_token });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- LOGOUT ----------
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('refreshToken', { path: '/' });
    await supabase.auth.signOut();
    res.status(200).json({ message: 'Logged out' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- CURRENT USER ----------
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ error: error.message });

    res.status(200).json({ user });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- UPDATE PROFILE ----------
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
    const token = authHeader.split(' ')[1];

    const { name, avatarUrl } = req.body;

    const updates: any = {};
    if (name) updates.full_name = name;
    if (avatarUrl) updates.avatar_url = avatarUrl;

    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    const { data: userData, error: updateError } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { user_metadata: updates }
    );

    if (updateError) return res.status(400).json({ error: updateError.message });

    res.status(200).json({ message: 'Profile updated', user: userData.user });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};