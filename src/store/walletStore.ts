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

export interface SavedWallet {
  id: string;
  name: string;
  publicKey: string;
  privateKey: string;
  createdAt: number;
}

interface WalletState {
  // Multi-wallet storage
  wallets: SavedWallet[];
  activeWalletId: string | null;
  
  // Current active wallet
  keypair: Keypair | null;
  publicKey: string | null;
  balance: number;
  transactions: Transaction[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Multi-wallet actions
  createWallet: (name?: string) => SavedWallet;
  importWalletFromKey: (privateKey: string, name?: string) => void;
  switchWallet: (walletId: string) => void;
  renameWallet: (walletId: string, newName: string) => void;
  deleteWallet: (walletId: string) => void;
  getWalletById: (walletId: string) => SavedWallet | undefined;
  
  // Current wallet actions
  exportKey: () => string | null;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  requestAirdrop: (amount?: number) => Promise<string>;
  sendTransaction: (to: string, amount: number) => Promise<string>;
  fetchTransactions: () => Promise<void>;
  clearError: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateWalletName = (index: number) => `Wallet ${index + 1}`;

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      activeWalletId: null,
      keypair: null,
      publicKey: null,
      balance: 0,
      transactions: [],
      isLoading: false,
      error: null,

      createWallet: (name?: string) => {
        const { wallets } = get();
        const keypair = generateWallet();
        const walletName = name || generateWalletName(wallets.length);
        
        const newWallet: SavedWallet = {
          id: generateId(),
          name: walletName,
          publicKey: keypair.publicKey.toBase58(),
          privateKey: exportPrivateKey(keypair),
          createdAt: Date.now(),
        };
        
        set({
          wallets: [...wallets, newWallet],
          activeWalletId: newWallet.id,
          keypair,
          publicKey: keypair.publicKey.toBase58(),
          balance: 0,
          transactions: [],
          error: null,
        });
        
        return newWallet;
      },

      importWalletFromKey: (privateKey: string, name?: string) => {
        try {
          const { wallets } = get();
          const keypair = importWallet(privateKey);
          const publicKey = keypair.publicKey.toBase58();
          
          const existing = wallets.find(w => w.publicKey === publicKey);
          if (existing) {
            get().switchWallet(existing.id);
            return;
          }
          
          const walletName = name || generateWalletName(wallets.length);
          
          const newWallet: SavedWallet = {
            id: generateId(),
            name: walletName,
            publicKey,
            privateKey: exportPrivateKey(keypair),
            createdAt: Date.now(),
          };
          
          set({
            wallets: [...wallets, newWallet],
            activeWalletId: newWallet.id,
            keypair,
            publicKey,
            balance: 0,
            transactions: [],
            error: null,
          });
          
          get().refreshBalance();
        } catch (err) {
          set({ error: 'Invalid private key' });
        }
      },

      switchWallet: (walletId: string) => {
        const { wallets } = get();
        const wallet = wallets.find(w => w.id === walletId);
        
        if (!wallet) {
          set({ error: 'Wallet not found' });
          return;
        }
        
        try {
          const keypair = importWallet(wallet.privateKey);
          set({
            activeWalletId: walletId,
            keypair,
            publicKey: wallet.publicKey,
            balance: 0,
            transactions: [],
            error: null,
          });
          
          get().refreshBalance();
          get().fetchTransactions();
        } catch (err) {
          set({ error: 'Failed to switch wallet' });
        }
      },

      renameWallet: (walletId: string, newName: string) => {
        const { wallets } = get();
        set({
          wallets: wallets.map(w => 
            w.id === walletId ? { ...w, name: newName.trim() || w.name } : w
          ),
        });
      },

      deleteWallet: (walletId: string) => {
        const { wallets, activeWalletId } = get();
        const newWallets = wallets.filter(w => w.id !== walletId);
        
        set({ wallets: newWallets });
        
        if (activeWalletId === walletId) {
          if (newWallets.length > 0) {
            get().switchWallet(newWallets[0].id);
          } else {
            set({
              activeWalletId: null,
              keypair: null,
              publicKey: null,
              balance: 0,
              transactions: [],
            });
          }
        }
      },

      getWalletById: (walletId: string) => {
        return get().wallets.find(w => w.id === walletId);
      },

      exportKey: () => {
        const { keypair } = get();
        if (!keypair) return null;
        return exportPrivateKey(keypair);
      },

      disconnect: () => {
        set({
          wallets: [],
          activeWalletId: null,
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
          set({ error: 'Failed to fetch balance', isLoading: false });
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
      name: 'fakesol-wallets',
      partialize: (state) => ({
        wallets: state.wallets,
        activeWalletId: state.activeWalletId,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        
        if (state.activeWalletId && state.wallets.length > 0) {
          const activeWallet = state.wallets.find(w => w.id === state.activeWalletId);
          if (activeWallet) {
            try {
              const keypair = importWallet(activeWallet.privateKey);
              state.keypair = keypair;
              state.publicKey = activeWallet.publicKey;
              
              setTimeout(() => {
                state.refreshBalance();
                state.fetchTransactions();
              }, 100);
            } catch (err) {
              console.error('Failed to rehydrate wallet:', err);
            }
          }
        }
      },
    }
  )
);
