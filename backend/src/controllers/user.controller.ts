import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const updates = req.body;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: data.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
