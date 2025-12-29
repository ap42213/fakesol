import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWallet } from 'react-icons/fa';

export function AuthPage() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-3xl font-bold">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FaWallet className="text-white text-xl" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FakeSol
            </span>
          </Link>
          <p className="text-gray-400 mt-2">Solana Devnet Wallet</p>
        </div>

        {/* Clerk Auth Component */}
        <div className="flex justify-center">
          {mode === 'sign-in' ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-gray-300',
                  socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
                  socialButtonsBlockButtonText: 'text-white',
                  dividerLine: 'bg-white/20',
                  dividerText: 'text-gray-400',
                  formFieldLabel: 'text-gray-300',
                  formFieldInput: 'bg-white/10 border-white/20 text-white',
                  formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                  footerActionLink: 'text-purple-400 hover:text-purple-300',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButton: 'text-purple-400',
                },
              }}
              routing="hash"
              signUpUrl="/login#sign-up"
              afterSignInUrl="/dashboard"
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-gray-300',
                  socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
                  socialButtonsBlockButtonText: 'text-white',
                  dividerLine: 'bg-white/20',
                  dividerText: 'text-gray-400',
                  formFieldLabel: 'text-gray-300',
                  formFieldInput: 'bg-white/10 border-white/20 text-white',
                  formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                  footerActionLink: 'text-purple-400 hover:text-purple-300',
                },
              }}
              routing="hash"
              signInUrl="/login#sign-in"
              afterSignUpUrl="/dashboard"
            />
          )}
        </div>

        {/* Toggle */}
        <div className="text-center mt-6">
          {mode === 'sign-in' ? (
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('sign-up')}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={() => setMode('sign-in')}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Guest mode link */}
        <div className="text-center mt-4">
          <Link 
            to="/"
            className="text-gray-500 hover:text-gray-400 text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
