import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Devnet connection
const connection = new Connection('https://api.devnet.solana.com');

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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"/>
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

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    const result = await chrome.storage.local.get(['fakesol_secret_key']);
    if (result.fakesol_secret_key) {
      try {
        const secretKey = bs58.decode(result.fakesol_secret_key);
        const keypair = Keypair.fromSecretKey(secretKey);
        setPublicKey(keypair.publicKey.toString());
        setHasWallet(true);
        fetchBalance(keypair.publicKey);
      } catch (e) {
        console.error('Invalid stored key');
      }
    }
  };

  const fetchBalance = async (pubKey: PublicKey) => {
    try {
      const bal = await connection.getBalance(pubKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (e) {
      console.error('Failed to fetch balance', e);
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
        fakesol_public_key: keypair.publicKey.toString()
      });

      setPublicKey(keypair.publicKey.toString());
      setHasWallet(true);
      fetchBalance(keypair.publicKey);
    } catch (err) {
      setError('Invalid private key. Please copy it from fakesol.com');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    setAirdropping(true);
    try {
      const pubKey = new PublicKey(publicKey);
      const signature = await connection.requestAirdrop(pubKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      await fetchBalance(pubKey);
    } catch (e) {
      console.error('Airdrop failed', e);
    } finally {
      setAirdropping(false);
    }
  };

  const handleLogout = async () => {
    await chrome.storage.local.remove(['fakesol_secret_key', 'fakesol_public_key']);
    setHasWallet(false);
    setPrivateKey('');
    setBalance(null);
    setPublicKey('');
  };

  const truncatedAddress = publicKey 
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` 
    : '';

  // Import Wallet View
  if (!hasWallet) {
    return (
      <div className="w-[360px] h-[500px] bg-[#09090b] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <WalletLogo />
            <span className="text-xs font-semibold px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">
              DEVNET ONLY
            </span>
          </div>
        </div>

        {/* Import Wallet Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Import Wallet</h2>
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
      </div>
    );
  }

  // Wallet View
  return (
    <div className="w-[360px] h-[500px] bg-[#09090b] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <WalletLogo />
          <span className="text-xs font-semibold px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">
            DEVNET ONLY
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Wallet Info */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Balance */}
        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-2">Total Balance</p>
          <p className="text-5xl font-bold text-white">
            {balance !== null ? balance.toFixed(2) : '...'}
          </p>
          <p className="text-lg text-zinc-400 mt-1">SOL</p>
        </div>

        {/* Wallet Address */}
        <button
          onClick={handleCopyAddress}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <span className="text-sm text-zinc-300 font-mono">{truncatedAddress}</span>
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <CopyIcon className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {/* Action Buttons */}
        <div className="w-full flex gap-3">
          <button
            onClick={handleAirdrop}
            disabled={airdropping}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium h-12 rounded-lg disabled:opacity-50 transition-colors"
          >
            {airdropping ? 'Airdropping...' : 'Airdrop'}
          </button>
          <button
            onClick={handleCopyAddress}
            className="flex-1 border border-zinc-700 text-white hover:bg-zinc-800 font-medium h-12 rounded-lg bg-transparent transition-colors"
          >
            Copy Address
          </button>
        </div>

        {/* Explorer Link */}
        <a
          href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-purple-400 hover:underline"
        >
          View on Explorer →
        </a>
      </div>

      {/* Network Indicator */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-500 font-medium">Solana Devnet</span>
        </div>
      </div>
    </div>
  );
}
