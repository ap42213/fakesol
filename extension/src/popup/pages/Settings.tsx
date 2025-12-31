import { useWallet } from '../context/WalletContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function Settings() {
  const { logout } = useWallet();

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-zinc-400">Manage your wallet</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider ml-1">Network</label>
          <Card className="p-4 bg-zinc-900 border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Solana Devnet</span>
            </div>
            <span className="text-xs text-zinc-500">Active</span>
          </Card>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider ml-1">About</label>
          <Card className="p-4 bg-zinc-900 border-zinc-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-300">Version</span>
              <span className="text-sm text-zinc-500">0.1.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-300">Cluster</span>
              <span className="text-sm text-zinc-500">Devnet</span>
            </div>
          </Card>
        </div>

        <Button
          variant="destructive"
          fullWidth
          onClick={logout}
          className="h-12 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
        >
          Logout / Reset Wallet
        </Button>
      </div>
    </div>
  );
}
