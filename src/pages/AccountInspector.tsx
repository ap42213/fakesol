import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { AccountLayout, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, CopyButton, useToast } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiSearch, FiDatabase, FiCode } from 'react-icons/fi';

type AccountType = 'system' | 'token' | 'mint' | 'program' | 'unknown';

interface AccountData {
  address: string;
  type: AccountType;
  owner: string;
  lamports: number;
  executable: boolean;
  rentEpoch?: number;
  space: number;
  data: any; // Parsed data or raw string
}

export function AccountInspector() {
  const { connection } = useWalletStore();
  const { showToast } = useToast();
  
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsLoading(true);
    setAccountData(null);

    try {
      let pubKey: PublicKey;
      try {
        pubKey = new PublicKey(address);
      } catch {
        throw new Error('Invalid address format');
      }

      const info = await connection.getAccountInfo(pubKey);
      
      if (!info) {
        throw new Error('Account not found on Devnet');
      }

      let type: AccountType = 'unknown';
      let parsedData: any = null;

      // 1. Check System Account
      if (info.owner.equals(new PublicKey('11111111111111111111111111111111'))) {
        type = 'system';
        parsedData = { status: 'System Account (Native SOL)' };
      }
      // 2. Check Token Program
      else if (info.owner.equals(TOKEN_PROGRAM_ID)) {
        try {
          if (info.data.length === AccountLayout.span) {
            type = 'token';
            const decoded = AccountLayout.decode(info.data);
            parsedData = {
              mint: decoded.mint.toBase58(),
              owner: decoded.owner.toBase58(),
              amount: decoded.amount.toString(),
              delegate: decoded.delegateOption ? decoded.delegate.toBase58() : null,
              state: decoded.state,
              isNative: decoded.isNativeOption ? decoded.isNative.toString() : false,
              delegatedAmount: decoded.delegatedAmount.toString(),
              closeAuthority: decoded.closeAuthorityOption ? decoded.closeAuthority.toBase58() : null,
            };
          } else if (info.data.length === MintLayout.span) {
            type = 'mint';
            const decoded = MintLayout.decode(info.data);
            parsedData = {
              mintAuthority: decoded.mintAuthorityOption ? decoded.mintAuthority.toBase58() : null,
              supply: decoded.supply.toString(),
              decimals: decoded.decimals,
              isInitialized: decoded.isInitialized,
              freezeAuthority: decoded.freezeAuthorityOption ? decoded.freezeAuthority.toBase58() : null,
            };
          } else {
            type = 'program';
            parsedData = { note: 'Unknown Token Program Account' };
          }
        } catch (e) {
          console.error('Failed to decode token data', e);
        }
      }
      // 3. Executable (Program)
      else if (info.executable) {
        type = 'program';
        parsedData = { status: 'Executable Program Account' };
      }

      // Fallback for raw data
      if (!parsedData) {
        parsedData = {
          hex: info.data.toString('hex'),
          base64: info.data.toString('base64'),
          utf8: info.data.toString('utf-8').replace(/[\x00-\x1F\x7F-\x9F]/g, '.') // Printable chars only
        };
      }

      setAccountData({
        address: pubKey.toBase58(),
        type,
        owner: info.owner.toBase58(),
        lamports: info.lamports,
        executable: info.executable,
        space: info.data.length,
        data: parsedData
      });

    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <SEO 
        title="Account Inspector | FakeSOL" 
        description="Inspect and deserialize Solana account data on Devnet." 
      />

      <div>
        <h1 className="text-2xl font-bold text-white">Account Inspector</h1>
        <p className="text-zinc-500">View raw and deserialized account data</p>
      </div>

      <Card variant="glass" padding="lg">
        <form onSubmit={handleInspect} className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter account address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={!address || isLoading}
            className="h-[42px]" // Match input height
          >
            {isLoading ? 'Loading...' : <><FiSearch className="mr-2" /> Inspect</>}
          </Button>
        </form>
      </Card>

      {accountData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meta Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card variant="gradient" padding="lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-200 mb-2">
                  <FiDatabase className="w-5 h-5" />
                  <h3 className="font-semibold">Account Info</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-purple-200/70 uppercase tracking-wider">Type</p>
                    <Badge variant={
                      accountData.type === 'system' ? 'blue' :
                      accountData.type === 'token' ? 'success' :
                      accountData.type === 'mint' ? 'warning' :
                      accountData.type === 'program' ? 'purple' : 'default'
                    }>
                      {accountData.type.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-purple-200/70 uppercase tracking-wider">Balance</p>
                    <p className="text-white font-mono">{(accountData.lamports / 1e9).toFixed(9)} SOL</p>
                  </div>

                  <div>
                    <p className="text-xs text-purple-200/70 uppercase tracking-wider">Space</p>
                    <p className="text-white font-mono">{accountData.space} bytes</p>
                  </div>

                  <div>
                    <p className="text-xs text-purple-200/70 uppercase tracking-wider">Owner</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-xs font-mono truncate">{accountData.owner}</p>
                      <CopyButton text={accountData.owner} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-purple-200/70 uppercase tracking-wider">Executable</p>
                    <p className="text-white font-mono">{accountData.executable ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Data View */}
          <div className="lg:col-span-2">
            <Card variant="glass" padding="lg" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-300">
                  <FiCode className="w-5 h-5" />
                  <h3 className="font-semibold">Account Data</h3>
                </div>
                <CopyButton text={JSON.stringify(accountData.data, null, 2)} />
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-zinc-800 overflow-auto max-h-[500px] custom-scrollbar">
                <pre className="text-xs font-mono text-green-400">
                  {JSON.stringify(accountData.data, null, 2)}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
