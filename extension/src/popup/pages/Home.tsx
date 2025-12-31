import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/icons';

export function Home() {
  const { balance, publicKey, requestAirdrop, refresh } = useWallet();
  const [airdropping, setAirdropping] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAirdrop = async () => {
    setAirdropping(true);
    try {
      await requestAirdrop();
    } catch (e) {
      console.error(e);
    } finally {
      setAirdropping(false);
    }
  };

  const shorten = (str: string) => str.slice(0, 4) + '...' + str.slice(-4);

  return (
    <div className="p-4 space-y-4">
      {/* Balance Card */}
      <Card variant="gradient" className="p-6 text-center space-y-2 border-purple-500/20">
        <div className="text-sm text-zinc-400">Total Balance</div>
        <div className="text-4xl font-bold text-white">
          {balance !== null ? balance.toFixed(3) : '...'} <span className="text-lg text-zinc-500">SOL</span>
        </div>
        
        <div className="flex justify-center pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full text-xs text-zinc-300 hover:bg-black/60 transition-colors"
          >
            {publicKey ? shorten(publicKey) : '...'}
            {copied ? <span className="text-green-400">{Icons.check}</span> : Icons.copy}
          </button>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          className="h-12 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30"
          onClick={handleAirdrop}
          disabled={airdropping}
        >
          {airdropping ? 'Requesting...' : 'Airdrop 5 SOL'}
        </Button>
        <Button
          variant="outline"
          className="h-12 bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
          onClick={refresh}
        >
          Refresh
        </Button>
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-400 px-1">Quick Links</h3>
        <a
          href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              {Icons.external}
            </div>
            <span className="text-sm font-medium">View on Explorer</span>
          </div>
          <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
        </a>
      </div>
    </div>
  );
}
