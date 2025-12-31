import { useWallet } from '../context/WalletContext';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/icons';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function Receive() {
  const { publicKey } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-6 h-full flex flex-col">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Receive SOL</h2>
        <p className="text-sm text-zinc-400">Share your address to receive funds</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="p-4 bg-white rounded-xl">
          {/* QR Code placeholder - in a real app use a QR library */}
          <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs text-center p-4">
            QR Code Generator would go here
          </div>
        </div>

        <div className="w-full space-y-2">
          <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider ml-1">Your Address</label>
          <Card className="p-4 bg-zinc-900 border-zinc-800 flex items-center justify-between gap-3">
            <code className="text-sm text-zinc-300 break-all font-mono">
              {publicKey}
            </code>
          </Card>
          <Button
            onClick={handleCopy}
            variant="outline"
            fullWidth
            className="h-12 border-zinc-800 hover:bg-zinc-800"
            icon={copied ? <span className="text-green-500">{Icons.check}</span> : Icons.copy}
          >
            {copied ? 'Copied!' : 'Copy Address'}
          </Button>
        </div>
      </div>
    </div>
  );
}
