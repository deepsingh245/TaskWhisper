import { supabase } from '../config/supabase';

export default class User {
    static async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    static async updateProfile(userId: string, updates: any) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select();

        if (error) throw error;
        return data;
    }
}
