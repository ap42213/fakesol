import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

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
        <footer className="border-t border-zinc-800/50 py-4 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full status-dot" />
              <span>Devnet Only</span>
            </div>
            <a 
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              Solana Explorer ↗
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
