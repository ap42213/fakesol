import { useState, useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, Skeleton } from '../components/ui/index';
import { Logo } from '../components/Logo';
import { api } from '../lib/api';

interface Token {
  address: string;
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  name: string;
  symbol: string;
}

function TokenSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

function TokenItem({ token }: { token: Token }) {
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-yellow-500',
    'from-red-500 to-pink-500',
  ];
  
  // Generate consistent color based on mint address
  const colorIndex = token.mint.charCodeAt(0) % colors.length;
  
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors animate-fadeIn">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-lg`}>
        {token.symbol.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{token.name}</p>
          <Badge variant="default">{token.symbol}</Badge>
        </div>
        <p className="text-xs text-zinc-500 font-mono truncate">
          {token.mint}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-white">
          {token.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </p>
        <p className="text-xs text-zinc-500">{token.symbol}</p>
      </div>
      <div className="flex flex-col gap-2 text-right">
        <button
          className="text-xs text-purple-400 hover:text-purple-300"
          onClick={() => navigator.clipboard.writeText(token.mint)}
        >
          Copy mint
        </button>
        <a
          href={`https://explorer.solana.com/address/${token.mint}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-zinc-400 hover:text-white"
        >
          Explorer
        </a>
      </div>
    </div>
  );
}

export function Tokens() {
  const { publicKey } = useWalletStore();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [hideZero, setHideZero] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getTokens(publicKey);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setTokens(result.data?.tokens || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [publicKey]);

  const filteredTokens = hideZero ? tokens.filter((t) => t.uiAmount > 0) : tokens;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Token Holdings</h1>
          <p className="text-zinc-500">Your SPL tokens on Solana Devnet</p>
        </div>
        <Button
          variant="secondary"
          onClick={fetchTokens}
          disabled={loading}
          icon={
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          Refresh
        </Button>
      </div>

      {/* Token Count */}
      <Card variant="gradient" padding="md">
        <div className="flex items-center gap-4">
          <Logo size="lg" />
          <div>
            <p className="text-zinc-400 text-sm">Total Tokens</p>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : tokens.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card variant="glass" padding="md" className="border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <div>
              <p className="text-red-400 font-medium">Failed to load tokens</p>
              <p className="text-sm text-zinc-500">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Token List */}
      <Card variant="glass" padding="none">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-medium text-white">Your Tokens</h3>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              className="accent-purple-500"
              checked={hideZero}
              onChange={(e) => setHideZero(e.target.checked)}
            />
            Hide zero balances
          </label>
        </div>
        
        <div className="p-4 space-y-3">
          {loading ? (
            <>
              <TokenSkeleton />
              <TokenSkeleton />
              <TokenSkeleton />
            </>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium">No tokens yet</p>
              <p className="text-sm text-zinc-600 mt-1">
                SPL tokens you receive will appear here
              </p>
            </div>
          ) : (
            filteredTokens.map((token) => (
              <TokenItem key={token.address} token={token} />
            ))
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card variant="glass" padding="md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-zinc-300 font-medium">About SPL Tokens</p>
            <p className="text-xs text-zinc-500 mt-1">
              SPL tokens are the token standard on Solana. On devnet, you can interact with test tokens
              without any real value. Visit faucets or use devnet token minting tools to get test tokens.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
