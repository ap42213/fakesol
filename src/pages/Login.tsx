import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiAlertCircle, FiUser, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Logo } from '../components/Logo';
import { SEO } from '../components/SEO';

// Use runtime env if available, otherwise build time env, otherwise default based on mode
const API_URL = (window as any).__ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oauthProviders, setOauthProviders] = useState<{ google: boolean; github: boolean }>({ google: false, github: false });

  useEffect(() => {
    // Check available OAuth providers
    fetch(`${API_URL}/api/oauth/providers`)
      .then(res => res.json())
      .then(data => setOauthProviders(data))
      .catch(() => setOauthProviders({ google: false, github: false }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background-lighter p-4">
      <SEO 
        title="Login" 
        description="Sign in to your FakeSOL account to manage your devnet wallets."
        canonical="https://fakesol.com/login"
      />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">FakeSOL</h1>
          <p className="text-zinc-400 text-lg">Welcome Back</p>
          <p className="text-text-muted mt-2">Sign in to access your wallets</p>
        </div>

        {/* Form */}
        <div className="card-glass p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {(oauthProviders.google || oauthProviders.github) && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background-card text-text-muted">or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                {oauthProviders.google && (
                  <a
                    href={`${API_URL}/api/oauth/google`}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition-colors"
                  >
                    <FcGoogle className="w-5 h-5" />
                    Continue with Google
                  </a>
                )}
                {oauthProviders.github && (
                  <a
                    href={`${API_URL}/api/oauth/github`}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <FiGithub className="w-5 h-5" />
                    Continue with GitHub
                  </a>
                )}
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-light transition-colors">
                Create one
              </Link>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background-card text-text-muted">or</span>
            </div>
          </div>

          <Link
            to="/"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <FiUser className="w-4 h-4" />
            Continue without account
          </Link>
        </div>

        <p className="text-center text-text-muted text-sm mt-6">
          FakeSOL is for Solana Devnet only. No real funds.
        </p>
      </div>
    </div>
  );
}
