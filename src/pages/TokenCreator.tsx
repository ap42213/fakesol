import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { 
  createInitializeMintInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge, useToast } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiBox, FiCpu, FiLayers, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';

export function TokenCreator() {
  const { publicKey, keypair, connection } = useWalletStore();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'creating' | 'success'>('input');
  const [logs, setLogs] = useState<string[]>([]);
  const [createdToken, setCreatedToken] = useState<{ mint: string; amount: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '9',
    supply: '1000000',
    uri: '' // Metadata URI (optional for now as we need Metaplex for full metadata)
  });

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !keypair) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    setIsLoading(true);
    setStep('creating');
    setLogs([]);
    addLog('🚀 Starting token creation process...');

    try {
      const mintKeypair = Keypair.generate();
      const decimals = parseInt(formData.decimals);
      const supply = parseFloat(formData.supply) * Math.pow(10, decimals);
      const walletPublicKey = new PublicKey(publicKey);

      addLog(`📦 Generated Mint Address: ${mintKeypair.publicKey.toBase58()}`);

      // 1. Get Rent Exemption
      addLog('💰 Calculating rent exemption...');
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // 2. Create Mint Account
      addLog('🏗️ Creating mint account instruction...');
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      });

      // 3. Initialize Mint
      addLog('⚙️ Initializing mint...');
      const initializeMintIx = createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        walletPublicKey,
        walletPublicKey,
        TOKEN_PROGRAM_ID
      );

      // 4. Get ATA
      addLog('👤 Calculating your Associated Token Account (ATA)...');
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        walletPublicKey
      );

      // 5. Create ATA Instruction
      addLog('📝 Creating ATA instruction...');
      const createATAIx = createAssociatedTokenAccountInstruction(
        walletPublicKey,
        associatedTokenAccount,
        walletPublicKey,
        mintKeypair.publicKey
      );

      // 6. Mint To Instruction
      addLog(`💸 Minting ${formData.supply} tokens to your wallet...`);
      const mintToIx = createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAccount,
        walletPublicKey,
        BigInt(supply),
        [],
        TOKEN_PROGRAM_ID
      );

      // Bundle transaction
      const transaction = new Transaction().add(
        createAccountIx,
        initializeMintIx,
        createATAIx,
        mintToIx
      );

      transaction.feePayer = walletPublicKey;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      addLog('🔐 Signing transaction...');
      // Sign with both mint keypair and wallet keypair
      transaction.sign(mintKeypair, keypair);

      addLog('📡 Sending transaction to Devnet...');
      const signature = await connection.sendRawTransaction(transaction.serialize());
      
      addLog('⏳ Confirming transaction...');
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      addLog('✅ Token created successfully!');
      setCreatedToken({
        mint: mintKeypair.publicKey.toBase58(),
        amount: formData.supply
      });
      setStep('success');
      showToast('Token created successfully!', 'success');

    } catch (error: any) {
      console.error(error);
      addLog(`❌ Error: ${error.message}`);
      showToast(error.message || 'Failed to create token', 'error');
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep('input');
    setIsLoading(false);
    setCreatedToken(null);
    setFormData({ ...formData, name: '', symbol: '' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SEO 
        title="Token Creator - FakeSOL" 
        description="Create your own SPL tokens on Solana Devnet in seconds. No coding required."
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Token Creator</h1>
          <p className="text-zinc-400">Mint your own SPL tokens on Devnet instantly.</p>
        </div>
        <Badge variant="purple" className="px-3 py-1 text-sm">
          <FiCpu className="w-4 h-4 mr-2" />
          No Code Required
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-zinc-800 bg-zinc-900/50">
            {step === 'input' ? (
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Token Name</label>
                    <Input 
                      placeholder="e.g. My Test Token" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Token Symbol</label>
                    <Input 
                      placeholder="e.g. TEST" 
                      value={formData.symbol}
                      onChange={e => setFormData({...formData, symbol: e.target.value})}
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Decimals</label>
                    <Input 
                      type="number"
                      placeholder="9" 
                      value={formData.decimals}
                      onChange={e => setFormData({...formData, decimals: e.target.value})}
                      min="0"
                      max="9"
                      required
                    />
                    <p className="text-xs text-zinc-500 mt-1">Standard is 9 (like SOL)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Initial Supply</label>
                    <Input 
                      type="number"
                      placeholder="1000000" 
                      value={formData.supply}
                      onChange={e => setFormData({...formData, supply: e.target.value})}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Metadata URI (Optional)
                    <span className="ml-2 text-xs text-zinc-500">JSON URL for name/image</span>
                  </label>
                  <Input 
                    placeholder="https://..." 
                    value={formData.uri}
                    onChange={e => setFormData({...formData, uri: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <FiLoader className="animate-spin" /> Creating Token...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FiBox /> Create Token
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            ) : step === 'creating' ? (
              <div className="py-12 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                  <FiCpu className="absolute inset-0 m-auto w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Minting Token...</h3>
                  <p className="text-zinc-400">Please approve the transaction in your wallet</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Token Created!</h3>
                  <p className="text-zinc-400">Your new token is now in your wallet.</p>
                </div>
                
                <div className="bg-zinc-950/50 rounded-xl p-4 text-left space-y-3">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Mint Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-black/30 p-2 rounded text-sm font-mono text-purple-400 break-all">
                        {createdToken?.mint}
                      </code>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Amount Minted</label>
                    <div className="text-white font-mono text-lg mt-1">
                      {parseInt(createdToken?.amount || '0').toLocaleString()} {formData.symbol}
                    </div>
                  </div>
                </div>

                <Button onClick={reset} variant="secondary" fullWidth>
                  Create Another Token
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Info / Logs Section */}
        <div className="space-y-6">
          <Card className="p-6 border-zinc-800 bg-zinc-900/30">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FiLayers className="text-purple-500" />
              Process Logs
            </h3>
            <div className="space-y-2 font-mono text-xs h-[300px] overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-zinc-600 italic">Waiting to start...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-2 text-zinc-400">
                    <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 border-blue-500/10 bg-blue-500/5">
            <div className="flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="text-sm text-blue-200/80">
                <p className="font-semibold text-blue-200 mb-1">Note on Metadata</p>
                <p>
                  This tool creates a standard SPL Token. To add a logo and name that appears in all wallets, you would typically need to create a Metaplex Metadata account.
                </p>
                <p className="mt-2 opacity-60">
                  (Metadata support coming soon)
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
