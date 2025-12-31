import { useState } from 'react';
import { Connection, Transaction, VersionedTransaction, Message } from '@solana/web3.js';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, Icons } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiActivity, FiSearch, FiTerminal, FiCheckCircle, FiXCircle, FiCpu } from 'react-icons/fi';

export function TransactionDecoder() {
  const { connection } = useWalletStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const trimmed = input.trim();
      
      // Case 1: Transaction Signature (Base58, usually 87-88 chars)
      if (trimmed.length > 80 && !trimmed.includes('=')) {
        try {
          const tx = await connection.getTransaction(trimmed, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
          });
          
          if (!tx) {
            throw new Error('Transaction not found on Devnet');
          }

          setResult({
            type: 'on-chain',
            status: tx.meta?.err ? 'failed' : 'success',
            logs: tx.meta?.logMessages || [],
            fee: tx.meta?.fee,
            slot: tx.slot,
            computeUnits: tx.meta?.computeUnitsConsumed,
            accounts: tx.transaction.message.staticAccountKeys.map(k => k.toBase58())
          });
          setIsLoading(false);
          return;
        } catch (err) {
          // If getTransaction fails, it might not be a signature, continue to try decoding as base64
          console.log('Not a signature or not found:', err);
        }
      }

      // Case 2: Base64 Encoded Transaction (Simulation)
      try {
        const buffer = Buffer.from(trimmed, 'base64');
        let transaction;
        
        try {
            transaction = VersionedTransaction.deserialize(buffer);
        } catch {
            transaction = Transaction.from(buffer);
        }

        const simulation = await connection.simulateTransaction(transaction);
        
        setResult({
          type: 'simulation',
          status: simulation.value.err ? 'failed' : 'success',
          logs: simulation.value.logs || [],
          units: simulation.value.unitsConsumed,
          error: simulation.value.err
        });

      } catch (err: any) {
        throw new Error('Invalid transaction format. Please provide a valid Signature or Base64 string.');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SEO 
        title="Transaction Decoder - FakeSOL" 
        description="Decode and simulate Solana transactions. Debug Devnet errors instantly."
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transaction Decoder</h1>
          <p className="text-zinc-400">Debug transactions by Signature or Base64 simulation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-3">
          <Card className="p-6 border-zinc-800 bg-zinc-900/50">
            <form onSubmit={handleDecode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Transaction Signature OR Base64
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste signature (5M...) or base64 transaction..."
                      className="font-mono"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isLoading || !input}
                    icon={isLoading ? <FiActivity className="animate-spin" /> : <FiSearch />}
                  >
                    {isLoading ? 'Processing...' : 'Decode'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Results Section */}
        {error && (
          <div className="lg:col-span-3">
            <Card className="p-6 border-red-500/20 bg-red-500/5 text-red-400 flex items-center gap-3">
              <FiXCircle className="w-6 h-6" />
              {error}
            </Card>
          </div>
        )}

        {result && (
          <>
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 border-zinc-800 bg-zinc-900/30">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <FiActivity className="text-purple-500" />
                  Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Status</label>
                    <div className="mt-1">
                      {result.status === 'success' ? (
                        <Badge variant="success" className="px-3 py-1">
                          <FiCheckCircle className="w-3 h-3 mr-1" /> Success
                        </Badge>
                      ) : (
                        <Badge variant="error" className="px-3 py-1">
                          <FiXCircle className="w-3 h-3 mr-1" /> Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Type</label>
                    <div className="text-zinc-300 mt-1 capitalize">
                      {result.type === 'on-chain' ? 'On-Chain History' : 'Local Simulation'}
                    </div>
                  </div>

                  {result.computeUnits !== undefined && (
                    <div>
                      <label className="text-xs text-zinc-500 uppercase font-bold">Compute Units</label>
                      <div className="text-zinc-300 mt-1 font-mono">
                        {result.computeUnits.toLocaleString()} CU
                      </div>
                    </div>
                  )}

                  {result.fee !== undefined && (
                    <div>
                      <label className="text-xs text-zinc-500 uppercase font-bold">Fee</label>
                      <div className="text-zinc-300 mt-1 font-mono">
                        {(result.fee / 1000000000).toFixed(6)} SOL
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-zinc-800 bg-zinc-900/30">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <FiTerminal className="text-green-500" />
                  Program Logs
                </h3>
                <div className="bg-black/50 rounded-xl p-4 font-mono text-xs space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {result.logs.map((log: string, i: number) => {
                    let color = 'text-zinc-400';
                    if (log.includes('Error') || log.includes('failed')) color = 'text-red-400';
                    if (log.includes('success')) color = 'text-green-400';
                    if (log.startsWith('Program log:')) color = 'text-blue-300';
                    
                    return (
                      <div key={i} className={`${color} break-all`}>
                        <span className="text-zinc-700 mr-2">{i + 1}</span>
                        {log}
                      </div>
                    );
                  })}
                  {result.logs.length === 0 && (
                    <span className="text-zinc-600 italic">No logs available</span>
                  )}
                </div>
              </Card>

              {result.accounts && (
                <Card className="p-6 border-zinc-800 bg-zinc-900/30">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <FiCpu className="text-orange-500" />
                    Accounts Involved
                  </h3>
                  <div className="space-y-2">
                    {result.accounts.map((acc: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-600 w-6 text-right">{i + 1}</span>
                        <code className="bg-black/30 px-2 py-1 rounded text-zinc-300 font-mono flex-1 break-all">
                          {acc}
                        </code>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
