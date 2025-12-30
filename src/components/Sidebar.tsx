import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';
import { Icons, Badge } from './ui/index';
import { Logo } from './Logo';
import { WalletSwitcher } from './WalletSwitcher';
import { FiLogOut, FiUser, FiMail, FiCopy } from 'react-icons/fi';

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

const ExtensionIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Icons.wallet },
  { path: '/send', label: 'Send', icon: Icons.send },
  { path: '/receive', label: 'Receive', icon: Icons.receive },
  { path: '/tokens', label: 'Tokens', icon: TokenIcon },
  { path: '/explore', label: 'Explore', icon: ExploreIcon },
  { path: '/transactions', label: 'History', icon: Icons.history },
  { path: '/extension', label: 'Extension', icon: ExtensionIcon },
  { path: '/settings', label: 'Settings', icon: Icons.settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { publicKey: guestPublicKey, balance: guestBalance, disconnect: guestDisconnect } = useWalletStore();
  const { user, wallets, logout, getActiveWallet } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;
  
  // Determine which wallet/balance to show
  const isAuthenticated = !!user;
  const activeWallet = isAuthenticated ? getActiveWallet() : null;
  const displayPublicKey = activeWallet?.publicKey || guestPublicKey;
  const displayBalance = guestBalance; // Balance is always from guestBalance for now

  const handleLogout = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      guestDisconnect();
    }
    navigate('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-zinc-900/50 border-r border-zinc-800/50 backdrop-blur-xl z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <span className="font-bold text-white text-lg">FakeSOL</span>
              <Badge variant="warning" >Devnet</Badge>
            </div>
          </Link>
        </div>

        {/* Wallet Switcher */}
        {displayPublicKey && (
          <div className="px-3 py-4 border-b border-zinc-800/50 relative">
            {isAuthenticated ? (
              <div className="px-3">
                <div className="flex items-center gap-2 mb-1">
                  <FiUser className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-zinc-300 truncate">{user?.email}</span>
                </div>
                <div className="text-xs text-zinc-500">
                  {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <WalletSwitcher />
            )}
            <div className="mt-3 px-3 flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">{displayBalance.toFixed(4)}</span>
              <span className="text-sm text-zinc-400">SOL</span>
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

        {/* Community & Treasury */}
        <div className="px-4 py-4 border-t border-zinc-800/50 space-y-4">
           <div>
             <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Community</p>
             <div className="space-y-2">
               <a href="https://x.com/FakeSolWallet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                 @FakeSolWallet
               </a>
               <a href="mailto:hello@fakesol.com" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                 <FiMail className="w-4 h-4" />
                 hello@fakesol.com
               </a>
             </div>
           </div>
           
           <div>
             <p className="text-xs text-zinc-500 mb-1">Return unused SOL:</p>
             <button 
               onClick={() => {
                 navigator.clipboard.writeText('DfvJb314rHHa2Xe7aGZfhTtXDdh4GYSHcQaBLNEgtMK');
                 // You might want to add a toast notification here
               }}
               className="w-full flex items-center justify-between p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg group transition-colors text-left"
               title="Copy Treasury Address"
             >
                <span className="text-xs text-zinc-400 font-mono truncate">DfvJ...gtMK</span>
                <FiCopy className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
             </button>
           </div>
        </div>

        {/* Network Status */}
        <div className="px-4 py-4 border-t border-zinc-800/50 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full status-dot" />
              <span className="text-zinc-400">Connected</span>
            </div>
            <span className="text-zinc-500">Devnet</span>
          </div>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            {isAuthenticated ? 'Sign Out' : 'Disconnect'}
          </button>
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
