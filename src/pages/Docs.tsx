import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/SEO';
import { 
  FiBox, 
  FiCpu, 
  FiCode, 
  FiSearch,
  FiKey,
  FiFileText,
  FiTag
} from 'react-icons/fi';

const tools = [
  {
    id: 'token-creator',
    name: 'Token Creator',
    description: 'Create your own SPL tokens on Solana Devnet in seconds. No coding required.',
    icon: <FiBox className="w-6 h-6 text-purple-400" />,
    path: '/create-token',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'metadata-manager',
    name: 'Metadata Manager',
    description: 'Add names, symbols, and logos to your SPL tokens using Metaplex metadata.',
    icon: <FiTag className="w-6 h-6 text-blue-400" />,
    path: '/metadata',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'pda-calculator',
    name: 'PDA Calculator',
    description: 'Deterministically derive Program Derived Addresses (PDAs) with custom seeds.',
    icon: <FiCpu className="w-6 h-6 text-green-400" />,
    path: '/pda',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'account-inspector',
    name: 'Account Inspector',
    description: 'Deep dive into any account on Devnet. View raw data, owner, and state.',
    icon: <FiSearch className="w-6 h-6 text-orange-400" />,
    path: '/inspector',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'keypair-converter',
    name: 'Keypair Converter',
    description: 'Convert between Byte Array (JSON) and Base58 private key formats.',
    icon: <FiKey className="w-6 h-6 text-red-400" />,
    path: '/converter',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'transaction-decoder',
    name: 'Transaction Decoder',
    description: 'Decode base58 or base64 transaction data into human-readable format.',
    icon: <FiCode className="w-6 h-6 text-indigo-400" />,
    path: '/decoder',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'idl-viewer',
    name: 'IDL Viewer',
    description: 'Fetch and visualize Anchor IDLs to understand program instructions.',
    icon: <FiFileText className="w-6 h-6 text-teal-400" />,
    path: '/idl',
    color: 'from-teal-500 to-green-500'
  }
];

export function Docs() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-fadeIn">
      <SEO 
        title="Developer Tools | FakeSOL" 
        description="A suite of advanced tools for Solana developers." 
      />

      <div>
        <h1 className="text-2xl font-bold text-white">Developer Tools</h1>
        <p className="text-zinc-500">Essential utilities for building on Solana</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} variant="interactive" className="group h-full flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                <div className="text-white">
                  {tool.icon}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  {tool.description}
                </p>
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <Link to={tool.path}>
                <Button variant="secondary" fullWidth className="group-hover:bg-zinc-700 transition-colors">
                  Launch Tool
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
