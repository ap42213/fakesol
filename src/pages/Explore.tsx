import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icons, Badge } from '../components/ui/index';
import { api } from '../lib/api';

interface Project {
  id: string;
  name: string;
  description: string;
  category: 'defi' | 'nft' | 'tool' | 'game' | 'dao';
  url: string;
  logo?: string;
  tags: string[];
  featured?: boolean;
  lookingForTesters?: boolean;
  incentive?: string;
  startsAt?: string;
  endsAt?: string;
  tasks?: string[];
  contact?: string;
}

const projects: Project[] = [];

const categories = [
  { id: 'all', label: 'All Projects', icon: '🌐' },
  { id: 'needs-testers', label: 'Needs Testers', icon: '🧪' },
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

function ProjectCard({ project, onDetails }: { project: Project; onDetails: (p: Project) => void }) {
  const gradient = categoryColors[project.category] || 'from-zinc-500 to-zinc-600';
  const isFresh = project.startsAt ? (Date.now() - new Date(project.startsAt).getTime()) / (1000 * 60 * 60 * 24) < 7 : false;
  
  return (
    <Card variant="interactive" padding="none" className="group">
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {project.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                {project.name}
              </h3>
              {project.featured && <Badge variant="purple">Featured</Badge>}
              {project.lookingForTesters && <Badge variant="success">Needs testers</Badge>}
              {isFresh && <Badge variant="warning">New</Badge>}
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            {project.incentive && (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                <span>🎁</span>
                <span>{project.incentive}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="text-zinc-500 flex items-center gap-2">
            <span>Category:</span>
            <span className="text-white capitalize">{project.category}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDetails(project)}
            >
              Details
            </Button>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-600/30 transition-colors"
            >
              Visit {Icons.external}
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Explore() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByNew, setSortByNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [customProjects, setCustomProjects] = useState<Project[]>([]);
  const [remoteProjects, setRemoteProjects] = useState<Project[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    url: '',
    description: '',
    category: 'tool',
    tags: '',
    lookingForTesters: true,
    incentive: '',
    contact: '',
    tasks: '',
    startsAt: '',
    endsAt: '',
  });

  const allProjects = remoteProjects.length > 0 ? [...remoteProjects, ...customProjects] : [...projects, ...customProjects];

  const filteredProjects = allProjects.filter((project) => {
    const matchesCategory = selectedCategory === 'all'
      ? true
      : selectedCategory === 'needs-testers'
        ? project.lookingForTesters
        : project.category === selectedCategory;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortByNew) return 0;
    const aDate = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const bDate = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    return bDate - aDate;
  });

  const featuredProjects = allProjects.filter(p => p.featured);
  const testerProjects = allProjects.filter(p => p.lookingForTesters);

  useEffect(() => {
    const load = async () => {
      const res = await api.getProjects();
      if (!res.error && res.data?.projects) {
        setRemoteProjects(res.data.projects as Project[]);
      }
    };
    load();
  }, []);

  const handleSubmitProject = () => {
    if (!form.name.trim() || !form.url.trim() || !form.description.trim()) {
      setFormError('Name, URL, and description are required');
      return;
    }

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const tasks = form.tasks
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newProject: Project = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      category: form.category as Project['category'],
      tags: tags.length ? tags : ['Community'],
      featured: false,
      lookingForTesters: form.lookingForTesters,
      incentive: form.incentive || undefined,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      tasks: tasks.length ? tasks : undefined,
      contact: form.contact || undefined,
    };

    // Try to persist to API first
    api.submitProject({
      name: newProject.name,
      url: newProject.url,
      description: newProject.description,
      category: newProject.category,
      tags: newProject.tags,
      lookingForTesters: newProject.lookingForTesters,
      incentive: newProject.incentive,
      startsAt: newProject.startsAt,
      endsAt: newProject.endsAt,
      tasks: newProject.tasks,
      contact: newProject.contact,
    }).then((res) => {
      if (!res.error && res.data && res.data.project) {
        const p = res.data.project as Project;
        setRemoteProjects((prev) => [p, ...prev]);
      } else {
        setCustomProjects((prev) => [newProject, ...prev]);
      }
    }).catch(() => {
      setCustomProjects((prev) => [newProject, ...prev]);
    });
    setForm({
      name: '',
      url: '',
      description: '',
      category: 'tool',
      tags: '',
      lookingForTesters: true,
      incentive: '',
      contact: '',
      tasks: '',
      startsAt: '',
      endsAt: '',
    });
    setFormError(null);
    setShowSubmit(false);
  };

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
              <ProjectCard key={project.id} project={project} onDetails={setSelectedProject} />
            ))}
          </div>
        </div>
      )}

      {/* Needs Testers Spotlight */}
      {selectedCategory === 'all' && testerProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">🧪</span> Projects looking for testers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testerProjects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} onDetails={setSelectedProject} />
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
        <button
          onClick={() => setSortByNew((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            sortByNew
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-white'
          }`}
        >
          🆕 New this week
        </button>
      </div>

      {/* Project Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {selectedCategory === 'all' ? 'All Projects' : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <span className="text-sm text-zinc-500">{sortedProjects.length} projects</span>
        </div>

        {sortedProjects.length === 0 ? (
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
            {sortedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onDetails={setSelectedProject} />
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
              Submit your Solana devnet project to be featured and find testers.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowSubmit(true)}
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

      {showSubmit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card variant="glass" padding="lg" className="max-w-3xl w-full relative">
            <button
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              onClick={() => setShowSubmit(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Submit a project</p>
                <h2 className="text-xl font-semibold text-white">List your devnet project for testers</h2>
              </div>

              {formError && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{formError}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Project name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">URL *</label>
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="tool">Tool</option>
                    <option value="defi">DeFi</option>
                    <option value="nft">NFT</option>
                    <option value="dao">DAO</option>
                    <option value="game">Game</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                    placeholder="dex, devnet, beta"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Incentive (optional)</label>
                  <input
                    value={form.incentive}
                    onChange={(e) => setForm({ ...form, incentive: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                    placeholder="Raffle, WL, bounty"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Contact (optional)</label>
                  <input
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                    placeholder="Discord/Telegram/Email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Starts (optional)</label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Ends (optional)</label>
                  <input
                    type="date"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Tester tasks (comma or new-line separated)</label>
                <textarea
                  value={form.tasks}
                  onChange={(e) => setForm({ ...form, tasks: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white h-24"
                  placeholder="Swap token on devnet\nSubmit feedback form"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.lookingForTesters}
                  onChange={(e) => setForm({ ...form, lookingForTesters: e.target.checked })}
                  className="accent-purple-500"
                />
                Actively looking for testers
              </label>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowSubmit(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmitProject}>Submit</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card variant="glass" padding="lg" className="max-w-2xl w-full relative">
            <button
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              onClick={() => setSelectedProject(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[selectedProject.category] || 'from-zinc-500 to-zinc-600'} flex items-center justify-center text-white font-bold text-lg`}>
                  {selectedProject.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-white">{selectedProject.name}</h2>
                    {selectedProject.featured && <Badge variant="purple">Featured</Badge>}
                    {selectedProject.lookingForTesters && <Badge variant="success">Needs testers</Badge>}
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">{selectedProject.description}</p>
                </div>
              </div>

              {selectedProject.incentive && (
                <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                  <span>🎁</span>
                  <span>{selectedProject.incentive}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                <span className="px-2 py-1 bg-zinc-800 rounded-lg">Category: {selectedProject.category}</span>
                {selectedProject.startsAt && <span className="px-2 py-1 bg-zinc-800 rounded-lg">Starts: {selectedProject.startsAt}</span>}
                {selectedProject.endsAt && <span className="px-2 py-1 bg-zinc-800 rounded-lg">Ends: {selectedProject.endsAt}</span>}
                {selectedProject.contact && <span className="px-2 py-1 bg-zinc-800 rounded-lg">Contact: {selectedProject.contact}</span>}
              </div>

              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white font-semibold">Suggested tester tasks</p>
                  <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                    {selectedProject.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={selectedProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Open project {Icons.external}
                </a>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const template = `Testing ${selectedProject.name}\n\nWhat I tested:\n- ${selectedProject.tasks?.join('\n- ') || 'Flow'}\n\nFeedback:\n- `;
                    navigator.clipboard.writeText(template);
                  }}
                >
                  Copy report template
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
