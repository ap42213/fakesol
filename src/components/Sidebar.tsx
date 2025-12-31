import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';
import { Icons, Badge } from './ui/index';
import { Logo } from './Logo';
import { WalletSwitcher } from './WalletSwitcher';
import { FiLogOut, FiUser } from 'react-icons/fi';

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

const MintIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ManageIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ConverterIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const UnitIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const VanityIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const RpcIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DecoderIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const IdlIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const PdaIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const InspectorIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
  </svg>
);

const MetadataIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DocsIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Icons.wallet },
  { path: '/send', label: 'Send', icon: Icons.send },
  { path: '/receive', label: 'Receive', icon: Icons.receive },
  { path: '/tokens', label: 'Tokens', icon: TokenIcon },
  { path: '/create-token', label: 'Mint Token', icon: MintIcon },
  { path: '/manage-token', label: 'Manage Token', icon: ManageIcon },
  { path: '/metadata', label: 'Metadata', icon: MetadataIcon },
  { path: '/converter', label: 'Key Converter', icon: ConverterIcon },
  { path: '/unit-converter', label: 'Unit Converter', icon: UnitIcon },
  { path: '/vanity', label: 'Vanity Gen', icon: VanityIcon },
  { path: '/rpc', label: 'RPC Health', icon: RpcIcon },
  { path: '/decoder', label: 'Tx Decoder', icon: DecoderIcon },
  { path: '/idl', label: 'IDL Viewer', icon: IdlIcon },
  { path: '/pda', label: 'PDA Calculator', icon: PdaIcon },
  { path: '/inspector', label: 'Account Inspector', icon: InspectorIcon },
  { path: '/explore', label: 'Explore', icon: ExploreIcon },
  { path: '/docs', label: 'Dev Tools', icon: DocsIcon },
  { path: '/transactions', label: 'History', icon: Icons.history },
  { path: '/extension', label: 'Extension', icon: ExtensionIcon },
  { path: '/settings', label: 'Settings', icon: Icons.settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { publicKey: guestPublicKey, balance: guestBalance, disconnect: guestDisconnect } = useWalletStore();
  const { user, logout, getActiveWallet } = useAuthStore();

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
            {isAuthenticated && (
              <div className="px-3 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <FiUser className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-zinc-300 truncate">{user?.email}</span>
                </div>
              </div>
            )}
            <WalletSwitcher />
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
