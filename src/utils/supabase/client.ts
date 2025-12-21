import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Helper function to get the current access token
export async function getAccessToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    return null;
  }
  return session.access_token;
}

// API helper functions
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-34ba2954`;

async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API error for ${endpoint}:`, data.error);
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error);
    throw error;
  }
}

// User settings API
export async function getUserSettings() {
  return makeAuthenticatedRequest('/settings');
}

export async function updateUserSettings(settings: any) {
  return makeAuthenticatedRequest('/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

// Game history API
export async function getGameHistory() {
  return makeAuthenticatedRequest('/games');
}

export async function saveGameResult(gameResult: any) {
  return makeAuthenticatedRequest('/games', {
    method: 'POST',
    body: JSON.stringify(gameResult),
  });
}

// User profile API
export async function getUserProfile() {
  return makeAuthenticatedRequest('/profile');
}

// Auth helpers
export async function signUp(email: string, password: string, name: string, age: number) {
  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name, age }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Signup API error:', data);
      throw new Error(data.error || 'Failed to create account. Please try again.');
    }
    
    console.log('Signup successful, now signing in...');
    
    // After signup, sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in after signup error:', signInError);
      throw new Error(`Account created but sign in failed: ${signInError.message}`);
    }

    console.log('Sign in successful');
    return signInData;
  } catch (error: any) {
    console.error('SignUp error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email or password is incorrect. Please try again or create a new account.');
      }
      
      throw new Error(error.message);
    }

    console.log('Sign in successful');
    return data;
  } catch (error: any) {
    console.error('SignIn error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}
