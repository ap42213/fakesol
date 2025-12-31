import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Icons, Badge, Modal } from '../components/ui/index';
import { Logo } from '../components/Logo';
import { SEO } from '../components/SEO';
import { FiLogIn, FiUserPlus, FiGithub } from 'react-icons/fi';

export function Welcome() {
  const [mode, setMode] = useState<'home' | 'import'>('home');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [newWalletKey, setNewWalletKey] = useState<string | null>(null);
  const [backedUp, setBackedUp] = useState(false);
  
  const { createWallet, importWalletFromKey } = useWalletStore();

  const handleCreate = () => {
    createWallet();
    // Get the private key immediately after creation
    setTimeout(() => {
      const key = useWalletStore.getState().exportKey();
      if (key) {
        setNewWalletKey(key);
        setShowBackupModal(true);
      }
    }, 100);
  };

  const handleCopyKey = async () => {
    if (newWalletKey) {
      await navigator.clipboard.writeText(newWalletKey);
      setBackedUp(true);
    }
  };

  const handleCloseBackupModal = () => {
    setShowBackupModal(false);
    setNewWalletKey(null);
    setBackedUp(false);
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
      <SEO 
        title="FakeSOL - Devnet Wallet" 
        description="The devnet-only Solana wallet for developers. Real testing. Fake SOL. Safe environment for testing dApps."
        canonical="https://fakesol.com/"
      />
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
              <div className="inline-flex items-center justify-center mb-6">
                <Logo size="xl" />
              </div>
              <h1 className="text-4xl font-extrabold text-white mb-2">FakeSOL</h1>
              <p className="text-zinc-400 text-lg">
                The devnet-only Solana wallet
              </p>
              <p className="text-sm mt-2">
                <span className="gradient-text font-semibold">Real testing. Fake SOL.</span>
              </p>
              
              <div className="mt-6 flex justify-center">
                <a 
                  href="https://github.com/ap42213/fakesol" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm group"
                >
                  <FiGithub className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Star on GitHub</span>
                </a>
              </div>
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
              {/* Auth Options */}
              <div className="flex gap-3 mb-2">
                <Link to="/login" className="flex-1">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    <FiLogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                  >
                    <FiUserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-zinc-950 text-zinc-500">or continue without account</span>
                </div>
              </div>

              <Button
                size="xl"
                fullWidth
                onClick={handleCreate}
                icon={Icons.plus}
                variant="ghost"
              >
                Create Guest Wallet
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => setMode('import')}
                icon={Icons.key}
              >
                Import Existing Wallet
              </Button>
            </div>

            {/* Benefits of signing up */}
            <Card variant="glass" className="mt-6 p-4">
              <p className="text-xs text-zinc-400 text-center mb-3">
                ✨ Benefits of creating an account:
              </p>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Access wallets from any device
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> No need to save private keys
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Manage multiple wallets easily
                </li>
              </ul>
            </Card>
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

        <div className="mt-8 text-center space-y-4">
          <p className="text-zinc-600 text-xs">
            Built for developers • Open source
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
             <a href="https://x.com/FakeSolWallet" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">X (Twitter)</a>
             <span>•</span>
             <a href="mailto:hello@fakesol.com" className="hover:text-zinc-300 transition-colors">Contact</a>
          </div>
          <div className="text-[10px] text-zinc-600 space-y-1">
            <p>Treasury (Devnet Only): DfvJb314rHHa2Xe7aGZfhTtXDdh4GYSHcQaBLNEgtMK</p>
            <p>Donate (Real SOL): FfD6D7PqWxPgJyDG4wcwGkzubqUg6wDE8jhfjJxC7MQv</p>
          </div>
        </div>
      </div>

      {/* Backup Modal */}
      <Modal
        isOpen={showBackupModal}
        onClose={() => {}}
        title="🔐 Backup Your Wallet"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 font-medium">
              ⚠️ Important: Save your private key NOW
            </p>
            <p className="text-xs text-red-400/80 mt-1">
              This is the ONLY way to recover your wallet. We cannot recover it for you.
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-400 mb-2">Your Private Key:</p>
            <div className="bg-zinc-800 rounded-xl p-4 relative">
              <p className="font-mono text-xs text-zinc-300 break-all pr-10 select-all">
                {newWalletKey}
              </p>
              <button
                onClick={handleCopyKey}
                className="absolute top-3 right-3 p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              >
                {backedUp ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-800/50 rounded-xl">
            <p className="text-xs text-zinc-400">
              💡 <strong>Tip:</strong> Store this in a password manager or write it down and keep it safe.
            </p>
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleCloseBackupModal}
            disabled={!backedUp}
            variant={backedUp ? 'primary' : 'secondary'}
          >
            {backedUp ? "I've Saved My Key - Continue" : 'Copy Key First to Continue'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
