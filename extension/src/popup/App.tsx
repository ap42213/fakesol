import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { Activity } from './pages/Activity';
import { Settings } from './pages/Settings';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function ImportWallet() {
  const { importWallet } = useWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await importWallet(privateKey);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[360px] h-[600px] bg-[#09090b] flex flex-col text-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img src="/icons/icon128.png" alt="FakeSOL" className="w-16 h-16 rounded-2xl shadow-xl shadow-purple-500/20" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to FakeSOL</h1>
          <p className="text-zinc-400 text-sm">The devnet-only Solana wallet for testing.</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 ml-1">PRIVATE KEY</label>
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Paste your private key here..."
              className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            variant="primary"
            loading={loading}
            disabled={!privateKey.trim()}
            className="h-12 text-base shadow-lg shadow-purple-500/20"
          >
            Import Wallet
          </Button>
        </form>

        <p className="text-xs text-zinc-500 text-center">
          Don't have a wallet?{' '}
          <a href="https://fakesol.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { hasWallet, loading } = useWallet();

  if (loading) {
    return (
      <div className="w-[360px] h-[600px] bg-[#09090b] flex items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  if (!hasWallet) {
    return <ImportWallet />;
  }

  return (
    <MemoryRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/send" element={<Send />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </MemoryRouter>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
