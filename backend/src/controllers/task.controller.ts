import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { title, description, due_date, priority, status } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        { 
            user_id: user.id,
            title,
            description,
            due_date,
            priority: priority || 'Medium',
            status: status || 'To Do'
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id, ...updates } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the task
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.body; // Or req.params if you change the route

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
};
