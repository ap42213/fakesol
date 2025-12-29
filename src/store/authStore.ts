import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface SavedWallet {
  id: string;
  name: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  wallets: SavedWallet[];
  activeWalletId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (email: string, password: string, walletName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  syncWithClerk: (clerkId: string, email: string) => Promise<void>;
  
  // Wallet actions
  createWallet: (name?: string) => Promise<void>;
  renameWallet: (id: string, name: string) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  importWallet: (privateKey: string, name?: string) => Promise<void>;
  switchWallet: (id: string) => void;
  
  // Helpers
  getActiveWallet: () => SavedWallet | null;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      wallets: [],
      activeWalletId: null,
      isLoading: false,
      error: null,

      register: async (email: string, password: string, walletName?: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, walletName }),
          });

          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Registration failed');
          }

          set({
            user: data.user,
            token: data.token,
            wallets: data.wallets,
            activeWalletId: data.wallets[0]?.id || null,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Login failed');
          }

          set({
            user: data.user,
            token: data.token,
            wallets: data.wallets,
            activeWalletId: data.wallets[0]?.id || null,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({
          user: null,
          token: null,
          wallets: [],
          activeWalletId: null,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (!res.ok) {
            throw new Error('Not authenticated');
          }

          const data = await res.json();
          set({
            user: data.user,
            wallets: data.wallets,
            activeWalletId: get().activeWalletId || data.wallets[0]?.id || null,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            wallets: [],
            activeWalletId: null,
            isLoading: false,
          });
        }
      },

      syncWithClerk: async (clerkId: string, email: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/api/auth/clerk-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ clerkId, email }),
          });

          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Sync failed');
          }

          set({
            user: data.user,
            token: data.token,
            wallets: data.wallets,
            activeWalletId: data.wallets[0]?.id || null,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Sync failed' 
          });
        }
      },

      createWallet: async (name?: string) => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/api/auth/wallets`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ name }),
          });

          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Failed to create wallet');
          }

          set((state) => ({
            wallets: [...state.wallets, data],
            activeWalletId: data.id,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to create wallet' 
          });
          throw error;
        }
      },

      renameWallet: async (id: string, name: string) => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await fetch(`${API_URL}/api/auth/wallets/${id}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ name }),
          });

          if (!res.ok) {
            throw new Error('Failed to rename wallet');
          }

          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === id ? { ...w, name } : w
            ),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to rename wallet' });
          throw error;
        }
      },

      deleteWallet: async (id: string) => {
        const { token, wallets, activeWalletId } = get();
        if (!token) return;

        if (wallets.length <= 1) {
          set({ error: 'Cannot delete last wallet' });
          return;
        }

        try {
          const res = await fetch(`${API_URL}/api/auth/wallets/${id}`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (!res.ok) {
            throw new Error('Failed to delete wallet');
          }

          const newWallets = wallets.filter((w) => w.id !== id);
          set({
            wallets: newWallets,
            activeWalletId: activeWalletId === id ? newWallets[0]?.id || null : activeWalletId,
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete wallet' });
          throw error;
        }
      },

      importWallet: async (privateKey: string, name?: string) => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/api/auth/wallets/import`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ privateKey, name }),
          });

          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Failed to import wallet');
          }

          set((state) => ({
            wallets: [...state.wallets, data],
            activeWalletId: data.id,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to import wallet' 
          });
          throw error;
        }
      },

      switchWallet: (id: string) => {
        set({ activeWalletId: id });
      },

      getActiveWallet: () => {
        const { wallets, activeWalletId } = get();
        return wallets.find((w) => w.id === activeWalletId) || null;
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'fakesol-auth',
      partialize: (state) => ({
        token: state.token,
        activeWalletId: state.activeWalletId,
      }),
    }
  )
);
