import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { Transactions } from './pages/Transactions';
import { Tokens } from './pages/Tokens';
import { Explore } from './pages/Explore';
import { Settings } from './pages/Settings';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useWalletStore } from './store/walletStore';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/index';

function App() {
  const { publicKey: guestPublicKey } = useWalletStore();
  const { user, wallets, checkAuth } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // User is authenticated if they're logged in OR have a guest wallet
  const hasWallet = (user && wallets.length > 0) || guestPublicKey;

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          
          {/* Protected routes */}
          {hasWallet ? (
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<Send />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          ) : (
            <Route path="*" element={<Welcome />} />
          )}
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
