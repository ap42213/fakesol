import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icons, Badge, CopyButton, useToast } from '../components/ui/index';
import { shortenAddress } from '../lib/solana';
import { Logo } from '../components/Logo';
import { api } from '../lib/api';

const testerSpotlight = [
  {
    name: 'Solana Explorer (devnet)',
    description: 'Verify transactions, tokens, and programs on the devnet cluster.',
    url: 'https://explorer.solana.com/?cluster=devnet',
    incentive: '@solana',
    tag: 'Explorer',
  },
  {
    name: 'Solana Faucet',
    description: 'Request devnet SOL to test transactions and flows safely.',
    url: 'https://faucet.solana.com/',
    incentive: '@solana',
    tag: 'Faucet',
  },
];

export function Dashboard() {
  const { 
    publicKey, 
    balance, 
    transactions,
    isLoading, 
    error,
    refreshBalance, 
    requestAirdrop,
    fetchTransactions,
    clearError 
  } = useWalletStore();
  
  const { showToast } = useToast();
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [copiedSig, setCopiedSig] = useState<string | null>(null);
  const [clusterInfo, setClusterInfo] = useState<{ rpcUrl: string; slot: number; blockHeight: number; version: string } | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [devToolsError, setDevToolsError] = useState<string | null>(null);

  useEffect(() => {
    refreshBalance();
    fetchTransactions();
    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [refreshBalance, fetchTransactions]);

  useEffect(() => {
    const loadCluster = async () => {
      try {
        const start = performance.now();
        const res = await api.getClusterInfo();
        const end = performance.now();
        if (res.error || !res.data) {
          setDevToolsError(res.error || res.message || 'Failed to load');
          return;
        }
        setLatencyMs(Math.round(end - start));
        setClusterInfo({
          rpcUrl: res.data.rpcUrl,
          slot: res.data.slot,
          blockHeight: res.data.blockHeight,
          version: res.data.version,
        });
      } catch (e: any) {
        setDevToolsError(e.message || 'Failed to load');
      }
    };
    loadCluster();
  }, []);

  const handleAirdrop = async () => {
    setAirdropLoading(true);
    clearError();
    try {
      await requestAirdrop(5);
      showToast('Airdrop successful! +5 SOL', 'success');
    } catch (err: any) {
      showToast(err.message || 'Airdrop failed', 'error');
    } finally {
      setAirdropLoading(false);
    }
  };

  const formatTimeAgo = (timestamp?: number | null) => {
    if (!timestamp) return 'Pending…';
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleCopySignature = async (sig: string) => {
    await navigator.clipboard.writeText(sig);
    setCopiedSig(sig);
    showToast('Signature copied', 'success');
    setTimeout(() => setCopiedSig((prev) => (prev === sig ? null : prev)), 1500);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500">Manage your devnet wallet</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => refreshBalance()}
          loading={isLoading}
        >
          {Icons.refresh}
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Balance Card */}
      <Card variant="gradient" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-zinc-400 text-sm mb-2">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white number-animate">
                {isLoading && balance === 0 ? '...' : balance.toFixed(4)}
              </span>
              <span className="text-2xl text-zinc-400">SOL</span>
            </div>
            <p className="text-zinc-500 text-sm mt-2">
              ≈ $0.00 USD <Badge variant="warning">No real value</Badge>
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="success"
              size="lg"
              onClick={handleAirdrop}
              loading={airdropLoading}
              icon={Icons.droplet}
            >
              Airdrop
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-400 text-sm flex-1">{error}</p>
          <button onClick={clearError} className="text-red-400 hover:text-red-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/send">
          <Card variant="interactive" padding="md" className="h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                {Icons.send}
              </div>
              <div>
                <p className="font-semibold text-white">Send</p>
                <p className="text-sm text-zinc-500">Transfer SOL</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/receive">
          <Card variant="interactive" padding="md" className="h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                {Icons.receive}
              </div>
              <div>
                <p className="font-semibold text-white">Receive</p>
                <p className="text-sm text-zinc-500">Get SOL</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Wallet Address */}
      <Card variant="glass" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="sm" />
            <div className="min-w-0">
              <p className="text-zinc-400 text-xs mb-0.5">Your Address</p>
              <p className="text-white font-mono text-sm truncate">
                {publicKey}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton text={publicKey || ''} />
            <a
              href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              {Icons.external}
            </a>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link to="/transactions" className="text-sm text-purple-400 hover:text-purple-300">
            View All →
          </Link>
        </div>
        
        {transactions.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center">
            <div className="text-zinc-500">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                {Icons.history}
              </div>
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Request an airdrop to get started!</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 3).map((tx) => (
              <a
                key={tx.signature}
                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card variant="interactive" padding="sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.err ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                      {tx.err ? '✕' : '✓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-white truncate">
                        {shortenAddress(tx.signature, 8)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatTimeAgo(tx.blockTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tx.err ? 'error' : 'success'}>
                        {tx.err ? 'Failed' : 'Success'}
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopySignature(tx.signature);
                        }}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        aria-label="Copy signature"
                      >
                        {copiedSig === tx.signature ? 'Copied' : Icons.copy}
                      </button>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Tester Spotlight */}
      <Card variant="glass" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-zinc-400">Looking for testers</p>
            <p className="text-lg font-semibold text-white">Featured devnet projects</p>
          </div>
          <Link to="/explore" className="text-sm text-purple-400 hover:text-purple-300">See all →</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {testerSpotlight.map((proj) => (
            <a
              key={proj.name}
              href={proj.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 hover:bg-zinc-900/80 transition-colors block"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white truncate">{proj.name}</p>
                <Badge variant="default">{proj.tag}</Badge>
              </div>
              <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{proj.description}</p>
              <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                <span>🎁</span>
                <span>{proj.incentive}</span>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Info Card */}
      <Card variant="glass" padding="md">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-zinc-300 font-medium">About Devnet</p>
            <p className="text-sm text-zinc-500 mt-1">
              Solana Devnet is a testing network where you can experiment with dApps risk-free. 
              SOL on devnet has no real value and can be obtained freely via airdrops.
            </p>
          </div>
        </div>
      </Card>

      {/* Dev Tools */}
      <Card variant="glass" padding="md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 flex-shrink-0">
              {Icons.settings}
            </div>
            <div>
              <p className="text-sm text-zinc-300 font-medium">Dev Tools</p>
              {devToolsError ? (
                <p className="text-sm text-red-400 mt-1">{devToolsError}</p>
              ) : clusterInfo ? (
                <div className="space-y-1 text-sm text-zinc-400 mt-1">
                  <p>RPC: <span className="text-white font-mono break-all">{clusterInfo.rpcUrl}</span></p>
                  <p>Slot: <span className="text-white">{clusterInfo.slot}</span> · Block: <span className="text-white">{clusterInfo.blockHeight}</span></p>
                  <p>Version: <span className="text-white">{clusterInfo.version}</span></p>
                  {latencyMs !== null && <p>Latency: <span className="text-white">~{latencyMs} ms</span></p>}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 mt-1">Loading cluster info…</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const key = useWalletStore.getState().exportKey?.();
              if (!key) return;
              const confirmed = window.confirm('Export private key? Only for devnet testing.');
              if (!confirmed) return;
              navigator.clipboard.writeText(key);
              showToast('Private key copied', 'success');
            }}
          >
            Copy Dev Key
          </Button>
        </div>
      </Card>
    </div>
  );
}
