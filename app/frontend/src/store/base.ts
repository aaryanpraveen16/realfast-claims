import { create } from 'zustand';

// TODO: authSlice
// Purpose: Manage authentication state, tokens, and user profile.
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setAuth: (user: any, token: string) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}));

// TODO: claimSlice
// Purpose: Manage state for claim submission and current view.
export const useClaimStore = create((set) => ({
  currentClaim: null,
  setClaim: (claim: any) => set({ currentClaim: claim }),
}));
