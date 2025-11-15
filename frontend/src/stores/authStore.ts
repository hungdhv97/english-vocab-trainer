import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface LoginResponse {
  user_id: number;
  username: string;
  jwt_token: string;
  profile?: UserProfile;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (userData: LoginResponse) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (userData) => {
    // Store in localStorage
    localStorage.setItem('jwt_token', userData.jwt_token);
    localStorage.setItem('user_id', userData.user_id.toString());
    localStorage.setItem('username', userData.username);
    
    set({
      user: userData.profile || { 
        user_id: userData.user_id, 
        username: userData.username,
        is_complete: false
      } as UserProfile,
      isAuthenticated: true,
      isLoading: false
    });
    
    // Dispatch event for backward compatibility
    window.dispatchEvent(new Event('auth-state-changed'));
  },
  
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    // Dispatch event for backward compatibility
    window.dispatchEvent(new Event('auth-state-changed'));
  },
  
  updateProfile: (profile) => {
    set({ user: profile });
  },
  
  initialize: async () => {
    const token = localStorage.getItem('jwt_token');
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    
    if (token && userId && username) {
      set({
        user: { 
          user_id: parseInt(userId), 
          username,
          is_complete: false
        } as UserProfile,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      set({ isLoading: false });
    }
  }
}));

