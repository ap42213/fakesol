import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { Transactions } from './pages/Transactions';
import { Tokens } from './pages/Tokens';
import { Explore } from './pages/Explore';
import { Settings } from './pages/Settings';
import { Welcome } from './pages/Welcome';
import { useWalletStore } from './store/walletStore';
import { ToastProvider } from './components/ui/index';

function App() {
  const { publicKey } = useWalletStore();

  return (
    <ToastProvider>
      {!publicKey ? (
        <Welcome />
      ) : (
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/send" element={<Send />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </ToastProvider>
  );
}

export default App;
