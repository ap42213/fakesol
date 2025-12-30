import { useState } from 'react';
import { FiDownload, FiChrome, FiCheck, FiCopy } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';

export function Extension() {
  const [copied, setCopied] = useState(false);
  const { wallets } = useAuthStore();
  const { exportKey } = useWalletStore();

  // Get the first wallet's private key for easy copy
  const guestPrivateKey = exportKey();
  const activePrivateKey = wallets[0]?.privateKey || guestPrivateKey || '';

  const copyPrivateKey = () => {
    if (activePrivateKey) {
      navigator.clipboard.writeText(activePrivateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Download Extension',
      description: 'Click the button below to download the FakeSOL extension ZIP file.',
    },
    {
      number: 2,
      title: 'Extract the ZIP',
      description: 'Unzip the downloaded file to a folder on your computer.',
    },
    {
      number: 3,
      title: 'Open Chrome Extensions',
      description: 'Go to chrome://extensions in your browser and enable "Developer mode" (toggle in top right).',
    },
    {
      number: 4,
      title: 'Load the Extension',
      description: 'Click "Load unpacked" and select the extracted folder.',
    },
    {
      number: 5,
      title: 'Import Your Wallet',
      description: 'Click the FakeSOL icon in your toolbar and paste your private key.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
          <FiChrome className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Chrome Extension</h1>
        <p className="text-text-muted max-w-lg mx-auto">
          Use your FakeSOL wallet in any Solana dApp. Works just like Phantom, Backpack, or Solflare — but for devnet only.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔌</span>
          </div>
          <h3 className="font-semibold text-white mb-2">Connect to dApps</h3>
          <p className="text-sm text-text-muted">Works with any Solana dApp that supports wallet adapters</p>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✍️</span>
          </div>
          <h3 className="font-semibold text-white mb-2">Sign Transactions</h3>
          <p className="text-sm text-text-muted">Approve and sign transactions for your Solana programs</p>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h3 className="font-semibold text-white mb-2">Devnet Only</h3>
          <p className="text-sm text-text-muted">Safe testing environment — no risk of real funds</p>
        </div>
      </div>

      {/* Download Section */}
      <div className="glass-card p-8">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <FiDownload className="text-primary" />
          Download & Install
        </h2>

        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.description}</p>
                
                {step.number === 1 && (
                  <a
                    href="/fakesol-extension.zip"
                    download
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl transition-colors"
                  >
                    <FiDownload />
                    Download Extension (ZIP)
                  </a>
                )}
                
                {step.number === 3 && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('chrome://extensions');
                      alert('Copied "chrome://extensions" to clipboard!\n\nPaste it in your browser address bar to open the Extensions page.');
                    }}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-background-card hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                  >
                    <FiCopy />
                    Copy Extensions URL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Copy Private Key */}
      {activePrivateKey && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Import</h2>
          <p className="text-sm text-text-muted mb-4">
            Copy your private key to paste into the extension after installation:
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-background-card px-4 py-3 rounded-xl text-sm text-primary font-mono truncate border border-white/10">
              {activePrivateKey.slice(0, 8)}...{activePrivateKey.slice(-8)}
            </code>
            <button
              onClick={copyPrivateKey}
              className={`px-4 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                copied 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-primary hover:bg-primary-light text-white'
              }`}
            >
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
          <p className="text-xs text-yellow-500/80 mt-3">
            ⚠️ Never share your private key with anyone. This is for your extension only.
          </p>
        </div>
      )}

      {/* Help Link */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm text-text-muted">
          Need help? Check out our <a href="https://github.com/ap42213/fakesol" className="text-primary hover:underline">GitHub documentation</a>
        </p>
      </div>
    </div>
  );
}
