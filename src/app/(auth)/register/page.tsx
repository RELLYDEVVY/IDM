'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Shield, User, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strengthScore = Object.values(reqs).filter(Boolean).length;
  const strengthColor = 
    strengthScore <= 2 ? 'bg-danger-500' : 
    strengthScore === 3 ? 'bg-warning-500' : 
    strengthScore === 4 ? 'bg-brand-400' : 'bg-success-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strengthScore < 5) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-6">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-success-500/20 text-success-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
          <p className="text-gray-400 mb-8">
            We've sent a verification link to <span className="text-white">{email}</span>. 
            Please verify your email to continue.
          </p>
          <Link 
            href="/login"
            className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 transition-colors glow-brand"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-950">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center p-12 bg-surface-900 border-r border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/20 to-surface-950/50 z-0"></div>
        <div className="relative z-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-brand-400" />
            <h1 className="text-3xl font-bold gradient-text tracking-tight">CloudGuard IAM</h1>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Join the secure future.</h2>
          <p className="text-lg text-gray-400 max-w-md mb-8">
            Create your enterprise account to get started with our next-generation identity platform.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-y-auto py-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-sm text-gray-400">Sign up for your new account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-surface-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-surface-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-surface-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 ${strengthColor}`} 
                      style={{ width: `${(strengthScore / 5) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${reqs.length ? 'text-success-400' : 'text-gray-500'}`}>
                      {reqs.length ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 8+ characters
                    </div>
                    <div className={`flex items-center gap-1 ${reqs.upper ? 'text-success-400' : 'text-gray-500'}`}>
                      {reqs.upper ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Uppercase
                    </div>
                    <div className={`flex items-center gap-1 ${reqs.lower ? 'text-success-400' : 'text-gray-500'}`}>
                      {reqs.lower ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Lowercase
                    </div>
                    <div className={`flex items-center gap-1 ${reqs.number ? 'text-success-400' : 'text-gray-500'}`}>
                      {reqs.number ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Number
                    </div>
                    <div className={`flex items-center gap-1 ${reqs.special ? 'text-success-400' : 'text-gray-500'}`}>
                      {reqs.special ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Special char
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 mt-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-surface-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || strengthScore < 5}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-surface-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-brand mt-4"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
