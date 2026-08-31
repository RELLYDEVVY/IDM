"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Key, QrCode, Monitor, Trash2, Shield } from "lucide-react";

export default function ProfilePage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
      
      {/* Profile Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 p-1 shrink-0">
          <div className="w-full h-full bg-surface-900 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            A
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">Admin User</h2>
          <p className="text-slate-400 mb-3">admin@cloudguard.io</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium">ADMIN</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface-800 text-slate-300 border border-white/10 font-medium">Member since Jan 2023</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Management */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-semibold text-white">Change Password</h3>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-surface-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-surface-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-brand-500" />
              {/* Strength Meter */}
              <div className="mt-2 flex gap-1 h-1">
                <div className="flex-1 bg-danger-500 rounded-full"></div>
                <div className="flex-1 bg-warning-500 rounded-full"></div>
                <div className="flex-1 bg-success-500 rounded-full"></div>
                <div className="flex-1 bg-surface-800 rounded-full"></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Password must be at least 12 characters long.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-surface-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-brand-500" />
            </div>
            <button className="w-full py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-sm font-medium transition-colors border border-white/10 mt-2">
              Update Password
            </button>
          </form>
        </div>

        {/* MFA Settings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
          </div>
          
          <div className="h-full flex flex-col items-center text-center pt-4">
            {mfaEnabled ? (
              <>
                <div className="w-16 h-16 rounded-full bg-success-500/20 text-success-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">MFA is Enabled</h4>
                <p className="text-sm text-slate-400 mb-8">Your account is secured with an authenticator app.</p>
                <div className="w-full space-y-3">
                  <button className="w-full py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-sm font-medium transition-colors border border-white/10">
                    View Backup Codes
                  </button>
                  <button onClick={() => setMfaEnabled(false)} className="w-full py-2.5 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 rounded-xl text-sm font-medium transition-colors border border-danger-500/20">
                    Disable MFA
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-warning-500/20 text-warning-400 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">MFA is Disabled</h4>
                <p className="text-sm text-slate-400 mb-8">Add an extra layer of security to your account by enabling Two-Factor Authentication.</p>
                <button 
                  onClick={() => setShowMfaModal(true)}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-500/20 mt-auto"
                >
                  Enable Authenticator App
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions (Self) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface-900/50">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
          </div>
          <button className="text-sm text-danger-400 hover:text-danger-300 font-medium">Revoke All Others</button>
        </div>
        <div className="divide-y divide-white/5">
          <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface-800 rounded-xl">
                <Monitor className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  Windows • Chrome 
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-500/20 text-success-400 border border-success-500/20">Current Session</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">IP: 192.168.1.100 • New York, US</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface-800 rounded-xl">
                <Monitor className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">macOS • Safari</p>
                <p className="text-xs text-slate-400 mt-1">IP: 10.0.0.45 • Last active: 2 hours ago</p>
              </div>
            </div>
            <button className="text-danger-400 hover:text-danger-300 bg-danger-500/10 p-2 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MFA Setup Modal */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMfaModal(false)}></div>
          <div className="relative bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 text-center">
              <h3 className="text-lg font-semibold text-white">Setup Authenticator App</h3>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-400 text-center">
                Scan this QR code with your authenticator app (like Google Authenticator or Authy).
              </p>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center">
                  <QrCode className="w-full h-full text-black" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">Or enter this code manually:</p>
                <code className="bg-surface-950 border border-white/10 px-4 py-2 rounded-lg text-brand-300 font-mono tracking-widest">
                  AB12 CD34 EF56 GH78
                </code>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Enter Verification Code</label>
                <input type="text" placeholder="000000" className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500 text-center text-lg tracking-[0.5em] font-mono" maxLength={6} />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
              <button onClick={() => setShowMfaModal(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">
                Cancel
              </button>
              <button onClick={() => { setMfaEnabled(true); setShowMfaModal(false); }} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors">
                Verify & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
