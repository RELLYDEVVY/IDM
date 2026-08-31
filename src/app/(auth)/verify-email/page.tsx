'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: 'GET',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        setMessage('Your email has been successfully verified.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Invalid or expired verification link.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="text-center animate-fade-in">
      <div className="flex justify-center mb-6">
        {status === 'loading' && (
          <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center border border-white/10">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        )}
        {status === 'success' && (
          <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center border border-success-500/30">
            <CheckCircle2 className="w-8 h-8 text-success-400" />
          </div>
        )}
        {status === 'error' && (
          <div className="w-16 h-16 bg-danger-500/20 rounded-full flex items-center justify-center border border-danger-500/30">
            <XCircle className="w-8 h-8 text-danger-400" />
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        {status === 'loading' && 'Verifying Email...'}
        {status === 'success' && 'Email Verified'}
        {status === 'error' && 'Verification Failed'}
      </h2>
      
      <p className="text-gray-400 mb-8">
        {status === 'loading' && 'Please wait while we verify your email address.'}
        {status !== 'loading' && message}
      </p>

      {status !== 'loading' && (
        <Link 
          href="/login"
          className="inline-flex justify-center items-center py-2.5 px-8 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 transition-colors glow-brand"
        >
          Proceed to Login
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
              Loading...
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
