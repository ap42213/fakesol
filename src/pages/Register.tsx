import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiAlertCircle, FiCheck, FiUser, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Logo } from '../components/Logo';
import { SEO } from '../components/SEO';

// Use runtime env if available, otherwise build time env, otherwise default based on mode
const API_URL = (window as any).__ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletName, setWalletName] = useState('');
  const [oauthProviders, setOauthProviders] = useState<{ google: boolean; github: boolean }>({ google: false, github: false });

  useEffect(() => {
    // Check available OAuth providers
    fetch(`${API_URL}/api/oauth/providers`)
      .then(res => res.json())
      .then(data => setOauthProviders(data))
      .catch(() => setOauthProviders({ google: false, github: false }));
  }, []);

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

  const allRequirementsMet = passwordRequirements.every((r) => r.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!allRequirementsMet) {
      return;
    }

    if (!passwordsMatch) {
      return;
    }
    
    try {
      await register(email, password, walletName || undefined);
      navigate('/dashboard');
    } catch {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background-lighter p-4">
      <SEO 
        title="Register" 
        description="Create a FakeSOL account to start testing on Solana devnet."
        canonical="https://fakesol.com/register"
      />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">FakeSOL</h1>
          <p className="text-zinc-400 text-lg">Create Account</p>
          <p className="text-text-muted mt-2">Sign up to save your wallets securely</p>
        </div>

        {/* Form */}
        <div className="card-glass p-8">
          {(oauthProviders.google || oauthProviders.github) && (
            <>
              <div className="space-y-3">
                {oauthProviders.google && (
                  <a
                    href={`${API_URL}/api/oauth/google`}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition-colors"
                  >
                    <FcGoogle className="w-5 h-5" />
                    Sign up with Google
                  </a>
                )}
                {oauthProviders.github && (
                  <a
                    href={`${API_URL}/api/oauth/github`}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <FiGithub className="w-5 h-5" />
                    Sign up with GitHub
                  </a>
                )}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background-card text-text-muted">or sign up with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="new-password"
                />
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? 'text-success' : 'text-text-muted'
                      }`}
                    >
                      <FiCheck className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input-field ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-success/50'
                        : 'border-red-500/50'
                      : ''
                  }`}
                  required
                  autoComplete="new-password"
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Wallet Name <span className="text-text-muted">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="My Wallet"
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-light transition-colors">
                Sign in
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
          By signing up, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
