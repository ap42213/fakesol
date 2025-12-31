import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createMintToInstruction, 
  createBurnInstruction,
  getAccount,
  getMint
} from '@solana/spl-token';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useToast } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiPlus, FiMinus, FiSearch } from 'react-icons/fi';

export function TokenManager() {
  const { publicKey, keypair, connection } = useWalletStore();
  const { showToast } = useToast();
  
  const [mintAddress, setMintAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [action, setAction] = useState<'mint' | 'burn'>('mint');
  const [amount, setAmount] = useState('');

  const fetchTokenInfo = async () => {
    if (!mintAddress) return;
    setIsLoading(true);
    setTokenInfo(null);

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const mintInfo = await getMint(connection, mintPubkey);
      
      let userBalance = '0';
      if (publicKey) {
        try {
          const ata = await getAssociatedTokenAddress(mintPubkey, new PublicKey(publicKey));
          const accountInfo = await getAccount(connection, ata);
          userBalance = (Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals)).toString();
        } catch (e) {
          // No ATA or 0 balance
        }
      }

      setTokenInfo({
        supply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toString(),
        decimals: mintInfo.decimals,
        authority: mintInfo.mintAuthority?.toBase58(),
        userBalance
      });
    } catch (e) {
      showToast('Failed to fetch token info. Invalid address?', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!publicKey || !keypair || !tokenInfo) return;
    
    try {
      setIsLoading(true);
      const mintPubkey = new PublicKey(mintAddress);
      const walletPubkey = new PublicKey(publicKey);
      const rawAmount = parseFloat(amount) * Math.pow(10, tokenInfo.decimals);

      const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
      const tx = new Transaction();

      if (action === 'mint') {
        const ix = createMintToInstruction(
          mintPubkey,
          ata,
          walletPubkey,
          BigInt(rawAmount)
        );
        tx.add(ix);
      } else {
        const ix = createBurnInstruction(
          ata,
          mintPubkey,
          walletPubkey,
          BigInt(rawAmount)
        );
        tx.add(ix);
      }

      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = walletPubkey;
      tx.sign(keypair);

      const sig = await connection.sendRawTransaction(tx.serialize());
      await connection.confirmTransaction(sig);
      
      showToast(`Successfully ${action}ed tokens!`, 'success');
      fetchTokenInfo(); // Refresh
      setAmount('');
    } catch (e: any) {
      showToast(`Failed: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="Token Manager | FakeSOL" 
        description="Mint or burn SPL tokens for existing mints." 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Token Manager
          </h1>
          <p className="text-gray-400 mt-2">Mint or burn tokens for an existing Mint Address.</p>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="Enter Mint Address..."
              />
            </div>
            <Button onClick={fetchTokenInfo} disabled={isLoading || !mintAddress}>
              <FiSearch className="mr-2" /> Load
            </Button>
          </div>

          {tokenInfo && (
            <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500">Current Supply</div>
                  <div className="text-lg font-mono text-white">{tokenInfo.supply}</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500">Decimals</div>
                  <div className="text-lg font-mono text-white">{tokenInfo.decimals}</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500">Your Balance</div>
                  <div className="text-lg font-mono text-purple-400">{tokenInfo.userBalance}</div>
                </div>
              </div>

              {tokenInfo.authority !== publicKey ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-yellow-400 text-sm">
                  Warning: You are not the Mint Authority for this token. You likely cannot mint new tokens, but you can burn tokens you own.
                </div>
              ) : null}

              <div className="border-t border-gray-800 pt-6">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setAction('mint')}
                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                      action === 'mint' 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <FiPlus /> Mint More
                  </button>
                  <button
                    onClick={() => setAction('burn')}
                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                      action === 'burn' 
                        ? 'bg-red-500/20 border-red-500 text-red-400' 
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <FiMinus /> Burn Tokens
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Amount to {action === 'mint' ? 'Mint' : 'Burn'}
                    </label>
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <Button 
                    onClick={handleExecute} 
                    className="w-full"
                    variant={action === 'mint' ? 'primary' : 'danger'}
                    disabled={isLoading || !amount}
                  >
                    {isLoading ? 'Processing...' : `${action.charAt(0).toUpperCase() + action.slice(1)} Tokens`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
