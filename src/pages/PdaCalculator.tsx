import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import * as buffer from 'buffer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, CopyButton, useToast } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiPlus, FiTrash2, FiAnchor } from 'react-icons/fi';

// Polyfill Buffer for browser environment if needed, though Vite usually handles this
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = buffer.Buffer;
}

type SeedType = 'string' | 'publicKey' | 'u8' | 'u64';

interface Seed {
  id: string;
  type: SeedType;
  value: string;
}

export function PdaCalculator() {
  const { showToast } = useToast();
  const [programId, setProgramId] = useState('');
  const [seeds, setSeeds] = useState<Seed[]>([
    { id: '1', type: 'string', value: '' }
  ]);
  const [result, setResult] = useState<{ pda: string; bump: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addSeed = () => {
    setSeeds([
      ...seeds,
      { id: Math.random().toString(36).substr(2, 9), type: 'string', value: '' }
    ]);
  };

  const removeSeed = (id: string) => {
    setSeeds(seeds.filter(s => s.id !== id));
  };

  const updateSeed = (id: string, field: keyof Seed, value: string) => {
    setSeeds(seeds.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculatePDA = () => {
    setError(null);
    setResult(null);

    try {
      if (!programId) throw new Error('Program ID is required');
      
      let progKey: PublicKey;
      try {
        progKey = new PublicKey(programId);
      } catch {
        throw new Error('Invalid Program ID');
      }

      const seedBuffers: Buffer[] = seeds.map((seed, index) => {
        if (!seed.value) throw new Error(`Seed #${index + 1} value is empty`);

        try {
          switch (seed.type) {
            case 'string':
              return Buffer.from(seed.value, 'utf-8');
            
            case 'publicKey':
              return new PublicKey(seed.value).toBuffer();
            
            case 'u8':
              const val8 = parseInt(seed.value);
              if (isNaN(val8) || val8 < 0 || val8 > 255) throw new Error(`Seed #${index + 1}: Invalid u8`);
              return Buffer.from([val8]);
            
            case 'u64':
              // Simple u64 handling (for very large numbers, might need BN)
              // Using BigInt to Buffer LE
              try {
                const val64 = BigInt(seed.value);
                const buf = Buffer.alloc(8);
                buf.writeBigUInt64LE(val64);
                return buf;
              } catch {
                throw new Error(`Seed #${index + 1}: Invalid u64`);
              }
            
            default:
              throw new Error('Unknown seed type');
          }
        } catch (e: any) {
          throw new Error(e.message || `Invalid value for Seed #${index + 1}`);
        }
      });

      const [pda, bump] = PublicKey.findProgramAddressSync(seedBuffers, progKey);

      setResult({
        pda: pda.toBase58(),
        bump
      });

    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <SEO 
        title="PDA Calculator | FakeSOL" 
        description="Calculate Solana Program Derived Addresses (PDAs) and bump seeds." 
      />

      <div>
        <h1 className="text-2xl font-bold text-white">PDA Calculator</h1>
        <p className="text-zinc-500">Derive program addresses from seeds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card variant="glass" padding="lg">
            <div className="space-y-6">
              <Input
                label="Program ID"
                placeholder="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">Seeds</label>
                  <Button size="sm" variant="secondary" onClick={addSeed}>
                    <FiPlus className="mr-1" /> Add Seed
                  </Button>
                </div>

                <div className="space-y-3">
                  {seeds.map((seed, index) => (
                    <div key={seed.id} className="flex gap-2 items-start bg-black/20 p-3 rounded-xl border border-zinc-800/50">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={seed.type}
                            onChange={(e) => updateSeed(seed.id, 'type', e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500"
                          >
                            <option value="string">String</option>
                            <option value="publicKey">PublicKey</option>
                            <option value="u8">u8 (Number)</option>
                            <option value="u64">u64 (Number)</option>
                          </select>
                          <span className="text-xs text-zinc-500 py-1">Seed #{index + 1}</span>
                        </div>
                        
                        <input
                          type="text"
                          value={seed.value}
                          onChange={(e) => updateSeed(seed.id, 'value', e.target.value)}
                          placeholder={
                            seed.type === 'string' ? 'e.g. "user-stats"' :
                            seed.type === 'publicKey' ? 'Base58 Address' :
                            seed.type === 'u8' ? '0-255' : 'Number'
                          }
                          className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
                        />
                      </div>
                      
                      {seeds.length > 1 && (
                        <button 
                          onClick={() => removeSeed(seed.id)}
                          className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                fullWidth 
                variant="primary" 
                onClick={calculatePDA}
                disabled={!programId}
              >
                Calculate Address
              </Button>
            </div>
          </Card>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          {result && (
            <Card variant="gradient" padding="lg">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-purple-200 mb-2">
                  <FiAnchor className="w-5 h-5" />
                  <h3 className="font-semibold">Calculation Result</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-purple-200/70 mb-1 uppercase tracking-wider">Derived Address (PDA)</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-white font-mono break-all">{result.pda}</code>
                      <CopyButton text={result.pda} />
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-purple-200/70 mb-1 uppercase tracking-wider">Bump Seed</p>
                    <div className="flex items-center gap-3">
                      <code className="text-2xl font-bold text-white font-mono">{result.bump}</code>
                      <Badge variant="success">Canonical</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {error && (
            <Card variant="glass" padding="lg" className="border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 text-red-400">
                <FiTrash2 className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </Card>
          )}

          <Card variant="glass" padding="md">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">How it works</h3>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="text-purple-500">•</span>
                PDAs are addresses derived deterministically from a Program ID and a set of seeds.
              </li>
              <li className="flex gap-2">
                <span className="text-purple-500">•</span>
                They have no private key, allowing the program to sign for them.
              </li>
              <li className="flex gap-2">
                <span className="text-purple-500">•</span>
                The "Bump" is an extra byte (0-255) added to push the address off the ed25519 curve.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
