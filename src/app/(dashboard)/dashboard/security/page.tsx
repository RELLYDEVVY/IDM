"use client";

import React, { useState } from "react";
import { ShieldCheck, Save, Key, Clock, MonitorSmartphone, Lock } from "lucide-react";

export default function SecurityPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // Show toast in real app
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Security Policies</h1>
        <p className="text-slate-400 text-sm">Configure global authentication and security rules.</p>
      </div>

      {/* Password Policy */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-3 border-b border-white/10 bg-surface-900/50">
          <Key className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Password Policy</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Minimum Length</label>
              <input type="number" defaultValue={12} className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password Expiry (Days)</label>
              <input type="number" defaultValue={90} className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">Complexity Requirements</label>
            <div className="space-y-2">
              {['Require Uppercase Letters', 'Require Lowercase Letters', 'Require Numbers', 'Require Special Characters'].map(req => (
                <label key={req} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-5 h-5 border border-white/20 rounded bg-surface-950 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-colors"></div>
                    <ShieldCheck className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{req}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account Lockout */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-3 border-b border-white/10 bg-surface-900/50">
          <Lock className="w-5 h-5 text-danger-400" />
          <h2 className="text-lg font-semibold text-white">Account Lockout</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Failed Attempts</label>
            <input type="number" defaultValue={5} className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Lockout Duration (Minutes)</label>
            <input type="number" defaultValue={30} className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" />
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-3 border-b border-white/10 bg-surface-900/50">
          <Clock className="w-5 h-5 text-warning-400" />
          <h2 className="text-lg font-semibold text-white">Session Management</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Idle Timeout (Minutes)</label>
            <input type="number" defaultValue={15} className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" />
            <p className="text-xs text-slate-500 mt-1">Logs user out after inactivity.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Absolute Timeout (Hours)</label>
            <input type="number" defaultValue={24} className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" />
            <p className="text-xs text-slate-500 mt-1">Force re-authentication regardless of activity.</p>
          </div>
        </div>
      </div>

      {/* MFA Policy */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-3 border-b border-white/10 bg-surface-900/50">
          <MonitorSmartphone className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Multi-Factor Authentication</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { id: 'opt', label: 'Optional for all users', desc: 'Users can choose to enable MFA.' },
              { id: 'admin', label: 'Required for Admins only', desc: 'Enforces MFA for users with ADMIN role.' },
              { id: 'all', label: 'Required for All users', desc: 'Mandatory MFA enrollment during next login.' }
            ].map(opt => (
              <label key={opt.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-surface-950 hover:bg-white/5 cursor-pointer transition-colors">
                <div className="mt-1 relative flex items-center justify-center">
                  <input type="radio" name="mfa_policy" defaultChecked={opt.id === 'admin'} className="peer sr-only" />
                  <div className="w-4 h-4 rounded-full border border-white/20 peer-checked:border-[4px] peer-checked:border-brand-500 transition-all"></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{opt.label}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex justify-end gap-4 sticky bottom-6 z-10 pt-4">
        <button className="px-6 py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-sm font-medium transition-colors border border-white/10">
          Discard Changes
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-70"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save All Policies'}
        </button>
      </div>
    </div>
  );
}
