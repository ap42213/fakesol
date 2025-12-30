import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FiMail, FiCopy } from 'react-icons/fi';

export function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar - Desktop */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header />
        
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-8 px-4 lg:px-8 bg-zinc-900/20">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            
            {/* Column 1: Community */}
            <div className="space-y-4">
              <h3 className="text-zinc-400 font-medium uppercase tracking-wider text-xs">Community</h3>
              <div className="space-y-2">
                <a href="https://x.com/FakeSolWallet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                  @FakeSolWallet
                </a>
                <a href="mailto:hello@fakesol.com" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                  <FiMail className="w-4 h-4" />
                  hello@fakesol.com
                </a>
              </div>
            </div>

            {/* Column 2: Treasury */}
            <div className="space-y-4">
              <h3 className="text-zinc-400 font-medium uppercase tracking-wider text-xs">Treasury</h3>
              <div>
                <p className="text-zinc-500 text-xs mb-2">Return unused <span className="text-purple-400">Devnet</span> SOL:</p>
                <button 
                  onClick={() => navigator.clipboard.writeText('DfvJb314rHHa2Xe7aGZfhTtXDdh4GYSHcQaBLNEgtMK')}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group text-xs"
                  title="Copy Treasury Address"
                >
                  <span className="font-mono bg-zinc-800/50 px-2 py-1 rounded">DfvJ...gtMK</span>
                  <FiCopy className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-zinc-600 mt-1 italic">⚠️ Do not send real SOL</p>
              </div>
            </div>

            {/* Column 3: Support */}
            <div className="space-y-4">
              <h3 className="text-zinc-400 font-medium uppercase tracking-wider text-xs">Support</h3>
              <div>
                <p className="text-zinc-500 text-xs mb-2">Buy <a href="https://x.com/hardhatroq" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@hardhatroq</a> a coffee ☕️:</p>
                <button 
                  onClick={() => navigator.clipboard.writeText('FfD6D7PqWxPgJyDG4wcwGkzubqUg6wDE8jhfjJxC7MQv')}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group text-xs"
                  title="Copy Donation Address"
                >
                  <span className="font-mono bg-zinc-800/50 px-2 py-1 rounded">FfD6...MQv</span>
                  <FiCopy className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-zinc-600 mt-1 italic">Real SOL (Mainnet)</p>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="max-w-4xl mx-auto mt-8 pt-8 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full status-dot" />
              <span>Devnet Only</span>
            </div>
            <a 
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              Solana Explorer ↗
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
