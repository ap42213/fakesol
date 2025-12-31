import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icons, Badge, Modal, useToast } from '../components/ui/index';
import { Logo } from '../components/Logo';

export function Settings() {
  const { publicKey, balance, exportKey, disconnect } = useWalletStore();
  const { showToast } = useToast();
  
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleShowPrivateKey = () => {
    const key = exportKey();
    setPrivateKey(key);
    setShowPrivateKey(true);
  };

  const handleCopyPrivateKey = async () => {
    if (!privateKey) return;
    await navigator.clipboard.writeText(privateKey);
    showToast('Private key copied!', 'success');
  };

  const handleDisconnect = () => {
    disconnect();
    window.location.href = '/';
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500">Manage your wallet and preferences</p>
      </div>

      {/* Wallet Overview */}
      <Card variant="gradient" padding="lg">
        <div className="flex items-center gap-4">
          <Logo size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-white">Devnet Wallet</p>
              <Badge variant="purple">Connected</Badge>
            </div>
            <p className="text-sm text-zinc-400 font-mono truncate">{publicKey}</p>
            <p className="text-sm text-zinc-500 mt-1">{balance.toFixed(4)} SOL</p>
          </div>
        </div>
      </Card>

      {/* Network Info */}
      <Card variant="glass" padding="md">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Network</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full status-dot" />
            </div>
            <div>
              <p className="text-white font-medium">Solana Devnet</p>
              <p className="text-xs text-zinc-500">https://api.devnet.solana.com</p>
            </div>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </Card>

      {/* Security Section */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Security</h3>
        <Card variant="glass" padding="none">
          {/* Export Private Key */}
          <button
            onClick={handleShowPrivateKey}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                {Icons.key}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Export Private Key</p>
                <p className="text-xs text-zinc-500">Reveal your wallet's private key</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="border-t border-zinc-800" />

          {/* View on Explorer */}
          <a
            href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors rounded-b-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                {Icons.external}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">View on Explorer</p>
                <p className="text-xs text-zinc-500">Open in Solana Explorer</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </Card>
      </div>

      {/* Resources */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Resources</h3>
        <Card variant="glass" padding="none">
          <a
            href="https://solfaucet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                {Icons.droplet}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Sol Faucet</p>
                <p className="text-xs text-zinc-500">Alternative devnet faucet</p>
              </div>
            </div>
            {Icons.external}
          </a>

          <div className="border-t border-zinc-800" />

          <a
            href="https://solana.com/developers"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors rounded-b-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Logo size="sm" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Solana Docs</p>
                <p className="text-xs text-zinc-500">Developer documentation</p>
              </div>
            </div>
            {Icons.external}
          </a>
        </Card>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
        <Card variant="glass" padding="md" className="border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Disconnect Wallet</p>
              <p className="text-xs text-zinc-500">Remove wallet from this browser</p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDisconnectModal(true)}
              icon={Icons.logout}
            >
              Disconnect
            </Button>
          </div>
        </Card>
      </div>

      {/* Version */}
      <div className="text-center space-y-2">
        <p className="text-zinc-600 text-sm">FakeSOL v0.1.0</p>
        <p className="text-zinc-700 text-xs">Built for developers</p>
        <a 
          href="mailto:hello@fakesol.com" 
          className="text-zinc-500 hover:text-purple-400 text-xs transition-colors"
        >
          Contact: hello@fakesol.com
        </a>
      </div>

      {/* Private Key Modal */}
      <Modal
        isOpen={showPrivateKey}
        onClose={() => {
          setShowPrivateKey(false);
          setPrivateKey(null);
        }}
        title="Private Key"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">
              ⚠️ Never share your private key with anyone. Anyone with this key has full access to your wallet.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-4">
            <p className="font-mono text-xs text-zinc-300 break-all select-all">
              {privateKey}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowPrivateKey(false);
                setPrivateKey(null);
              }}
            >
              Close
            </Button>
            <Button
              fullWidth
              onClick={handleCopyPrivateKey}
              icon={Icons.copy}
            >
              Copy Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="Disconnect Wallet"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-400">
              ⚠️ Make sure you have exported your private key before disconnecting. You will need it to restore your wallet.
            </p>
          </div>

          <p className="text-zinc-400 text-sm">
            This will remove your wallet from this browser. You can restore it later using your private key.
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDisconnectModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
