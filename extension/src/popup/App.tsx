import type React from 'react';
import { useEffect, useState } from 'react';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

// SPL Token program id (avoids extra dependency for TOKEN_PROGRAM_ID)
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// Support multiple RPC endpoints for better airdrop reliability
const RPC_ENDPOINTS = ((import.meta as any).env?.VITE_SOLANA_RPC_URLS as string | undefined)?.
  split(',')
  .map((url) => url.trim())
  .filter(Boolean) || ['https://api.devnet.solana.com'];

let rpcIndex = 0;
const getConnection = () => {
  const endpoint = RPC_ENDPOINTS[rpcIndex % RPC_ENDPOINTS.length];
  rpcIndex += 1;
  return new Connection(endpoint, 'confirmed');
};

type TokenHolding = {
  mint: string;
  uiAmount: number;
  decimals: number;
};

type TxItem = {
  signature: string;
  blockTime: number | null;
  err: any;
};

const formatTimeAgo = (timestamp?: number | null) => {
  if (!timestamp) return 'Pending...';
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const shorten = (text: string, chars = 4) =>
  text.length > chars * 2 ? `${text.slice(0, chars)}...${text.slice(-chars)}` : text;

function WalletLogo() {
  return (
    <img
      src="/icons/icon48.png"
      alt="FakeSOL"
      className="w-10 h-10 rounded-lg"
    />
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function App() {
  const [hasWallet, setHasWallet] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedSig, setCopiedSig] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenHolding[]>([]);
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [hideZero, setHideZero] = useState(true);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    checkWallet();
  }, []);

  const showToast = (message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 1800);
  };

  const checkWallet = async () => {
    const result = await chrome.storage.local.get(['fakesol_secret_key']);
    if (result.fakesol_secret_key) {
      try {
        const secretKey = bs58.decode(result.fakesol_secret_key);
        const keypair = Keypair.fromSecretKey(secretKey);
        setPublicKey(keypair.publicKey.toString());
        setHasWallet(true);
        fetchBalance(keypair.publicKey);
        fetchTokens(keypair.publicKey);
        fetchTransactions(keypair.publicKey);
      } catch (e) {
        console.error('Invalid stored key');
      }
    }
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
    setTokensLoading(true);
    setDataError('');
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
      const aggregated = holdings.reduce<Record<string, TokenHolding>>((acc, token) => {
        const existing = acc[token.mint];
        acc[token.mint] = existing
          ? { ...existing, uiAmount: existing.uiAmount + token.uiAmount }
          : token;
        return acc;
      }, {});
      setTokens(Object.values(aggregated));
    } catch (e) {
      console.error('Failed to fetch tokens', e);
      setDataError('Could not load tokens');
    } finally {
      setTokensLoading(false);
    }
  };

  const fetchTransactions = async (pubKey: PublicKey) => {
    setTxLoading(true);
    setDataError('');
    try {
      const conn = getConnection();
      const signatures = await conn.getSignaturesForAddress(pubKey, { limit: 8 });
      const mapped: TxItem[] = signatures.map((sig) => ({
        signature: sig.signature,
        blockTime: sig.blockTime ?? null,
        err: sig.err,
      }));
      setTxs(mapped);
    } catch (e) {
      console.error('Failed to fetch transactions', e);
      setDataError('Could not load recent activity');
    } finally {
      setTxLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      fetchBalance(keypair.publicKey);
      fetchTokens(keypair.publicKey);
      fetchTransactions(keypair.publicKey);
      showToast('Wallet imported');
    } catch (err) {
      setError('Invalid private key. Please copy it from fakesol.com');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    showToast('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySignature = async (sig: string) => {
    await navigator.clipboard.writeText(sig);
    setCopiedSig(sig);
    showToast('Signature copied');
    setTimeout(() => setCopiedSig((prev) => (prev === sig ? null : prev)), 1500);
  };

  const handleAirdrop = async () => {
    setAirdropping(true);
    const pubKey = new PublicKey(publicKey);

    const maxRetries = 5;
    let lastError: unknown;

    const describeError = (err: any) => {
      if (!err) return 'unknown error';
      if (typeof err === 'string') return err;
      if (err.message) return err.message;
      return JSON.stringify(err);
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const conn = getConnection();
      try {
        const signature = await conn.requestAirdrop(pubKey, 5 * LAMPORTS_PER_SOL);
        // Confirm directly on signature to avoid blockhash mismatch issues
        await conn.confirmTransaction(signature, 'confirmed');

        await fetchBalance(pubKey);
        await fetchTransactions(pubKey);
        showToast('Airdrop successful', 'success');
        setAirdropping(false);
        return;
      } catch (e) {
        lastError = e;
        const delayMs = 800 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const reason = describeError(lastError);
    console.error('Airdrop failed', lastError);
    showToast(reason.includes('429') || reason.toLowerCase().includes('rate') ? 'Airdrop rate limited, try again soon' : 'Airdrop failed', 'error');
    setAirdropping(false);
  };

  const handleLogout = async () => {
    await chrome.storage.local.remove(['fakesol_secret_key', 'fakesol_public_key']);
    setHasWallet(false);
    setPrivateKey('');
    setBalance(null);
    setPublicKey('');
    setTokens([]);
    setTxs([]);
  };

  const handleRefresh = () => {
    if (!publicKey) return;
    const pubKey = new PublicKey(publicKey);
    fetchBalance(pubKey);
    fetchTokens(pubKey);
    fetchTransactions(pubKey);
    showToast('Refreshed');
  };

  const truncatedAddress = publicKey ? shorten(publicKey, 4) : '';
  const filteredTokens = hideZero ? tokens.filter((t) => t.uiAmount > 0) : tokens;

  // Import Wallet View
  if (!hasWallet) {
    return (
      <div className="w-[360px] h-[500px] bg-[#09090b] flex flex-col text-white relative">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <WalletLogo />
            <span className="text-xs font-semibold px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">
              DEVNET ONLY
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Import Wallet</h2>
            <p className="text-sm text-zinc-400">Enter your private key to import your wallet</p>
          </div>

          <form onSubmit={handleImport} className="w-full space-y-4">
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter private key..."
              className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={!privateKey.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Importing...' : 'Import Wallet'}
            </button>
          </form>

          <p className="text-xs text-zinc-500">
            Don't have a wallet?{' '}
            <a href="https://fakesol.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
              Create one
            </a>
          </p>
        </div>

        {toast && (
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg text-sm shadow-lg ${
            toast.tone === 'success' ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  // Wallet View
  return (
    <div className="w-[360px] h-[500px] bg-[#09090b] flex flex-col text-white relative">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <WalletLogo />
          <span className="text-xs font-semibold px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">
            DEVNET ONLY
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button onClick={handleRefresh} className="px-3 py-1 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors">
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600/30 to-blue-600/20 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-300">Total Balance</p>
              <p className="text-3xl font-bold mt-1">{balance !== null ? balance.toFixed(3) : '...'}</p>
              <p className="text-xs text-zinc-400 mt-1">SOL · Devnet only</p>
            </div>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-zinc-800 rounded-lg hover:border-purple-500/40 transition-colors"
            >
              <span className="text-xs font-mono">{truncatedAddress}</span>
              {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4 text-zinc-400" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAirdrop}
            disabled={airdropping}
            className="p-3 rounded-xl bg-purple-600/30 border border-purple-500/30 hover:border-purple-400/60 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {airdropping ? 'Airdropping...' : 'Request 5 SOL'}
          </button>
          <a
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-center transition-colors"
            href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Explorer
          </a>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <span className="text-xs text-zinc-500">Last 8</span>
          </div>
          {txLoading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : txs.length === 0 ? (
            <p className="text-sm text-zinc-500">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {txs.map((tx) => (
                <div key={tx.signature} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    tx.err ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-200'
                  }`}>
                    {tx.err ? '✕' : '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-white truncate">{shorten(tx.signature, 6)}</p>
                    <p className="text-[11px] text-zinc-500">{formatTimeAgo(tx.blockTime)}</p>
                  </div>
                  <button
                    className="text-xs text-purple-400 hover:text-purple-300"
                    onClick={() => handleCopySignature(tx.signature)}
                  >
                    {copiedSig === tx.signature ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Tokens</h3>
            <label className="flex items-center gap-2 text-[11px] text-zinc-400">
              <input
                type="checkbox"
                className="accent-purple-500"
                checked={hideZero}
                onChange={(e) => setHideZero(e.target.checked)}
              />
              Hide zeroes
            </label>
          </div>
          {tokensLoading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : filteredTokens.length === 0 ? (
            <p className="text-sm text-zinc-500">No tokens found.</p>
          ) : (
            <div className="space-y-2">
              {filteredTokens.map((token) => (
                <div key={token.mint} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                  <div>
                    <p className="text-sm font-semibold">{shorten(token.mint, 4)}</p>
                    <p className="text-[11px] text-zinc-500">Mint</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{token.uiAmount.toFixed(4)}</p>
                    <p className="text-[11px] text-zinc-500">Decimals {token.decimals}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {dataError && <p className="text-xs text-red-400 mt-2">{dataError}</p>}
        </div>
      </div>

      <div className="p-3 border-t border-zinc-800 flex items-center justify-center gap-2 text-xs text-green-400">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>Solana Devnet</span>
      </div>

      {toast && (
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg text-sm shadow-lg ${
          toast.tone === 'success' ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
