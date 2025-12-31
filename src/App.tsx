import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { Transactions } from './pages/Transactions';
import { Tokens } from './pages/Tokens';
import { Explore } from './pages/Explore';
import { TokenCreator } from './pages/TokenCreator';
import { KeypairConverter } from './pages/KeypairConverter';
import { TransactionDecoder } from './pages/TransactionDecoder';
import { Settings } from './pages/Settings';
import { Welcome } from './pages/Welcome';
import { Extension } from './pages/Extension';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OAuthCallback } from './pages/OAuthCallback';
import { useWalletStore } from './store/walletStore';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/index';

function App() {
  const { publicKey: guestPublicKey, setWallets } = useWalletStore();
  const { user, wallets, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user && wallets.length > 0) {
      const formattedWallets = wallets.map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt).getTime()
      }));
      setWallets(formattedWallets);
    }
  }, [user, wallets, setWallets]);

  const hasWallet = (user && wallets.length > 0) || guestPublicKey;

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Welcome />
          } />
          <Route path="/login" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          
          {/* Protected routes */}
          {hasWallet ? (
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<Send />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/create-token" element={<TokenCreator />} />
              <Route path="/converter" element={<KeypairConverter />} />
              <Route path="/decoder" element={<TransactionDecoder />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/extension" element={<Extension />} />
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
