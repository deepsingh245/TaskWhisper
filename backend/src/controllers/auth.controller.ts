import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'User created successfully', user: data.user, session: data.session });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json({ message: 'Login successful', user: data.user, session: data.session });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
