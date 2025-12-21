import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { GameSettings, GameStats } from '../components/GameContext';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings extends GameSettings {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface GameHistoryRecord extends GameStats {
  id: string;
  user_id: string;
  created_at: string;
}

class SupabaseService {
  // Authentication
  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        }
      }
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Subscribe to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }

  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'name'>>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // User Settings
  async getUserSettings(userId: string): Promise<GameSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return {
          listLength: 5,
          timerEnabled: true,
          timerMinutes: 3,
          hintsEnabled: true,
          maxHints: 2,
        };
      }
      throw error;
    }
    
    return {
      listLength: data.list_length,
      timerEnabled: data.timer_enabled,
      timerMinutes: data.timer_minutes,
      hintsEnabled: data.hints_enabled,
      maxHints: data.max_hints,
    };
  }

  async updateUserSettings(userId: string, settings: GameSettings) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        list_length: settings.listLength,
        timer_enabled: settings.timerEnabled,
        timer_minutes: settings.timerMinutes,
        hints_enabled: settings.hintsEnabled,
        max_hints: settings.maxHints,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Game History
  async getUserGameHistory(userId: string, limit: number = 50): Promise<GameStats[]> {
    const { data, error } = await supabase
      .from('game_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(record => ({
      accuracy: record.accuracy,
      timeTaken: record.time_taken,
      hintsUsed: record.hints_used,
      itemsCorrect: record.items_correct,
      itemsTotal: record.items_total,
    }));
  }

  async saveGameResult(userId: string, gameStats: GameStats) {
    const { data, error } = await supabase
      .from('game_history')
      .insert({
        user_id: userId,
        accuracy: gameStats.accuracy,
        time_taken: gameStats.timeTaken,
        hints_used: gameStats.hintsUsed,
        items_correct: gameStats.itemsCorrect,
        items_total: gameStats.itemsTotal,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Analytics
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('game_history')
      .select('accuracy, time_taken, hints_used, items_correct, items_total, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data.length === 0) {
      return {
        totalGames: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        averageTime: 0,
        bestTime: 0,
        totalCorrectItems: 0,
        totalHintsUsed: 0,
        recentGames: [],
      };
    }

    const totalGames = data.length;
    const averageAccuracy = Math.round(
      data.reduce((sum, game) => sum + game.accuracy, 0) / totalGames
    );
    const bestAccuracy = Math.max(...data.map(game => game.accuracy));
    const averageTime = Math.round(
      data.reduce((sum, game) => sum + game.time_taken, 0) / totalGames
    );
    const bestTime = Math.min(...data.map(game => game.time_taken));
    const totalCorrectItems = data.reduce((sum, game) => sum + game.items_correct, 0);
    const totalHintsUsed = data.reduce((sum, game) => sum + game.hints_used, 0);

    return {
      totalGames,
      averageAccuracy,
      bestAccuracy,
      averageTime,
      bestTime,
      totalCorrectItems,
      totalHintsUsed,
      recentGames: data.slice(0, 10).map(record => ({
        accuracy: record.accuracy,
        timeTaken: record.time_taken,
        hintsUsed: record.hints_used,
        itemsCorrect: record.items_correct,
        itemsTotal: record.items_total,
      })),
    };
  }
}

export const supabaseService = new SupabaseService();