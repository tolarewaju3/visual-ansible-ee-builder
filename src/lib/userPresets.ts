import { supabase } from '@/integrations/supabase/client';
import { Collection } from './storage';

export interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon: string;
  base_image: string;
  collections: Collection[];
  requirements: string[];
  packages: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserPresetData {
  name: string;
  description?: string;
  icon?: string;
  base_image: string;
  collections: Collection[];
  requirements: string[];
  packages: string[];
}

export const userPresetsService = {
  async getUserPresets(): Promise<UserPreset[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_presets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user presets:', error);
      return [];
    }

    return (data || []).map(preset => ({
      ...preset,
      collections: preset.collections as unknown as Collection[],
      requirements: preset.requirements as unknown as string[],
      packages: preset.packages as unknown as string[],
    }));
  },

  async createUserPreset(presetData: CreateUserPresetData): Promise<UserPreset | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_presets')
      .insert({
        user_id: session.session.user.id,
        name: presetData.name,
        description: presetData.description,
        icon: presetData.icon || '⚙️',
        base_image: presetData.base_image,
        collections: presetData.collections as any,
        requirements: presetData.requirements as any,
        packages: presetData.packages as any,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user preset:', error);
      throw error;
    }

    return data ? {
      ...data,
      collections: data.collections as unknown as Collection[],
      requirements: data.requirements as unknown as string[],
      packages: data.packages as unknown as string[],
    } : null;
  },

  async updateUserPreset(id: string, updates: Partial<CreateUserPresetData>): Promise<UserPreset | null> {
    const updateData: any = { ...updates };
    if (updates.collections) updateData.collections = updates.collections as any;
    if (updates.requirements) updateData.requirements = updates.requirements as any;
    if (updates.packages) updateData.packages = updates.packages as any;

    const { data, error } = await supabase
      .from('user_presets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user preset:', error);
      throw error;
    }

    return data ? {
      ...data,
      collections: data.collections as unknown as Collection[],
      requirements: data.requirements as unknown as string[],
      packages: data.packages as unknown as string[],
    } : null;
  },

  async deleteUserPreset(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_presets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user preset:', error);
      throw error;
    }
  },
};