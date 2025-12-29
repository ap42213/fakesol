import { useEffect } from 'react';
import { useWalletStore, Transaction } from '../store/walletStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icons, Badge, Skeleton } from '../components/ui/index';
import { shortenAddress } from '../lib/solana';

function TransactionSkeleton() {
  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </Card>
  );
}

function TransactionItem({ tx, index }: { tx: Transaction; index: number }) {
  const date = tx.blockTime 
    ? new Date(tx.blockTime * 1000)
    : null;

  const formattedDate = date 
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Pending';
  
  const formattedTime = date
    ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <a
      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
      target="_blank"
      rel="noopener noreferrer"
      className="block animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card variant="interactive" padding="md">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${tx.err 
              ? 'bg-red-500/10 text-red-400' 
              : 'bg-green-500/10 text-green-400'
            }
          `}>
            {tx.err ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white font-medium truncate">
                Transaction
              </p>
              <Badge variant={tx.err ? 'error' : 'success'}>
                {tx.err ? 'Failed' : 'Success'}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 font-mono truncate">
              {shortenAddress(tx.signature, 12)}
            </p>
          </div>

          {/* Date & Time */}
          <div className="text-right flex-shrink-0">
            <p className="text-sm text-zinc-300">{formattedDate}</p>
            <p className="text-xs text-zinc-500">{formattedTime}</p>
          </div>

          {/* Arrow */}
          <div className="text-zinc-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Card>
    </a>
  );
}

export function Transactions() {
  const { transactions, fetchTransactions, isLoading } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-zinc-500">Your recent transactions on Devnet</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => fetchTransactions()}
          loading={isLoading}
          icon={Icons.refresh}
        >
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="glass" padding="md">
          <p className="text-zinc-500 text-sm mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
        </Card>
        <Card variant="glass" padding="md">
          <p className="text-zinc-500 text-sm mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-green-400">
            {transactions.length > 0
              ? Math.round((transactions.filter(t => !t.err).length / transactions.length) * 100)
              : 0}%
          </p>
        </Card>
      </div>

      {/* Transaction List */}
      {isLoading && transactions.length === 0 ? (
        <div className="space-y-3">
          <TransactionSkeleton />
          <TransactionSkeleton />
          <TransactionSkeleton />
        </div>
      ) : transactions.length === 0 ? (
        <Card variant="glass" padding="lg" className="text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            {Icons.history}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Your transaction history will appear here once you start sending or receiving SOL.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <TransactionItem key={tx.signature} tx={tx} index={index} />
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-center text-zinc-600 text-sm">
        Click on a transaction to view details on Solana Explorer
      </p>
    </div>
  );
}
