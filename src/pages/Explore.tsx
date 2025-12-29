import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icons, Badge } from '../components/ui/index';

interface Project {
  id: string;
  name: string;
  description: string;
  category: 'defi' | 'nft' | 'tool' | 'game' | 'dao';
  url: string;
  logo?: string;
  tags: string[];
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: '1',
    name: 'Solana Faucet',
    description: 'Request free devnet SOL for testing your applications. Essential tool for any Solana developer.',
    category: 'tool',
    url: 'https://faucet.solana.com/',
    tags: ['Faucet', 'Essential'],
    featured: true,
  },
  {
    id: '2',
    name: 'SolFaucet',
    description: 'Alternative devnet faucet with higher limits. Great backup when the official faucet is rate limited.',
    category: 'tool',
    url: 'https://solfaucet.com/',
    tags: ['Faucet', 'Alternative'],
  },
  {
    id: '3',
    name: 'Solana Explorer',
    description: 'Official block explorer to view transactions, accounts, and programs on devnet.',
    category: 'tool',
    url: 'https://explorer.solana.com/?cluster=devnet',
    tags: ['Explorer', 'Essential'],
    featured: true,
  },
  {
    id: '4',
    name: 'SolScan (Devnet)',
    description: 'Feature-rich block explorer with token analytics, NFT viewer, and DeFi dashboard.',
    category: 'tool',
    url: 'https://solscan.io/?cluster=devnet',
    tags: ['Explorer', 'Analytics'],
  },
  {
    id: '5',
    name: 'Anchor Playground',
    description: 'Browser-based IDE for building Solana programs with Anchor framework. No setup required.',
    category: 'tool',
    url: 'https://beta.solpg.io/',
    tags: ['IDE', 'Development'],
    featured: true,
  },
  {
    id: '6',
    name: 'Metaplex',
    description: 'Create, sell, and manage NFTs on Solana. Test your NFT projects on devnet.',
    category: 'nft',
    url: 'https://www.metaplex.com/',
    tags: ['NFT', 'Marketplace'],
  },
  {
    id: '7',
    name: 'Orca (Devnet)',
    description: 'Leading DEX on Solana. Swap tokens and provide liquidity on devnet.',
    category: 'defi',
    url: 'https://www.orca.so/',
    tags: ['DEX', 'Swap'],
  },
  {
    id: '8',
    name: 'Raydium',
    description: 'AMM and liquidity provider. Test DeFi integrations on devnet.',
    category: 'defi',
    url: 'https://raydium.io/',
    tags: ['AMM', 'DeFi'],
  },
  {
    id: '9',
    name: 'Jupiter Aggregator',
    description: 'Best swap rates by aggregating all DEXs. Essential for DeFi testing.',
    category: 'defi',
    url: 'https://jup.ag/',
    tags: ['Aggregator', 'Swap'],
    featured: true,
  },
  {
    id: '10',
    name: 'Phantom Wallet',
    description: 'Popular Solana wallet. Connect to dApps and test wallet integrations.',
    category: 'tool',
    url: 'https://phantom.app/',
    tags: ['Wallet', 'Essential'],
  },
  {
    id: '11',
    name: 'Solana Cookbook',
    description: 'Developer resource with code snippets and guides for building on Solana.',
    category: 'tool',
    url: 'https://solanacookbook.com/',
    tags: ['Docs', 'Learning'],
  },
  {
    id: '12',
    name: 'Realms DAO',
    description: 'Create and manage DAOs on Solana. Test governance mechanisms.',
    category: 'dao',
    url: 'https://realms.today/',
    tags: ['DAO', 'Governance'],
  },
  {
    id: '13',
    name: 'Magic Eden',
    description: 'Leading NFT marketplace on Solana. Explore and test NFT trading.',
    category: 'nft',
    url: 'https://magiceden.io/',
    tags: ['NFT', 'Marketplace'],
  },
  {
    id: '14',
    name: 'Squads Protocol',
    description: 'Multisig and smart account infrastructure. Test secure transactions.',
    category: 'tool',
    url: 'https://squads.so/',
    tags: ['Multisig', 'Security'],
  },
  {
    id: '15',
    name: 'Helius',
    description: 'RPC provider and developer tools. APIs for NFTs, webhooks, and more.',
    category: 'tool',
    url: 'https://helius.dev/',
    tags: ['RPC', 'API'],
  },
];

const categories = [
  { id: 'all', label: 'All Projects', icon: '🌐' },
  { id: 'tool', label: 'Tools', icon: '🛠️' },
  { id: 'defi', label: 'DeFi', icon: '💰' },
  { id: 'nft', label: 'NFT', icon: '🎨' },
  { id: 'dao', label: 'DAO', icon: '🏛️' },
  { id: 'game', label: 'Games', icon: '🎮' },
];

const categoryColors: Record<string, string> = {
  tool: 'from-blue-500 to-cyan-500',
  defi: 'from-green-500 to-emerald-500',
  nft: 'from-purple-500 to-pink-500',
  dao: 'from-orange-500 to-yellow-500',
  game: 'from-red-500 to-pink-500',
};

function ProjectCard({ project }: { project: Project }) {
  const gradient = categoryColors[project.category] || 'from-zinc-500 to-zinc-600';
  
  return (
    <Card variant="interactive" padding="none" className="group">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5"
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {project.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                {project.name}
              </h3>
              {project.featured && (
                <Badge variant="purple">Featured</Badge>
              )}
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-zinc-600 group-hover:text-purple-400 transition-colors">
            {Icons.external}
          </div>
        </div>
      </a>
    </Card>
  );
}

export function Explore() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredProjects = projects.filter(p => p.featured);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Explore Projects</h1>
        <p className="text-zinc-500">Discover dApps and tools for Solana development</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search projects, tools, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
        />
      </div>

      {/* Featured Section */}
      {selectedCategory === 'all' && !searchQuery && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-500">⭐</span> Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${selectedCategory === category.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-white'
              }
            `}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {selectedCategory === 'all' ? 'All Projects' : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <span className="text-sm text-zinc-500">{filteredProjects.length} projects</span>
        </div>

        {filteredProjects.length === 0 ? (
          <Card variant="glass" padding="lg">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium">No projects found</p>
              <p className="text-sm text-zinc-600 mt-1">
                Try adjusting your search or filter
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects
              .filter(p => selectedCategory !== 'all' || !searchQuery ? true : !p.featured)
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        )}
      </div>

      {/* Submit Project CTA */}
      <Card variant="gradient" padding="lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-400/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🚀</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold text-white mb-1">Have a project to showcase?</h3>
            <p className="text-sm text-zinc-400">
              Submit your Solana devnet project to be featured in our explorer.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.open('https://github.com/ap42213/fakesol/issues/new', '_blank')}
            icon={Icons.external}
          >
            Submit Project
          </Button>
        </div>
      </Card>

      {/* Info Card */}
      <Card variant="glass" padding="md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-zinc-300 font-medium">Testing on Devnet</p>
            <p className="text-xs text-zinc-500 mt-1">
              All listed projects support Solana devnet. Use your FakeSOL wallet to interact with these 
              dApps using test SOL. Remember, devnet tokens have no real value and are for testing only.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
