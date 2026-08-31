'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, KeyRound, ArrowRight } from 'lucide-react';

export default function MFAPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = useBackup ? backupCode : code.join('');
    
    if (!useBackup && token.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, useBackup }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
      if (!useBackup) setCode(['', '', '', '', '', '']);
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
            <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg relative">
              <div className="absolute -inset-0.5 bg-brand-500 rounded-2xl blur opacity-30 animate-pulse-glow"></div>
              {useBackup ? <KeyRound className="w-8 h-8 text-brand-400 relative z-10" /> : <Smartphone className="w-8 h-8 text-brand-400 relative z-10" />}
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-400">
              {useBackup 
                ? 'Enter one of your emergency backup codes.'
                : 'Enter the 6-digit code from your authenticator app.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {useBackup ? (
              <div>
                <input
                  type="text"
                  required
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  className="block w-full px-4 py-3 bg-surface-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 transition-colors text-center tracking-widest font-mono"
                  placeholder="e.g. 12345678"
                />
              </div>
            ) : (
              <div className="flex justify-between gap-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 bg-surface-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white text-center text-xl font-bold transition-colors"
                  />
                ))}
              </div>
            )}

            {!useBackup && (
              <div className="flex justify-center items-center text-xs text-gray-500 font-mono">
                Code expires in: <span className="ml-1 text-brand-400">{timeLeft}s</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!useBackup && code.join('').length !== 6) || (useBackup && !backupCode)}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-surface-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-brand"
            >
              {loading ? 'Verifying...' : 'Verify'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setUseBackup(!useBackup);
                setError('');
                setCode(['', '', '', '', '', '']);
                setBackupCode('');
              }}
              className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              {useBackup ? 'Use authenticator app instead' : 'Use backup code instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
