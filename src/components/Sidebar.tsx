import { Link, useLocation } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { shortenAddress } from '../lib/solana';
import { Icons, Badge } from './ui/index';

const TokenIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ExploreIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const navItems = [
  { path: '/', label: 'Dashboard', icon: Icons.wallet },
  { path: '/send', label: 'Send', icon: Icons.send },
  { path: '/receive', label: 'Receive', icon: Icons.receive },
  { path: '/tokens', label: 'Tokens', icon: TokenIcon },
  { path: '/explore', label: 'Explore', icon: ExploreIcon },
  { path: '/transactions', label: 'History', icon: Icons.history },
  { path: '/settings', label: 'Settings', icon: Icons.settings },
];

export function Sidebar() {
  const location = useLocation();
  const { publicKey, balance } = useWalletStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-zinc-900/50 border-r border-zinc-800/50 backdrop-blur-xl z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-green-400 flex items-center justify-center">
              <span className="text-white">{Icons.solana}</span>
            </div>
            <div>
              <span className="font-bold text-white text-lg">FakeSOL</span>
              <Badge variant="warning" >Devnet</Badge>
            </div>
          </Link>
        </div>

        {/* Wallet Info */}
        {publicKey && (
          <div className="px-4 py-4 border-b border-zinc-800/50">
            <div className="glass-card p-4">
              <p className="text-xs text-zinc-500 mb-1">Wallet</p>
              <p className="font-mono text-sm text-zinc-300 mb-2">
                {shortenAddress(publicKey, 6)}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{balance.toFixed(4)}</span>
                <span className="text-sm text-zinc-400">SOL</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive(item.path)
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }
              `}
            >
              <span className={isActive(item.path) ? 'text-purple-400' : ''}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Network Status */}
        <div className="px-4 py-4 border-t border-zinc-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full status-dot" />
              <span className="text-zinc-400">Connected</span>
            </div>
            <span className="text-zinc-500">Devnet</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50 z-40 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                ${isActive(item.path)
                  ? 'text-purple-400'
                  : 'text-zinc-500 hover:text-zinc-300'
                }
              `}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
