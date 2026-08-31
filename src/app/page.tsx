import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Smartphone, Key, ScrollText, BarChart3, Lock, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden selection:bg-brand-500/30">
      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-500/20 rounded-full blur-xl animate-pulse" />
              <Shield className="w-20 h-20 text-brand-400 relative z-10" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-brand-400">
            Secure Cloud-Based<br />Identity Management
          </h1>
          
          <p className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade identity and access management. Multi-factor authentication, role-based access control, OAuth 2.0 SSO, and real-time security analytics.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 backdrop-blur-sm transition-all w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 relative z-10 bg-[#0f172a]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Enterprise Security Features</h2>
            <p className="mt-4 text-slate-400">Everything you need to secure your organization's digital assets.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: 'Multi-Factor Auth',
                description: 'TOTP-based 2FA with backup recovery codes for enhanced account security.'
              },
              {
                icon: ShieldCheck,
                title: 'Role-Based Access',
                description: 'Granular RBAC with 4 role tiers and detailed permission matrix.'
              },
              {
                icon: Key,
                title: 'OAuth 2.0 SSO',
                description: 'Full OAuth 2.0 authorization server with PKCE support for secure integrations.'
              },
              {
                icon: ScrollText,
                title: 'Audit Trail',
                description: 'Immutable security event logging with forensic filtering and export capabilities.'
              },
              {
                icon: BarChart3,
                title: 'Security Analytics',
                description: 'Real-time threat dashboard with posture scoring and anomaly detection.'
              },
              {
                icon: Lock,
                title: 'Zero Trust',
                description: 'Session management, IP controls, and strict policy enforcement.'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-500/50 transition-all backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-10 text-slate-300">Built on Industry Standards</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['NIST SP 800-63B', 'OWASP Top 10', 'ISO 27001', 'OAuth 2.0 RFC 6749', 'Zero Trust Architecture'].map((standard, idx) => (
              <span 
                key={idx} 
                className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-medium text-slate-300 backdrop-blur-md"
              >
                {standard}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 bg-[#0a0e1a]/80 backdrop-blur-md text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2 text-slate-400 font-semibold">
          <Shield className="w-4 h-4 text-brand-400" />
          <span>CloudGuard IAM</span>
        </div>
        <p>Final Year Project - Secure Cloud-Based Identity Management System</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} CloudGuard. All rights reserved.</p>
      </footer>
    </div>
  );
}
