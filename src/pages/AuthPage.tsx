import { SignIn, SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthPage({ initialMode }: { initialMode?: AuthMode }) {
  const mode: AuthMode = initialMode ?? 'sign-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background-lighter p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
            <span className="text-3xl font-bold text-white">F</span>
          </Link>
          <h1 className="text-2xl font-bold gradient-text">
            {mode === 'sign-in' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-text-muted mt-2">
            {mode === 'sign-in' ? 'Sign in to access your wallets' : 'Sign up to save your wallets securely'}
          </p>
        </div>

        <div className="card-glass p-8">
          {mode === 'sign-in' ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent border-0 shadow-none p-0 w-full',
                  header: 'hidden',
                  socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
                  socialButtonsBlockButtonText: 'text-white',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-text-muted',
                  formFieldLabel: 'text-text-secondary',
                  formFieldInput: 'bg-white/5 border border-white/10 text-white rounded-xl',
                  formButtonPrimary: 'btn-primary w-full py-3 text-base',
                  footerActionLink: 'text-primary hover:text-primary-light transition-colors',
                },
              }}
              routing="hash"
              signUpUrl="/register"
              afterSignInUrl="/dashboard"
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent border-0 shadow-none p-0 w-full',
                  header: 'hidden',
                  socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
                  socialButtonsBlockButtonText: 'text-white',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-text-muted',
                  formFieldLabel: 'text-text-secondary',
                  formFieldInput: 'bg-white/5 border border-white/10 text-white rounded-xl',
                  formButtonPrimary: 'btn-primary w-full py-3 text-base',
                  footerActionLink: 'text-primary hover:text-primary-light transition-colors',
                },
              }}
              routing="hash"
              signInUrl="/login"
              afterSignUpUrl="/dashboard"
            />
          )}

          <div className="mt-6 text-center">
            <p className="text-text-muted">
              {mode === 'sign-in' ? (
                <>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:text-primary-light transition-colors">
                    Create one
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary-light transition-colors">
                    Sign in
                  </Link>
                </>
              )}
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

          <Link to="/" className="btn-secondary w-full flex items-center justify-center gap-2">
            Back to home
          </Link>
        </div>

        <p className="text-center text-text-muted text-sm mt-6">
          FakeSOL is for Solana Devnet only. No real funds.
        </p>
      </div>
    </div>
  );
}
