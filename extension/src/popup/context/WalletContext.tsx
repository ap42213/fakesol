import React, { createContext, useContext, useEffect, useState } from 'react';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

// SPL Token program id
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const RPC_ENDPOINTS = ((import.meta as any).env?.VITE_SOLANA_RPC_URLS as string | undefined)?.
  split(',')
  .map((url) => url.trim())
  .filter(Boolean) || ['https://api.devnet.solana.com'];

let rpcIndex = 0;
export const getConnection = () => {
  const endpoint = RPC_ENDPOINTS[rpcIndex % RPC_ENDPOINTS.length];
  rpcIndex += 1;
  return new Connection(endpoint, 'confirmed');
};

export type TokenHolding = {
  mint: string;
  uiAmount: number;
  decimals: number;
};

export type TxItem = {
  signature: string;
  blockTime: number | null;
  err: any;
};

interface WalletContextType {
  hasWallet: boolean;
  publicKey: string | null;
  balance: number | null;
  tokens: TokenHolding[];
  transactions: TxItem[];
  loading: boolean;
  error: string | null;
  importWallet: (privateKey: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  requestAirdrop: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [hasWallet, setHasWallet] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenHolding[]>([]);
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    try {
      const result = await chrome.storage.local.get(['fakesol_secret_key']);
      if (result.fakesol_secret_key) {
        const secretKey = bs58.decode(result.fakesol_secret_key);
        const keypair = Keypair.fromSecretKey(secretKey);
        setPublicKey(keypair.publicKey.toString());
        setHasWallet(true);
        refreshData(keypair.publicKey);
      }
    } catch (e: any) {
      console.error('Error checking wallet:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async (pubKey: PublicKey) => {
    fetchBalance(pubKey);
    fetchTokens(pubKey);
    fetchTransactions(pubKey);
  };

  const fetchBalance = async (pubKey: PublicKey) => {
    try {
      const conn = getConnection();
      const bal = await conn.getBalance(pubKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (e) {
      console.error('Failed to fetch balance', e);
    }
  };

  const fetchTokens = async (pubKey: PublicKey) => {
    try {
      const conn = getConnection();
      const resp = await conn.getParsedTokenAccountsByOwner(pubKey, { programId: TOKEN_PROGRAM_ID });
      const holdings: TokenHolding[] = resp.value.map(({ account }) => {
        const info: any = account.data.parsed.info;
        const decimals = Number(info.tokenAmount.decimals) || 0;
        const uiAmount =
          typeof info.tokenAmount.uiAmount === 'number'
            ? info.tokenAmount.uiAmount
            : Number(info.tokenAmount.amount) / Math.pow(10, decimals);
        return {
          mint: info.mint,
          uiAmount,
          decimals,
        };
      });
      // Aggregate and set tokens... (simplified for brevity)
      setTokens(holdings);
    } catch (e) {
      console.error('Failed to fetch tokens', e);
    }
  };

  const fetchTransactions = async (pubKey: PublicKey) => {
    try {
      const conn = getConnection();
      const signatures = await conn.getSignaturesForAddress(pubKey, { limit: 10 });
      const mapped: TxItem[] = signatures.map((sig) => ({
        signature: sig.signature,
        blockTime: sig.blockTime ?? null,
        err: sig.err,
      }));
      setTransactions(mapped);
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    }
  };

  const importWallet = async (privateKey: string) => {
    try {
      const secretKey = bs58.decode(privateKey);
      if (secretKey.length !== 64) throw new Error('Invalid secret key length');

      const keypair = Keypair.fromSecretKey(secretKey);

      await chrome.storage.local.set({
        fakesol_secret_key: privateKey,
        fakesol_public_key: keypair.publicKey.toString(),
      });

      setPublicKey(keypair.publicKey.toString());
      setHasWallet(true);
      refreshData(keypair.publicKey);
    } catch (err: any) {
      throw new Error(err.message || 'Invalid private key');
    }
  };

  const logout = async () => {
    await chrome.storage.local.remove(['fakesol_secret_key', 'fakesol_public_key']);
    setHasWallet(false);
    setPublicKey(null);
    setBalance(null);
    setTokens([]);
    setTransactions([]);
  };

  const refresh = async () => {
    if (publicKey) {
      await refreshData(new PublicKey(publicKey));
    }
  };

  const requestAirdrop = async () => {
    if (!publicKey) return;
    const pubKey = new PublicKey(publicKey);
    const conn = getConnection();
    const signature = await conn.requestAirdrop(pubKey, 5 * LAMPORTS_PER_SOL);
    await conn.confirmTransaction(signature, 'confirmed');
    await refresh();
  };

  return (
    <WalletContext.Provider
      value={{
        hasWallet,
        publicKey,
        balance,
        tokens,
        transactions,
        loading,
        error,
        importWallet,
        logout,
        refresh,
        requestAirdrop,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
