'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function OAuthConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<{
    clientName: string;
    scopes: string[];
    userEmail: string;
  } | null>(null);
  
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const responseType = searchParams.get('response_type');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');

  useEffect(() => {
    async function fetchAppInfo() {
      if (!clientId || !redirectUri || !responseType || !scope) {
        setError('Missing required OAuth parameters.');
        setLoading(false);
        return;
      }
      
      try {
        const query = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: responseType,
          scope: scope,
        });
        
        const res = await fetch(`/api/oauth/authorize?${query.toString()}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch application details');
        }
        
        setAppInfo({
          clientName: data.clientName || 'Third-Party App',
          scopes: data.requestedScopes || scope.split(' '),
          userEmail: data.userEmail || 'user@example.com' // Should come from API based on session
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAppInfo();
  }, [clientId, redirectUri, responseType, scope]);

  const handleDecision = async (decision: 'allow' | 'deny') => {
    try {
      setLoading(true);
      
      const payload = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope: scope,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        action: decision
      };
      
      const res = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authorization failed');
      }
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError('Invalid response from server');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getScopeDescription = (s: string) => {
    switch (s) {
      case 'openid': return 'Verify your identity';
      case 'profile': return 'View your profile information (name)';
      case 'email': return 'View your email address';
      default: return `Access ${s} data`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-4" />
        <p className="text-slate-400">Verifying authorization request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-400 mb-2">Authorization Error</h3>
        <p className="text-red-200/70">{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
            <Shield className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">
            <span className="text-brand-400">{appInfo?.clientName}</span> wants to access your account
          </h2>
        </div>
        
        {/* Scopes */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              Requested Permissions
            </h3>
            <ul className="space-y-4">
              {appInfo?.scopes.map(s => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{s}</p>
                    <p className="text-xs text-slate-400">{getScopeDescription(s)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-6 border-t border-white/5">
            <p className="text-sm text-slate-400">
              Signed in as <span className="text-white font-medium">{appInfo?.userEmail}</span>
            </p>
          </div>
          
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => handleDecision('deny')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
            >
              Deny
            </button>
            <button
              onClick={() => handleDecision('allow')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-all shadow-lg shadow-brand-500/25"
            >
              Allow
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          CloudGuard IAM Authorization Server
        </p>
      </div>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />
      </div>
      <div className="relative z-10 w-full">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        }>
          <OAuthConsentContent />
        </Suspense>
      </div>
    </div>
  );
}
