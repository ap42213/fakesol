import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icons, Badge, useToast } from '../components/ui/index';

export function Receive() {
  const { publicKey } = useWalletStore();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    showToast('Address copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate a simple visual pattern based on address
  const generatePattern = () => {
    if (!publicKey) return [];
    const patterns = [];
    for (let i = 0; i < 64; i++) {
      const charCode = publicKey.charCodeAt(i % publicKey.length);
      patterns.push({
        filled: charCode % 3 !== 0,
        color: charCode % 2 === 0 ? 'bg-purple-500' : 'bg-green-400',
      });
    }
    return patterns;
  };

  const pattern = generatePattern();

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Receive SOL</h1>
        <p className="text-zinc-500">Share your address to receive devnet SOL</p>
      </div>

      {/* QR/Address Display */}
      <Card variant="gradient" padding="lg" className="text-center">
        {/* Visual Pattern (QR-like) */}
        <div className="inline-block p-4 bg-white rounded-2xl mb-6 shadow-2xl">
          <div className="grid grid-cols-8 gap-1 w-40 h-40">
            {pattern.map((p, i) => (
              <div
                key={i}
                className={`rounded-sm ${p.filled ? 'bg-zinc-900' : 'bg-white'}`}
              />
            ))}
          </div>
        </div>

        {/* Address Display */}
        <div className="space-y-4">
          <div>
            <p className="text-zinc-400 text-sm mb-2">Your Wallet Address</p>
            <div className="bg-zinc-800/80 rounded-xl p-4 font-mono text-sm text-white break-all">
              {publicKey}
            </div>
          </div>

          <Button
            size="lg"
            fullWidth
            onClick={handleCopy}
            icon={copied ? Icons.check : Icons.copy}
          >
            {copied ? 'Copied!' : 'Copy Address'}
          </Button>
        </div>
      </Card>

      {/* Share Options */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card variant="interactive" padding="md" className="text-center h-full">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              {Icons.external}
            </div>
            <p className="font-medium text-white text-sm">View on Explorer</p>
          </Card>
        </a>
        
        <Card 
          variant="interactive" 
          padding="md" 
          className="text-center cursor-pointer"
          onClick={handleCopy}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
            {Icons.copy}
          </div>
          <p className="font-medium text-white text-sm">Copy Address</p>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        <Card variant="glass" padding="md">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-medium">Devnet Only</p>
                <Badge variant="warning">Test Network</Badge>
              </div>
              <p className="text-zinc-500 text-sm">
                This address only works on Solana Devnet. Do not send mainnet SOL to this address - it will be lost.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="md">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 flex-shrink-0">
              {Icons.droplet}
            </div>
            <div>
              <p className="text-white font-medium mb-1">Need test SOL?</p>
              <p className="text-zinc-500 text-sm">
                Use the airdrop feature on the Dashboard to get free devnet SOL for testing your applications.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
