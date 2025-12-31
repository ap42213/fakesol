import { useState } from 'react';
import { useWalletStore, SavedWallet } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';
import { shortenAddress } from '../lib/solana';
import { Icons, Badge, Modal } from './ui/index';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function WalletSwitcher() {
  const { 
    wallets, 
    activeWalletId, 
    switchWallet, 
    createWallet: createLocalWallet, 
    renameWallet: renameLocalWallet,
    deleteWallet: deleteLocalWallet,
  } = useWalletStore();

  const { 
    user, 
    createWallet: createAuthWallet,
    renameWallet: renameAuthWallet,
    deleteWallet: deleteAuthWallet,
  } = useAuthStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [editingWallet, setEditingWallet] = useState<SavedWallet | null>(null);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState<string | null>(null);

  const activeWallet = wallets.find(w => w.id === activeWalletId);

  // Helper to sync authStore wallets to walletStore
  const syncWalletsToStore = () => {
    const authWallets = useAuthStore.getState().wallets;
    if (authWallets.length > 0) {
      const formattedWallets = authWallets.map((w: any) => ({
        ...w,
        createdAt: typeof w.createdAt === 'string' ? new Date(w.createdAt).getTime() : w.createdAt
      }));
      useWalletStore.getState().setWallets(formattedWallets);
    }
  };

  const handleCreateWallet = async () => {
    if (user) {
      await createAuthWallet(newWalletName || undefined);
      // Sync the new wallet to walletStore
      syncWalletsToStore();
    } else {
      createLocalWallet(newWalletName || undefined);
    }
    setNewWalletName('');
    setShowAddModal(false);
  };

  const handleSwitchWallet = (walletId: string) => {
    switchWallet(walletId);
    setIsOpen(false);
  };

  const handleStartEdit = (wallet: SavedWallet) => {
    setEditingWallet(wallet);
    setEditName(wallet.name);
  };

  const handleSaveEdit = async () => {
    if (editingWallet && editName.trim()) {
      if (user) {
        await renameAuthWallet(editingWallet.id, editName);
        syncWalletsToStore();
      } else {
        renameLocalWallet(editingWallet.id, editName);
      }
      setEditingWallet(null);
      setEditName('');
    }
  };

  const handleDelete = async (walletId: string) => {
    if (user) {
      await deleteAuthWallet(walletId);
      syncWalletsToStore();
    } else {
      deleteLocalWallet(walletId);
    }
    setShowDeleteConfirm(null);
    if (wallets.length <= 1) {
      setShowManageModal(false);
    }
  };

  const handleCopyKey = async (privateKey: string) => {
    await navigator.clipboard.writeText(privateKey);
  };

  return (
    <>
      {/* Wallet Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 glass-card hover:bg-zinc-800/50 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {activeWallet?.name.charAt(0).toUpperCase() || 'W'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {activeWallet?.name || 'Select Wallet'}
              </p>
              <p className="text-xs text-zinc-500 font-mono truncate">
                {activeWallet ? shortenAddress(activeWallet.publicKey, 4) : '—'}
              </p>
            </div>
          </div>
          <svg 
            className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-3 right-3 mt-1 glass-card p-2 z-50 max-h-64 overflow-y-auto">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleSwitchWallet(wallet.id)}
              className={`w-full p-2 rounded-lg flex items-center gap-3 transition-colors ${
                wallet.id === activeWalletId 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'hover:bg-zinc-800/50 text-zinc-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                wallet.id === activeWalletId 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-zinc-700 text-zinc-300'
              }`}>
                {wallet.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{wallet.name}</p>
                <p className="text-xs text-zinc-500 font-mono truncate">
                  {shortenAddress(wallet.publicKey, 4)}
                </p>
              </div>
              {wallet.id === activeWalletId && (
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
          
          <div className="border-t border-zinc-800 my-2" />
          
          <button
            onClick={() => { setShowAddModal(true); setIsOpen(false); }}
            className="w-full p-2 rounded-lg flex items-center gap-3 hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center">
              {Icons.plus}
            </div>
            <span className="text-sm">Add Wallet</span>
          </button>
          
          <button
            onClick={() => { setShowManageModal(true); setIsOpen(false); }}
            className="w-full p-2 rounded-lg flex items-center gap-3 hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center">
              {Icons.settings}
            </div>
            <span className="text-sm">Manage Wallets</span>
          </button>
        </div>
      )}

      {/* Add Wallet Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Wallet"
      >
        <div className="space-y-4">
          <Input
            label="Wallet Name (optional)"
            placeholder={`Wallet ${wallets.length + 1}`}
            value={newWalletName}
            onChange={(e) => setNewWalletName(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleCreateWallet}
            >
              Create Wallet
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Wallets Modal */}
      <Modal
        isOpen={showManageModal}
        onClose={() => { setShowManageModal(false); setEditingWallet(null); }}
        title="Manage Wallets"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id}
              className="p-3 bg-zinc-800/50 rounded-xl"
            >
              {editingWallet?.id === wallet.id ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Wallet name"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingWallet(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{wallet.name}</p>
                      {wallet.id === activeWalletId && (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mb-3">
                    {shortenAddress(wallet.publicKey, 8)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStartEdit(wallet)}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Rename
                    </button>
                    <span className="text-zinc-700">•</span>
                    <button
                      onClick={() => setShowPrivateKey(wallet.privateKey)}
                      className="text-xs text-zinc-400 hover:text-yellow-400 transition-colors"
                    >
                      Export Key
                    </button>
                    {wallets.length > 1 && (
                      <>
                        <span className="text-zinc-700">•</span>
                        <button
                          onClick={() => setShowDeleteConfirm(wallet.id)}
                          className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
              
              {/* Delete Confirmation */}
              {showDeleteConfirm === wallet.id && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 mb-2">Delete this wallet?</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(wallet.id)}>
                      Delete
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Private Key Modal */}
      <Modal
        isOpen={!!showPrivateKey}
        onClose={() => setShowPrivateKey(null)}
        title="Private Key"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">
              ⚠️ Never share your private key with anyone.
            </p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <p className="font-mono text-xs text-zinc-300 break-all select-all">
              {showPrivateKey}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowPrivateKey(null)}
            >
              Close
            </Button>
            <Button
              fullWidth
              onClick={() => showPrivateKey && handleCopyKey(showPrivateKey)}
              icon={Icons.copy}
            >
              Copy Key
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
