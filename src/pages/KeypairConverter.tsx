import { useState, useEffect } from 'react';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge, CopyButton } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiRefreshCw, FiKey, FiCode, FiHash, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

type KeyFormat = 'base58' | 'json' | 'hex' | 'unknown';

export function KeypairConverter() {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState<KeyFormat>('unknown');
  const [error, setError] = useState<string | null>(null);
  
  const [outputs, setOutputs] = useState({
    base58: '',
    json: '',
    hex: ''
  });

  const detectAndConvert = (value: string) => {
    setError(null);
    const trimmed = value.trim();
    
    if (!trimmed) {
      setFormat('unknown');
      setOutputs({ base58: '', json: '', hex: '' });
      return;
    }

    let secretKey: Uint8Array | null = null;

    try {
      // 1. Try JSON Array [1, 2, 3...]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            secretKey = new Uint8Array(parsed);
            setFormat('json');
          }
        } catch {
          // Not valid JSON
        }
      }

      // 2. Try Hex (0x...)
      if (!secretKey && /^[0-9a-fA-F]+$/.test(trimmed.replace(/^0x/, ''))) {
        // Check length - 64 bytes = 128 hex chars
        const hexString = trimmed.replace(/^0x/, '');
        if (hexString.length === 128) {
          const bytes = new Uint8Array(64);
          for (let i = 0; i < 64; i++) {
            bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
          }
          secretKey = bytes;
          setFormat('hex');
        }
      }

      // 3. Try Base58
      if (!secretKey) {
        try {
          const decoded = bs58.decode(trimmed);
          if (decoded.length === 64) {
            secretKey = decoded;
            setFormat('base58');
          }
        } catch {
          // Not valid Base58
        }
      }

      if (secretKey) {
        if (secretKey.length !== 64) {
          throw new Error(`Invalid key length: ${secretKey.length} bytes. Expected 64 bytes.`);
        }

        // Verify it's a valid keypair
        const keypair = Keypair.fromSecretKey(secretKey);

        setOutputs({
          base58: bs58.encode(secretKey),
          json: JSON.stringify(Array.from(secretKey)),
          hex: Buffer.from(secretKey).toString('hex')
        });
      } else {
        throw new Error('Could not detect key format or invalid key.');
      }

    } catch (err: any) {
      setError(err.message);
      setFormat('unknown');
      setOutputs({ base58: '', json: '', hex: '' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      detectAndConvert(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const generateNew = () => {
    const kp = Keypair.generate();
    setInput(bs58.encode(kp.secretKey));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SEO 
        title="Keypair Converter - FakeSOL" 
        description="Convert Solana private keys between Base58, JSON Array, and Hex formats."
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Keypair Converter</h1>
          <p className="text-zinc-400">Convert private keys between different formats instantly.</p>
        </div>
        <Button variant="secondary" onClick={generateNew} icon={<FiRefreshCw />}>
          Generate Random
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="p-6 border-zinc-800 bg-zinc-900/50">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Input Private Key
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your private key here (Base58, JSON, or Hex)..."
              className="w-full h-40 bg-black/20 border border-zinc-800 rounded-xl p-4 text-zinc-300 font-mono text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Detected Format:</span>
                {format !== 'unknown' && (
                  <Badge variant="purple" className="uppercase">
                    {format}
                  </Badge>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <FiAlertTriangle />
                  <span>{error}</span>
                </div>
              )}
              {!error && format !== 'unknown' && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <FiCheckCircle />
                  <span>Valid Keypair</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 border-yellow-500/10 bg-yellow-500/5">
            <div className="flex gap-3">
              <FiAlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <div className="text-sm text-yellow-200/80">
                <p className="font-semibold text-yellow-200 mb-1">Security Warning</p>
                <p>
                  Never paste your <strong>Mainnet</strong> private keys into any website. 
                  This tool runs entirely in your browser, but it is good practice to only use this for Devnet/Testnet keys.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card className="p-6 border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <FiKey className="text-purple-500" />
                Base58 (Phantom/Solflare)
              </label>
              <CopyButton text={outputs.base58} />
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
              <code className="text-sm font-mono text-zinc-300 break-all block">
                {outputs.base58 || <span className="text-zinc-700">Waiting for input...</span>}
              </code>
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <FiCode className="text-blue-500" />
                JSON Array (Solana CLI / id.json)
              </label>
              <CopyButton text={outputs.json} />
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
              <code className="text-sm font-mono text-zinc-300 break-all block max-h-32 overflow-y-auto custom-scrollbar">
                {outputs.json || <span className="text-zinc-700">Waiting for input...</span>}
              </code>
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <FiHash className="text-green-500" />
                Hex String (Web3.js / Ethereum-style)
              </label>
              <CopyButton text={outputs.hex} />
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
              <code className="text-sm font-mono text-zinc-300 break-all block">
                {outputs.hex || <span className="text-zinc-700">Waiting for input...</span>}
              </code>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
