import { useWallet } from '../context/WalletContext';
import { Icons } from '@/components/ui/icons';

export function Activity() {
  const { transactions, loading } = useWallet();

  const formatTimeAgo = (timestamp?: number | null) => {
    if (!timestamp) return 'Pending...';
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Activity</h2>
        <p className="text-sm text-zinc-400">Recent transactions on Devnet</p>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">No transactions found</div>
        ) : (
          transactions.map((tx) => (
            <a
              key={tx.signature}
              href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.err ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
              }`}>
                {tx.err ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-white truncate">
                    {tx.err ? 'Failed Transaction' : 'Transaction'}
                  </span>
                  <span className="text-xs text-zinc-500">{formatTimeAgo(tx.blockTime)}</span>
                </div>
                <div className="text-xs text-zinc-500 font-mono truncate">
                  {tx.signature}
                </div>
              </div>
              <div className="text-zinc-600 group-hover:text-zinc-400">
                {Icons.external}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
