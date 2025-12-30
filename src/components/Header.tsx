import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { shortenAddress } from '../lib/solana';
import { Icons, Badge, CopyButton } from './ui/index';
import { Button } from './ui/Button';
import { Logo } from './Logo';

export function Header() {
  const { publicKey, balance, refreshBalance, isLoading } = useWalletStore();
  const [showAddress, setShowAddress] = useState(false);

  return (
    <header className="h-16 border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between max-w-4xl mx-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <Logo size="md" />
          <span className="font-bold text-white">FakeSOL</span>
        </div>

        {/* Desktop - Page Title Area */}
        <div className="hidden lg:block">
          <Badge variant="purple">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            Solana Devnet
          </Badge>
        </div>

        {/* Right Side - Balance & Actions */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshBalance()}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            <span className={isLoading ? 'animate-spin' : ''}>{Icons.refresh}</span>
          </Button>

          {/* Balance Display */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
            <Logo size="xs" />
            <span className="font-semibold text-white">{balance.toFixed(2)}</span>
            <span className="text-zinc-400 text-sm">SOL</span>
          </div>

          {/* Address Button */}
          {publicKey && (
            <div className="relative">
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400" />
                <span className="font-mono text-sm text-zinc-300 hidden sm:block">
                  {shortenAddress(publicKey, 4)}
                </span>
                <svg className={`w-4 h-4 text-zinc-400 transition-transform ${showAddress ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {showAddress && (
                <div className="absolute right-0 mt-2 w-72 glass-card p-4 animate-fade-in">
                  <p className="text-xs text-zinc-500 mb-2">Wallet Address</p>
                  <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-3">
                    <p className="font-mono text-xs text-zinc-300 break-all flex-1">
                      {publicKey}
                    </p>
                    <CopyButton text={publicKey} />
                  </div>
                  <a
                    href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mt-3"
                  >
                    View on Explorer
                    {Icons.external}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
