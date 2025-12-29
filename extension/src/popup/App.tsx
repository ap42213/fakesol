import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { FaWallet, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';

// Devnet connection
const connection = new Connection('https://api.devnet.solana.com');

export default function App() {
  const [hasWallet, setHasWallet] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // Validate key
      const secretKey = bs58.decode(privateKey);
      if (secretKey.length !== 64) throw new Error('Invalid secret key length');
      
      const keypair = Keypair.fromSecretKey(secretKey);
      
      // Save to storage
      await chrome.storage.local.set({ 
        fakesol_secret_key: privateKey,
        fakesol_public_key: keypair.publicKey.toString()
      });

      setPublicKey(keypair.publicKey.toString());
      setHasWallet(true);
      fetchBalance(keypair.publicKey);
    } catch (err) {
      setError('Invalid private key. Please copy it from the FakeSOL web app.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await chrome.storage.local.remove(['fakesol_secret_key', 'fakesol_public_key']);
    setHasWallet(false);
    setPrivateKey('');
    setBalance(null);
  };

  if (!hasWallet) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6">
            <FaWallet className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to FakeSOL</h1>
          <p className="text-text-muted mb-8">Import your devnet wallet to get started</p>

          <form onSubmit={handleImport} className="w-full space-y-4">
            <div>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Paste Private Key (Base58)"
                className="input-field"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit" 
              disabled={!privateKey || loading}
              className="btn-primary w-full"
            >
              {loading ? 'Importing...' : 'Import Wallet'}
            </button>
          </form>
        </div>
        <div className="text-center text-xs text-text-muted mt-4">
          Don't have a wallet? <a href="https://fakesol.com" target="_blank" className="text-primary hover:underline">Create one</a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-background-lighter">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">F</span>
          </div>
          <span className="font-bold">FakeSOL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-medium">
            Devnet
          </div>
          <button onClick={handleLogout} className="text-text-muted hover:text-white text-xs">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col items-center">
        <div className="text-center mb-8">
          <p className="text-text-muted text-sm mb-1">Total Balance</p>
          <h2 className="text-4xl font-bold text-white">
            {balance !== null ? balance.toFixed(4) : '...'} <span className="text-lg text-text-muted">SOL</span>
          </h2>
        </div>

        <div className="w-full bg-background-card rounded-xl p-4 mb-6 border border-white/5">
          <p className="text-xs text-text-muted mb-2">Wallet Address</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm text-primary truncate">
              {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
            </code>
            <div className="flex gap-2">
              <button 
                onClick={() => navigator.clipboard.writeText(publicKey)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-muted hover:text-white"
                title="Copy Address"
              >
                <FaCopy />
              </button>
              <a 
                href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-muted hover:text-white"
                title="View on Explorer"
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button className="btn-primary flex items-center justify-center gap-2">
            Receive
          </button>
          <button className="bg-background-card hover:bg-white/10 text-white font-medium py-2 px-4 rounded-xl transition-colors border border-white/10">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
