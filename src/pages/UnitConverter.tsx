import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge, CopyButton } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiRefreshCw, FiArrowRight, FiArrowLeft, FiCopy } from 'react-icons/fi';

const LAMPORTS_PER_SOL = 1000000000;

export function UnitConverter() {
  const [sol, setSol] = useState<string>('1');
  const [lamports, setLamports] = useState<string>(LAMPORTS_PER_SOL.toString());
  const [lastEdited, setLastEdited] = useState<'sol' | 'lamports'>('sol');

  const handleSolChange = (value: string) => {
    setSol(value);
    setLastEdited('sol');
    
    if (value === '' || isNaN(Number(value))) {
      setLamports('');
      return;
    }

    // Use BigInt for precision if needed, but for display simple math is usually fine
    // For very large numbers or precise decimals, we might need a library like decimal.js
    // But for standard SOL/Lamport conversion:
    try {
      const val = parseFloat(value);
      const lamps = Math.floor(val * LAMPORTS_PER_SOL);
      setLamports(lamps.toString());
    } catch (e) {
      setLamports('Error');
    }
  };

  const handleLamportsChange = (value: string) => {
    setLamports(value);
    setLastEdited('lamports');

    if (value === '' || isNaN(Number(value))) {
      setSol('');
      return;
    }

    try {
      const val = parseInt(value);
      const s = val / LAMPORTS_PER_SOL;
      setSol(s.toString());
    } catch (e) {
      setSol('Error');
    }
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="Unit Converter | FakeSOL" 
        description="Convert between SOL and Lamports easily." 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Unit Converter
          </h1>
          <p className="text-gray-400 mt-2">Convert between SOL and Lamports</p>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-8">
          
          {/* SOL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">SOL</label>
            <div className="relative">
              <Input 
                value={sol}
                onChange={(e) => handleSolChange(e.target.value)}
                placeholder="1.0"
                type="number"
                step="0.000000001"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
                SOL
              </div>
            </div>
          </div>

          {/* Direction Indicator */}
          <div className="flex justify-center">
            <div className="bg-gray-800 p-2 rounded-full border border-gray-700">
              <FiRefreshCw className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          {/* Lamports Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Lamports</label>
            <div className="relative">
              <Input 
                value={lamports}
                onChange={(e) => handleLamportsChange(e.target.value)}
                placeholder="1000000000"
                type="number"
                step="1"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
                lamports
              </div>
            </div>
          </div>

          {/* Quick Copy */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500">SOL Value</div>
                <div className="font-mono text-sm truncate max-w-[120px]">{sol || '0'}</div>
              </div>
              <CopyButton text={sol || '0'} />
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500">Lamports Value</div>
                <div className="font-mono text-sm truncate max-w-[120px]">{lamports || '0'}</div>
              </div>
              <CopyButton text={lamports || '0'} />
            </div>
          </div>

        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Common Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: '1 SOL', val: 1000000000 },
              { label: '0.1 SOL', val: 100000000 },
              { label: '0.01 SOL', val: 10000000 },
              { label: 'Rent Exemption (approx)', val: 890880 },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-400">{item.val.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">lamports</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
