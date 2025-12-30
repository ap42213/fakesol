import { useEffect, useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { Copy, Send, Download, Menu, WalletIcon, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Link, useLocation } from 'react-router-dom';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const location = useLocation();

  const { 
    publicKey, 
    balance, 
    transactions,
    isLoading, 
    refreshBalance, 
    requestAirdrop,
    fetchTransactions,
  } = useWalletStore();

  useEffect(() => {
    refreshBalance();
    fetchTransactions();
    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [refreshBalance, fetchTransactions]);

  const copyAddress = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    setAirdropLoading(true);
    try {
      await requestAirdrop(1);
    } catch (err) {
      console.error('Airdrop failed', err);
    } finally {
      setAirdropLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'layout-dashboard' },
    { name: 'Wallet', path: '/wallet', icon: 'wallet' },
    { name: 'Extension', path: '/extension', icon: 'puzzle' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const renderIcon = (iconName: string) => {
    const iconProps = { className: 'h-5 w-5' };
    switch (iconName) {
      case 'layout-dashboard':
        return (
          <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        );
      case 'wallet':
        return <WalletIcon {...iconProps} />;
      case 'puzzle':
        return (
          <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
          </svg>
        );
      case 'settings':
        return (
          <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
            <img src="/fakesol-logo.png" alt="FakeSOL Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              FakeSOL
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {renderIcon(item.icon)}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-800 p-4">
            <div className="rounded-lg bg-slate-900/80 p-4 border border-slate-800">
              <p className="text-xs text-gray-400 mb-2">Network Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-200">Devnet Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-slate-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refreshBalance()}
              disabled={isLoading}
              className="text-gray-400 hover:text-white hover:bg-slate-800"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              DEVNET
            </Badge>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Wallet Card */}
            <Card className="overflow-hidden border-slate-800 bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <WalletIcon className="h-5 w-5 text-teal-400" />
                  Your Wallet
                </CardTitle>
                <CardDescription className="text-gray-400">Solana Devnet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-950 p-3 border border-slate-800">
                    <code className="flex-1 text-sm text-gray-300 overflow-x-auto">
                      {publicKey || 'No wallet connected'}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyAddress}
                      className="h-8 w-8 text-teal-400 hover:bg-teal-400/10 hover:text-teal-300"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {publicKey && (
                      <a
                        href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 w-8 flex items-center justify-center text-purple-400 hover:bg-purple-400/10 hover:text-purple-300 rounded-md"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {copied && <p className="text-xs text-teal-400 mt-1">Copied!</p>}
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Balance</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                    {balance.toFixed(4)} SOL
                  </p>
                  <p className="text-sm text-gray-500 mt-1">≈ $0.00 USD (Devnet has no real value)</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleAirdrop}
                    disabled={airdropLoading}
                    className="flex-1 min-w-[140px] bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {airdropLoading ? 'Airdropping...' : 'Airdrop 1 SOL'}
                  </Button>
                  <Button className="flex-1 min-w-[140px] bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white border-0">
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                  <Button 
                    onClick={copyAddress}
                    className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
                <CardDescription className="text-gray-400">Recent wallet activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">Signature</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow className="border-slate-800">
                          <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                            No transactions yet. Request an airdrop to get started!
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.slice(0, 10).map((tx: any, index: number) => (
                          <TableRow key={index} className="border-slate-800 hover:bg-slate-800/30">
                            <TableCell className="font-medium text-white">
                              {tx.type || 'Transaction'}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              <a
                                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 hover:underline font-mono text-xs"
                              >
                                {tx.signature?.slice(0, 8)}...{tx.signature?.slice(-8)}
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/50">
                                {tx.status || 'Confirmed'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {tx.blockTime 
                                ? new Date(tx.blockTime * 1000).toLocaleString() 
                                : 'Pending'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
