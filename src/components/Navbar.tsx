import { Link, useLocation } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { shortenAddress } from '../lib/solana';

export function Navbar() {
  const location = useLocation();
  const { publicKey } = useWalletStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/send', label: 'Send', icon: '📤' },
    { path: '/receive', label: 'Receive', icon: '📥' },
    { path: '/transactions', label: 'History', icon: '📜' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-bold text-xl gradient-text">FakeSOL</span>
          </Link>

          {publicKey && (
            <div className="hidden sm:flex items-center gap-1 bg-zinc-800 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 bg-solana-green rounded-full animate-pulse"></span>
              <span className="text-sm text-zinc-400">
                {shortenAddress(publicKey)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-1 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                isActive(item.path)
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
