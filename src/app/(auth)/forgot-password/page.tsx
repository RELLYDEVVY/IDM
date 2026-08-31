'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // Even if it fails, we might want to pretend it succeeded for security reasons,
        // but for now let's just log or show a generic message.
        console.error('Password reset request failed');
      }

      // Always show success to prevent email enumeration
      setSuccess(true);
    } catch (err: any) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center border border-white/10">
              <Shield className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-sm text-gray-400">Enter your email and we'll send you a reset link</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-success-500/20 text-success-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-white mb-6">
                If an account exists for {email}, a reset link has been sent.
              </p>
              <Link 
                href="/login"
                className="inline-flex justify-center items-center gap-2 py-2.5 px-6 border border-white/10 rounded-lg shadow-sm text-sm font-medium text-white bg-surface-800 hover:bg-surface-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-surface-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-brand"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
