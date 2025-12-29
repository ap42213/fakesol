import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  generateWallet,
  importWallet,
  exportPrivateKey,
  getBalance,
  requestAirdrop,
  sendSol,
  getTransactions,
} from '../lib/solana';

export interface Transaction {
  signature: string;
  blockTime: number | null | undefined;
  slot: number;
  err: any;
}

interface WalletState {
  // Wallet data
  keypair: Keypair | null;
  publicKey: string | null;
  balance: number;
  transactions: Transaction[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createWallet: () => void;
  importWalletFromKey: (privateKey: string) => void;
  exportKey: () => string | null;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  requestAirdrop: (amount?: number) => Promise<string>;
  sendTransaction: (to: string, amount: number) => Promise<string>;
  fetchTransactions: () => Promise<void>;
  clearError: () => void;
}

// Helper to persist only serializable data
const serializeKeypair = (keypair: Keypair | null): string | null => {
  if (!keypair) return null;
  return exportPrivateKey(keypair);
};

const deserializeKeypair = (key: string | null): Keypair | null => {
  if (!key) return null;
  try {
    return importWallet(key);
  } catch {
    return null;
  }
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      keypair: null,
      publicKey: null,
      balance: 0,
      transactions: [],
      isLoading: false,
      error: null,

      createWallet: () => {
        const keypair = generateWallet();
        set({
          keypair,
          publicKey: keypair.publicKey.toBase58(),
          balance: 0,
          transactions: [],
          error: null,
        });
      },

      importWalletFromKey: (privateKey: string) => {
        try {
          const keypair = importWallet(privateKey);
          set({
            keypair,
            publicKey: keypair.publicKey.toBase58(),
            balance: 0,
            transactions: [],
            error: null,
          });
          get().refreshBalance();
        } catch (err) {
          set({ error: 'Invalid private key' });
        }
      },

      exportKey: () => {
        const { keypair } = get();
        if (!keypair) return null;
        return exportPrivateKey(keypair);
      },

      disconnect: () => {
        set({
          keypair: null,
          publicKey: null,
          balance: 0,
          transactions: [],
          error: null,
        });
      },

      refreshBalance: async () => {
        const { keypair } = get();
        if (!keypair) return;

        set({ isLoading: true });
        try {
          const balance = await getBalance(keypair.publicKey);
          set({ balance, isLoading: false });
        } catch (err) {
          set({ 
            error: 'Failed to fetch balance', 
            isLoading: false 
          });
        }
      },

      requestAirdrop: async (amount = 1) => {
        const { keypair } = get();
        if (!keypair) throw new Error('No wallet connected');

        set({ isLoading: true, error: null });
        try {
          const signature = await requestAirdrop(keypair.publicKey, amount);
          await get().refreshBalance();
          return signature;
        } catch (err: any) {
          const errorMsg = err.message?.includes('429') 
            ? 'Rate limited. Please wait a moment and try again.'
            : 'Airdrop failed. Try again later.';
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      },

      sendTransaction: async (to: string, amount: number) => {
        const { keypair } = get();
        if (!keypair) throw new Error('No wallet connected');

        set({ isLoading: true, error: null });
        try {
          const toPublicKey = new PublicKey(to);
          const signature = await sendSol(keypair, toPublicKey, amount);
          await get().refreshBalance();
          await get().fetchTransactions();
          return signature;
        } catch (err: any) {
          const errorMsg = err.message || 'Transaction failed';
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      },

      fetchTransactions: async () => {
        const { keypair } = get();
        if (!keypair) return;

        try {
          const txs = await getTransactions(keypair.publicKey);
          set({ 
            transactions: txs.map(tx => ({
              signature: tx.signature,
              blockTime: tx.blockTime,
              slot: tx.slot,
              err: tx.err,
            }))
          });
        } catch (err) {
          console.error('Failed to fetch transactions:', err);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'fakesol-wallet',
      partialize: (state) => ({
        // Only persist the private key (serialized)
        _privateKey: serializeKeypair(state.keypair),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        
        // Rehydrate keypair from stored private key
        const storedState = state as any;
        if (storedState._privateKey) {
          const keypair = deserializeKeypair(storedState._privateKey);
          if (keypair) {
            state.keypair = keypair;
            state.publicKey = keypair.publicKey.toBase58();
            // Fetch balance after rehydration
            setTimeout(() => {
              state.refreshBalance();
              state.fetchTransactions();
            }, 100);
          }
        }
      },
    }
  )
);
