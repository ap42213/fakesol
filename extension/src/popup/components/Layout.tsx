import { Link, useLocation } from 'react-router-dom';
import { Icons } from '@/components/ui/icons';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-[360px] h-[600px] bg-[#09090b] flex flex-col text-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <img src="/icons/icon48.png" alt="FakeSOL" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg tracking-tight">FakeSOL</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded uppercase tracking-wider">
            Devnet
          </span>
        </div>
        <Link to="/settings" className="text-zinc-400 hover:text-white transition-colors">
          {Icons.settings}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="grid grid-cols-4 border-t border-zinc-800 bg-[#09090b]">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            isActive('/') ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {Icons.wallet}
          <span className="text-[10px] font-medium">Wallet</span>
        </Link>
        <Link
          to="/send"
          className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            isActive('/send') ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {Icons.send}
          <span className="text-[10px] font-medium">Send</span>
        </Link>
        <Link
          to="/receive"
          className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            isActive('/receive') ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {Icons.receive}
          <span className="text-[10px] font-medium">Receive</span>
        </Link>
        <Link
          to="/activity"
          className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            isActive('/activity') ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {Icons.history}
          <span className="text-[10px] font-medium">Activity</span>
        </Link>
      </div>
    </div>
  );
}
