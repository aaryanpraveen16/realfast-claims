import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
  userId: string;
  role: 'MEMBER' | 'PROVIDER' | 'ADJUDICATOR' | 'SUPER_ADMIN';
  iat: number;
  exp: number;
}

interface AuthState {
  user: UserPayload | null;
  token: string | null;
  setAuth: (token: string) => void;
  clearAuth: () => void;
}

// Helper to decode token safely
const decodeToken = (token: string): UserPayload | null => {
  try {
    return jwtDecode<UserPayload>(token);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: decodeToken(localStorage.getItem('token') || ''),
  token: localStorage.getItem('token'),
  setAuth: (token: string) => {
    localStorage.setItem('token', token);
    const user = decodeToken(token);
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
