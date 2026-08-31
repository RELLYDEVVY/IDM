'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.mfaRequired) {
        router.push('/mfa');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-950">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center p-12 bg-surface-900 border-r border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-surface-950/50 z-0"></div>
        <div className="relative z-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-brand-400" />
            <h1 className="text-3xl font-bold gradient-text tracking-tight">CloudGuard IAM</h1>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Secure access for your entire enterprise.</h2>
          <div className="space-y-4 text-surface-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success-400" />
              <span>Zero-trust architecture</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success-400" />
              <span>Multi-factor authentication (MFA)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success-400" />
              <span>Real-time anomaly detection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-sm text-gray-400">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-600 bg-surface-800 text-brand-500 focus:ring-brand-500" />
                  <span className="text-gray-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-surface-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-brand"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
