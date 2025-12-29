import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Icons, Badge } from '../components/ui/index';

export function Welcome() {
  const [mode, setMode] = useState<'home' | 'import'>('home');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  
  const { createWallet, importWalletFromKey } = useWalletStore();

  const handleCreate = () => {
    createWallet();
  };

  const handleImport = () => {
    if (!privateKey.trim()) {
      setError('Please enter a private key');
      return;
    }
    try {
      importWalletFromKey(privateKey.trim());
    } catch {
      setError('Invalid private key format');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-green-500/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {mode === 'home' ? (
          <>
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-green-400 mb-6 shadow-2xl shadow-purple-500/30">
                <span className="text-white text-3xl">{Icons.solana}</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white mb-2">FakeSOL</h1>
              <p className="text-zinc-400 text-lg">
                The devnet-only Solana wallet
              </p>
              <p className="text-sm mt-2">
                <span className="gradient-text font-semibold">Real testing. Fake SOL.</span>
              </p>
            </div>

            {/* Warning Card */}
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">Devnet Only</h3>
                    <Badge variant="warning">Test Network</Badge>
                  </div>
                  <p className="text-sm text-zinc-400">
                    This wallet only works on Solana Devnet. Perfect for testing dApps without risking real funds.
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="xl"
                fullWidth
                onClick={handleCreate}
                icon={Icons.plus}
              >
                Create New Wallet
              </Button>
              
              <Button
                variant="secondary"
                size="xl"
                fullWidth
                onClick={() => setMode('import')}
                icon={Icons.key}
              >
                Import Existing Wallet
              </Button>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '🚰', label: 'Free Airdrop' },
                { icon: '🔒', label: 'Secure' },
                { icon: '⚡', label: 'Fast' },
              ].map((feature) => (
                <div key={feature.label} className="p-3">
                  <span className="text-2xl mb-2 block">{feature.icon}</span>
                  <span className="text-xs text-zinc-500">{feature.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Import Mode */}
            <button 
              onClick={() => {
                setMode('home');
                setPrivateKey('');
                setError('');
              }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 mb-4">
                {Icons.key}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Import Wallet</h2>
              <p className="text-zinc-400">Enter your private key to restore your wallet</p>
            </div>

            <Card variant="glass" className="mb-6">
              <Input
                label="Private Key (Base58)"
                placeholder="Enter your private key..."
                value={privateKey}
                onChange={(e) => {
                  setPrivateKey(e.target.value);
                  setError('');
                }}
                error={error}
                type="password"
                leftIcon={Icons.key}
              />
              
              <div className="mt-4 p-3 bg-yellow-500/10 rounded-xl">
                <p className="text-xs text-yellow-400">
                  ⚠️ Never share your private key with anyone. We never store your keys on our servers.
                </p>
              </div>
            </Card>

            <Button
              size="xl"
              fullWidth
              onClick={handleImport}
            >
              Import Wallet
            </Button>
          </>
        )}

        <p className="text-center text-zinc-600 text-xs mt-8">
          Built for developers • Open source
        </p>
      </div>
    </div>
  );
}
