import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { Transactions } from './pages/Transactions';
import { Tokens } from './pages/Tokens';
import { Explore } from './pages/Explore';
import { Settings } from './pages/Settings';
import { Welcome } from './pages/Welcome';
import { AuthPage } from './pages/AuthPage.tsx';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useWalletStore } from './store/walletStore';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/index';
import { getEnv } from './lib/env.ts';

// Check if Clerk is configured
const clerkEnabled = !!getEnv('VITE_CLERK_PUBLISHABLE_KEY');

function ClerkApp() {
  const { isSignedIn, user: clerkUser } = useUser();
  const { publicKey: guestPublicKey } = useWalletStore();
  const { wallets, syncWithClerk } = useAuthStore();

  // Sync Clerk user with our backend
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      syncWithClerk(clerkUser.id, clerkUser.primaryEmailAddress?.emailAddress || '');
    }
  }, [isSignedIn, clerkUser, syncWithClerk]);

  const hasWallet = (isSignedIn && wallets.length > 0) || guestPublicKey;

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing */}
          <Route
            path="/"
            element={hasWallet ? <Navigate to="/dashboard" replace /> : <Welcome />}
          />

          {/* Auth page */}
          <Route
            path="/login"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <AuthPage initialMode="sign-in" />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <AuthPage initialMode="sign-up" />
                </SignedOut>
              </>
            }
          />
          
          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={
              hasWallet ? <Dashboard /> : <Navigate to="/login" replace />
            } />
            <Route path="/send" element={
              hasWallet ? <Send /> : <Navigate to="/login" replace />
            } />
            <Route path="/receive" element={
              hasWallet ? <Receive /> : <Navigate to="/login" replace />
            } />
            <Route path="/transactions" element={
              hasWallet ? <Transactions /> : <Navigate to="/login" replace />
            } />
            <Route path="/tokens" element={
              hasWallet ? <Tokens /> : <Navigate to="/login" replace />
            } />
            <Route path="/explore" element={<Explore />} />
            <Route path="/settings" element={
              hasWallet ? <Settings /> : <Navigate to="/login" replace />
            } />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Welcome />
          } />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

function LegacyApp() {
  const { publicKey: guestPublicKey } = useWalletStore();
  const { user, wallets, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const hasWallet = (user && wallets.length > 0) || guestPublicKey;

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            hasWallet ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          
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

function App() {
  return clerkEnabled ? <ClerkApp /> : <LegacyApp />;
}

export default App;
