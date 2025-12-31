import { useState, useEffect } from 'react';
import { Connection } from '@solana/web3.js';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiActivity, FiWifi, FiServer, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface RpcEndpoint {
  name: string;
  url: string;
  status: 'unknown' | 'checking' | 'online' | 'offline';
  latency: number | null;
  slot: number | null;
  version: string | null;
}

const DEFAULT_ENDPOINTS: RpcEndpoint[] = [
  { name: 'Solana Foundation', url: 'https://api.devnet.solana.com', status: 'unknown', latency: null, slot: null, version: null },
  { name: 'Helius (Devnet)', url: 'https://devnet.helius-rpc.com/?api-key=123', status: 'unknown', latency: null, slot: null, version: null }, // Placeholder key, might fail auth but we can check connectivity
  { name: 'QuickNode (Devnet)', url: 'https://example.solana-devnet.quiknode.pro/123/', status: 'unknown', latency: null, slot: null, version: null }, // Placeholder
  { name: 'GenesysGo', url: 'https://devnet.genesysgo.net/', status: 'unknown', latency: null, slot: null, version: null },
];

// Filter out placeholders for the public demo to avoid confusion, or keep them to show failure states
const ACTIVE_ENDPOINTS = [
  { name: 'Solana Foundation', url: 'https://api.devnet.solana.com', status: 'unknown', latency: null, slot: null, version: null },
  // Add more public ones if known, otherwise user can add custom
];

export function RpcHealth() {
  const [endpoints, setEndpoints] = useState<RpcEndpoint[]>(ACTIVE_ENDPOINTS as RpcEndpoint[]);
  const [isChecking, setIsChecking] = useState(false);

  const checkEndpoint = async (index: number) => {
    const endpoint = endpoints[index];
    
    setEndpoints(prev => {
      const next = [...prev];
      next[index] = { ...endpoint, status: 'checking' };
      return next;
    });

    const start = Date.now();
    try {
      const connection = new Connection(endpoint.url, 'confirmed');
      
      // Parallel requests for version and slot
      const [version, slot] = await Promise.all([
        connection.getVersion().catch(() => ({ 'solana-core': 'Unknown' })),
        connection.getSlot().catch(() => 0)
      ]);

      const latency = Date.now() - start;

      setEndpoints(prev => {
        const next = [...prev];
        next[index] = { 
          ...endpoint, 
          status: 'online', 
          latency, 
          slot, 
          version: version['solana-core'] 
        };
        return next;
      });
    } catch (e) {
      setEndpoints(prev => {
        const next = [...prev];
        next[index] = { ...endpoint, status: 'offline', latency: null, slot: null, version: null };
        return next;
      });
    }
  };

  const checkAll = async () => {
    setIsChecking(true);
    await Promise.all(endpoints.map((_, i) => checkEndpoint(i)));
    setIsChecking(false);
  };

  useEffect(() => {
    checkAll();
  }, []);

  const getLatencyColor = (ms: number) => {
    if (ms < 200) return 'text-green-400';
    if (ms < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <SEO 
        title="RPC Health | FakeSOL" 
        description="Check the status and latency of Solana Devnet RPC endpoints." 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            RPC Health
          </h1>
          <p className="text-gray-400 mt-2">Monitor Devnet node status and latency.</p>
        </div>
        <Button onClick={checkAll} disabled={isChecking}>
          <FiActivity className={`mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {endpoints.map((endpoint, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  endpoint.status === 'online' ? 'bg-green-500/20' : 
                  endpoint.status === 'offline' ? 'bg-red-500/20' : 'bg-gray-800'
                }`}>
                  <FiServer className={`w-6 h-6 ${
                    endpoint.status === 'online' ? 'text-green-500' : 
                    endpoint.status === 'offline' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{endpoint.name}</h3>
                  <p className="text-sm text-gray-500 font-mono truncate max-w-[200px] md:max-w-md">
                    {endpoint.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                {endpoint.status === 'checking' ? (
                  <Badge variant="warning">Checking...</Badge>
                ) : endpoint.status === 'offline' ? (
                  <Badge variant="danger">Offline</Badge>
                ) : endpoint.status === 'online' ? (
                  <>
                    <div className="hidden md:block">
                      <div className="text-xs text-gray-500">Version</div>
                      <div className="text-sm text-gray-300">{endpoint.version}</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs text-gray-500">Current Slot</div>
                      <div className="text-sm font-mono text-purple-400">
                        {endpoint.slot?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Latency</div>
                      <div className={`text-sm font-bold ${getLatencyColor(endpoint.latency || 0)}`}>
                        {endpoint.latency}ms
                      </div>
                    </div>
                  </>
                ) : (
                  <Badge variant="secondary">Unknown</Badge>
                )}
              </div>
            </div>
            {endpoint.status === 'online' && (
              <div className="h-1 w-full bg-gray-800">
                <div 
                  className="h-full bg-green-500 transition-all duration-500" 
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Why does this matter?</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Solana Devnet can sometimes be unstable or congested. If your transactions are failing or 
            confirming slowly, try switching to a different RPC endpoint. Lower latency means faster 
            response times for your application.
          </p>
        </div>
      </Card>
    </div>
  );
}
