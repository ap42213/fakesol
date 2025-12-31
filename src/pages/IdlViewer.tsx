import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/index';
import { SEO } from '../components/SEO';
import { FiUpload, FiCode, FiDatabase, FiAlertCircle, FiList, FiType } from 'react-icons/fi';

interface IdlInstruction {
  name: string;
  accounts: { name: string; isMut: boolean; isSigner: boolean }[];
  args: { name: string; type: any }[];
}

interface IdlAccount {
  name: string;
  type: { kind: string; fields: { name: string; type: any }[] };
}

interface Idl {
  version: string;
  name: string;
  instructions: IdlInstruction[];
  accounts?: IdlAccount[];
  types?: any[];
  errors?: any[];
}

export function IdlViewer() {
  const [jsonInput, setJsonInput] = useState('');
  const [idl, setIdl] = useState<Idl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instructions' | 'accounts' | 'types'>('instructions');

  const handleParse = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.name || !parsed.instructions) {
        throw new Error('Invalid Anchor IDL: Missing name or instructions');
      }
      setIdl(parsed);
    } catch (err: any) {
      setError(err.message);
      setIdl(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJsonInput(event.target.result as string);
        // Auto parse
        try {
          const parsed = JSON.parse(event.target.result as string);
          setIdl(parsed);
          setError(null);
        } catch (err: any) {
          setError('Invalid JSON file');
        }
      }
    };
    reader.readAsText(file);
  };

  const formatType = (type: any): string => {
    if (typeof type === 'string') return type;
    if (type.defined) return type.defined;
    if (type.option) return `Option<${formatType(type.option)}>`;
    if (type.vec) return `Vec<${formatType(type.vec)}>`;
    if (type.array) return `[${formatType(type.array[0])}; ${type.array[1]}]`;
    return JSON.stringify(type);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SEO 
        title="IDL Viewer - FakeSOL" 
        description="Visualize and inspect Anchor IDL files. View instructions, accounts, and types."
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">IDL Viewer</h1>
          <p className="text-zinc-400">Inspect Anchor IDL files to understand program structure.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-zinc-800 bg-zinc-900/50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Upload IDL (JSON)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="idl-upload"
                  />
                  <label
                    htmlFor="idl-upload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-zinc-700 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer text-zinc-400"
                  >
                    <div className="text-center">
                      <FiUpload className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">Click to upload JSON</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-zinc-500">Or paste JSON</span>
                </div>
              </div>

              <div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{ "version": "0.1.0", ... }'
                  className="w-full h-40 bg-black/20 border border-zinc-800 rounded-xl p-4 text-zinc-300 font-mono text-xs focus:outline-none focus:border-purple-500/50 transition-colors resize-none custom-scrollbar"
                />
              </div>

              <Button 
                onClick={handleParse} 
                variant="primary" 
                fullWidth
                disabled={!jsonInput}
              >
                Parse IDL
              </Button>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <FiAlertCircle />
                  {error}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Viewer Section */}
        <div className="lg:col-span-2">
          {idl ? (
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-6 border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white capitalize">{idl.name}</h2>
                    <p className="text-zinc-500 font-mono text-sm">v{idl.version}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="purple">{idl.instructions.length} Instructions</Badge>
                    <Badge variant="default">{idl.accounts?.length || 0} Accounts</Badge>
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-zinc-800 pb-1">
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'instructions' 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setActiveTab('accounts')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'accounts' 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Accounts
                </button>
                <button
                  onClick={() => setActiveTab('types')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'types' 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Types
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {activeTab === 'instructions' && (
                  <div className="grid gap-4">
                    {idl.instructions.map((ix, i) => (
                      <Card key={i} className="p-4 border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <FiCode className="text-purple-500" />
                          <h3 className="font-bold text-white">{ix.name}</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Arguments</h4>
                            <div className="space-y-1">
                              {ix.args.map((arg, j) => (
                                <div key={j} className="flex justify-between text-sm bg-black/20 p-2 rounded">
                                  <span className="text-zinc-300">{arg.name}</span>
                                  <span className="text-purple-400 font-mono">{formatType(arg.type)}</span>
                                </div>
                              ))}
                              {ix.args.length === 0 && <span className="text-zinc-600 text-sm italic">No arguments</span>}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Accounts</h4>
                            <div className="space-y-1">
                              {ix.accounts.map((acc, j) => (
                                <div key={j} className="flex items-center justify-between text-sm bg-black/20 p-2 rounded">
                                  <span className="text-zinc-300">{acc.name}</span>
                                  <div className="flex gap-1">
                                    {acc.isMut && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1 rounded">MUT</span>}
                                    {acc.isSigner && <span className="text-[10px] bg-green-500/20 text-green-400 px-1 rounded">SIGNER</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {activeTab === 'accounts' && (
                  <div className="grid gap-4">
                    {idl.accounts?.map((acc, i) => (
                      <Card key={i} className="p-4 border-zinc-800 bg-zinc-900/30">
                        <div className="flex items-center gap-2 mb-3">
                          <FiDatabase className="text-blue-500" />
                          <h3 className="font-bold text-white">{acc.name}</h3>
                        </div>
                        <div className="space-y-1">
                          {acc.type.fields.map((field, j) => (
                            <div key={j} className="flex justify-between text-sm bg-black/20 p-2 rounded">
                              <span className="text-zinc-300">{field.name}</span>
                              <span className="text-blue-400 font-mono">{formatType(field.type)}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                    {(!idl.accounts || idl.accounts.length === 0) && (
                      <div className="text-center text-zinc-500 py-8">No accounts defined</div>
                    )}
                  </div>
                )}

                {activeTab === 'types' && (
                  <div className="grid gap-4">
                    {idl.types?.map((type: any, i) => (
                      <Card key={i} className="p-4 border-zinc-800 bg-zinc-900/30">
                        <div className="flex items-center gap-2 mb-3">
                          <FiType className="text-green-500" />
                          <h3 className="font-bold text-white">{type.name}</h3>
                        </div>
                        <div className="space-y-1">
                          {type.type.kind === 'struct' && type.type.fields?.map((field: any, j: number) => (
                            <div key={j} className="flex justify-between text-sm bg-black/20 p-2 rounded">
                              <span className="text-zinc-300">{field.name}</span>
                              <span className="text-green-400 font-mono">{formatType(field.type)}</span>
                            </div>
                          ))}
                          {type.type.kind === 'enum' && type.type.variants?.map((variant: any, j: number) => (
                            <div key={j} className="text-sm bg-black/20 p-2 rounded text-zinc-300">
                              {variant.name}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                    {(!idl.types || idl.types.length === 0) && (
                      <div className="text-center text-zinc-500 py-8">No custom types defined</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl p-12">
              <FiList className="w-12 h-12 mb-4 opacity-50" />
              <p>Upload or paste an IDL to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
