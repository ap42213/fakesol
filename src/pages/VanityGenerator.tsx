import { useState, useRef } from 'react';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CopyButton, useToast } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiSearch, FiPlay, FiPause, FiSave, FiCpu, FiAlertTriangle } from 'react-icons/fi';

export function VanityGenerator() {
  const { showToast } = useToast();
  
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [foundKeypair, setFoundKeypair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [speed, setSpeed] = useState(0);
  
  const searchRef = useRef<boolean>(false);
  const attemptsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const validateInput = (str: string) => {
    // Base58 characters only: 1-9, A-H, J-N, P-Z, a-k, m-z
    return /^[1-9A-HJ-NP-Za-km-z]*$/.test(str);
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (validateInput(val)) setPrefix(val);
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (validateInput(val)) setSuffix(val);
  };

  const estimateDifficulty = () => {
    const len = prefix.length + suffix.length;
    if (len === 0) return 'Instant';
    const combinations = Math.pow(58, len);
    if (combinations < 1000) return 'Instant';
    if (combinations < 100000) return 'Easy (< 1s)';
    if (combinations < 5000000) return 'Medium (Seconds)';
    if (combinations < 500000000) return 'Hard (Minutes)';
    return 'Very Hard (Hours/Days)';
  };

  const startSearch = () => {
    if (!prefix && !suffix) {
      showToast('Please enter a prefix or suffix', 'error');
      return;
    }
    
    // Case sensitivity warning
    if (prefix.length + suffix.length > 5) {
       const confirm = window.confirm('Long patterns can take a very long time. Are you sure?');
       if (!confirm) return;
    }

    setIsSearching(true);
    setFoundKeypair(null);
    setAttempts(0);
    setSpeed(0);
    
    searchRef.current = true;
    attemptsRef.current = 0;
    startTimeRef.current = Date.now();

    // Start the loop
    searchLoop();
  };

  const stopSearch = () => {
    searchRef.current = false;
    setIsSearching(false);
  };

  const searchLoop = () => {
    if (!searchRef.current) return;

    const BATCH_SIZE = 500; // Generate 500 keys per frame to keep UI responsive
    let found = null;

    for (let i = 0; i < BATCH_SIZE; i++) {
      const kp = Keypair.generate();
      const pk = kp.publicKey.toBase58();

      if (pk.startsWith(prefix) && pk.endsWith(suffix)) {
        found = {
          publicKey: pk,
          secretKey: bs58.encode(kp.secretKey)
        };
        break;
      }
    }

    attemptsRef.current += BATCH_SIZE;
    setAttempts(attemptsRef.current);

    // Update speed every 1000 attempts approx
    if (attemptsRef.current % 2000 === 0) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setSpeed(Math.floor(attemptsRef.current / elapsed));
    }

    if (found) {
      setFoundKeypair(found);
      setIsSearching(false);
      searchRef.current = false;
      showToast('Vanity address found!', 'success');
    } else {
      // Schedule next batch
      setTimeout(searchLoop, 0);
    }
  };

  const handleSaveToWallet = () => {
    if (!foundKeypair) return;
    
    try {
      // Convert base58 secret key back to Uint8Array for import
      // const secretKeyBytes = bs58.decode(foundKeypair.secretKey);
      
      // For now, let's just copy to clipboard or show instructions, 
      // but we can try to auto-import if we had a direct method.
      
      navigator.clipboard.writeText(foundKeypair.secretKey);
      showToast('Secret Key copied to clipboard! Go to "Settings" or "Wallet" to import.', 'success');
    } catch (e) {
      showToast('Failed to save', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="Vanity Generator | FakeSOL" 
        description="Generate custom Solana wallet addresses with specific prefixes or suffixes." 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Vanity Generator
          </h1>
          <p className="text-gray-400 mt-2">Find a wallet address that starts or ends with your custom text.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Prefix (Start)</label>
                <Input 
                  value={prefix}
                  onChange={handlePrefixChange}
                  placeholder="Test..."
                  disabled={isSearching}
                />
                <p className="text-xs text-gray-500">Case-sensitive. Base58 chars only.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Suffix (End)</label>
                <Input 
                  value={suffix}
                  onChange={handleSuffixChange}
                  placeholder="...SOL"
                  disabled={isSearching}
                />
              </div>

              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-purple-400 font-medium">{estimateDifficulty()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Est. Speed:</span>
                  <span className="text-gray-300">~1,000 keys/sec</span>
                </div>
              </div>

              {!isSearching ? (
                <Button 
                  onClick={startSearch} 
                  className="w-full"
                  disabled={!prefix && !suffix}
                >
                  <FiPlay className="mr-2" /> Start Search
                </Button>
              ) : (
                <Button 
                  onClick={stopSearch} 
                  variant="danger"
                  className="w-full"
                >
                  <FiPause className="mr-2" /> Stop Search
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
              
              {isSearching && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
                  <FiCpu className="w-12 h-12 text-purple-500 animate-pulse" />
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-white">
                      {attempts.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">keys checked</div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Speed: {speed.toLocaleString()} keys/s
                  </div>
                </div>
              )}

              {!isSearching && !foundKeypair && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-12">
                  <FiSearch className="w-12 h-12 mb-4 opacity-20" />
                  <p>Enter a prefix or suffix to start searching</p>
                </div>
              )}

              {foundKeypair && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-full">
                      <FiSave className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-400">Match Found!</h4>
                      <p className="text-sm text-green-500/70">
                        Found after {attempts.toLocaleString()} attempts
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Public Key</label>
                      <div className="flex gap-2">
                        <Input readOnly value={foundKeypair.publicKey} />
                        <CopyButton text={foundKeypair.publicKey} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Secret Key (Base58)</label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={foundKeypair.secretKey} 
                          type="password"
                        />
                        <CopyButton text={foundKeypair.secretKey} />
                      </div>
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <FiAlertTriangle /> Save this immediately! It will be lost if you refresh.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <Button onClick={handleSaveToWallet} variant="secondary" className="w-full">
                      Copy Secret Key to Import
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
