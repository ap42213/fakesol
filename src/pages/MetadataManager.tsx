import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda, fetchMetadataFromSeeds } from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, useToast } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiEdit3, FiSave, FiSearch } from 'react-icons/fi';

export function MetadataManager() {
  const { connection, keypair } = useWalletStore();
  const { showToast } = useToast();
  
  const [mintAddress, setMintAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [mode, setMode] = useState<'create' | 'update' | 'view'>('view');
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    uri: '',
  });

  // Initialize Umi
  const umi = createUmi(connection.rpcEndpoint);
  
  // Setup signer if wallet is connected
  useEffect(() => {
    if (keypair) {
      const umiKeypair = fromWeb3JsKeypair(keypair);
      const signer = createSignerFromKeypair(umi, umiKeypair);
      umi.use(signerIdentity(signer));
    }
  }, [keypair, umi]);

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mintAddress) return;

    setIsFetching(true);
    setMode('view');
    
    try {
      // Validate address
      new PublicKey(mintAddress);
      
      const mint = fromWeb3JsPublicKey(new PublicKey(mintAddress));
      // const metadataPda = findMetadataPda(umi, { mint });
      
      try {
        const metadata = await fetchMetadataFromSeeds(umi, { mint });
        setFormData({
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
        });
        setMode('update');
        showToast('Metadata found!', 'success');
      } catch (err) {
        // Metadata doesn't exist
        setFormData({ name: '', symbol: '', uri: '' });
        setMode('create');
        showToast('No metadata found. You can create it now.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid Mint Address', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!keypair) {
      showToast('Please connect your wallet', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const mint = fromWeb3JsPublicKey(new PublicKey(mintAddress));
      
      if (mode === 'create') {
        await createMetadataAccountV3(umi, {
          mint,
          mintAuthority: umi.identity,
          payer: umi.identity,
          data: {
            name: formData.name,
            symbol: formData.symbol,
            uri: formData.uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        }).sendAndConfirm(umi);
        
        showToast('Metadata created successfully!', 'success');
      } else if (mode === 'update') {
        const metadataPda = findMetadataPda(umi, { mint });
        
        await updateMetadataAccountV2(umi, {
          metadata: metadataPda,
          updateAuthority: umi.identity,
          data: {
            name: formData.name,
            symbol: formData.symbol,
            uri: formData.uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
        }).sendAndConfirm(umi);
        
        showToast('Metadata updated successfully!', 'success');
      }
      
      setMode('update');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Transaction failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <SEO 
        title="Metadata Manager | FakeSOL" 
        description="Create and update Metaplex metadata for your SPL tokens." 
      />

      <div>
        <h1 className="text-2xl font-bold text-white">Metadata Manager</h1>
        <p className="text-zinc-500">Manage token name, symbol, and logo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search / Input */}
        <div className="lg:col-span-1 space-y-6">
          <Card variant="glass" padding="lg">
            <form onSubmit={handleFetch} className="space-y-4">
              <Input
                label="Mint Address"
                placeholder="Enter token mint address..."
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="secondary" 
                fullWidth
                disabled={!mintAddress || isFetching}
              >
                {isFetching ? 'Searching...' : <><FiSearch className="mr-2" /> Find Metadata</>}
              </Button>
            </form>
          </Card>

          <Card variant="gradient" padding="md">
            <h3 className="text-sm font-medium text-white mb-2">Tips</h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>• You must be the <strong>Mint Authority</strong> or <strong>Update Authority</strong> to make changes.</li>
              <li>• The URI should point to a JSON file (standard Metaplex format).</li>
              <li>• Use IPFS or Arweave for permanent storage.</li>
            </ul>
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <Card variant="glass" padding="lg" className={mode === 'view' && !isFetching ? 'opacity-50 pointer-events-none' : ''}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FiEdit3 className="text-purple-400" />
                <h3 className="font-semibold text-white">
                  {mode === 'create' ? 'Create Metadata' : 'Update Metadata'}
                </h3>
              </div>
              {mode !== 'view' && (
                <Badge variant={mode === 'create' ? 'success' : 'warning'}>
                  {mode.toUpperCase()}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Token Name"
                  placeholder="e.g. My Token"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Symbol"
                  placeholder="e.g. TKN"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                />
              </div>

              <Input
                label="Metadata URI"
                placeholder="https://arweave.net/..."
                value={formData.uri}
                onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
              />

              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  variant="primary" 
                  fullWidth
                  disabled={mode === 'view' || isLoading}
                >
                  {isLoading ? 'Processing...' : (
                    <><FiSave className="mr-2" /> {mode === 'create' ? 'Create Metadata' : 'Update Metadata'}</>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
