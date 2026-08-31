"use client";

import React, { useState, useEffect } from "react";
import { AppWindow, Plus, Settings, Trash2, Copy, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTimeout(() => {
      setApps([
        { 
          id: "app_1", 
          name: "Customer Portal", 
          description: "Main facing application for customers",
          clientId: "client_abc123xyz", 
          clientSecret: "secret_890qweasd_very_long_secret_string",
          redirectUris: ["https://portal.example.com/callback"],
          scopes: ["openid", "profile", "email"],
          createdAt: "2023-05-10"
        },
        { 
          id: "app_2", 
          name: "Internal Admin Dashboard", 
          description: "Internal tools for staff",
          clientId: "client_def456uvw", 
          clientSecret: "secret_123zxcvbn_another_secret",
          redirectUris: ["https://admin.example.com/oauth/callback"],
          scopes: ["openid", "profile", "read:users", "write:users"],
          createdAt: "2023-08-22"
        }
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const toggleSecret = (id: string) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">OAuth Applications</h1>
          <p className="text-slate-400 text-sm">Register and manage client applications for SSO.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-500/20">
          <Plus className="w-4 h-4 mr-2" />
          Register App
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {apps.map(app => (
            <div key={app.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group">
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-surface-900/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-brand-500/20 to-violet-500/20 rounded-xl text-brand-400 border border-brand-500/20">
                    <AppWindow className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{app.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-danger-400 bg-danger-500/10 hover:bg-danger-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium uppercase">Client ID</label>
                  <div className="flex items-center justify-between bg-surface-950 border border-white/5 rounded-lg px-3 py-2">
                    <code className="text-sm text-slate-300 font-mono">{app.clientId}</code>
                    <button className="text-slate-400 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium uppercase">Client Secret</label>
                  <div className="flex items-center justify-between bg-surface-950 border border-white/5 rounded-lg px-3 py-2">
                    <code className="text-sm text-slate-300 font-mono">
                      {showSecret[app.id] ? app.clientSecret : "••••••••••••••••••••••••••••••••"}
                    </code>
                    <div className="flex gap-2">
                      <button onClick={() => toggleSecret(app.id)} className="text-slate-400 hover:text-white transition-colors">
                        {showSecret[app.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button className="text-slate-400 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-medium uppercase">Redirect URIs</label>
                  {app.redirectUris.map((uri: string, idx: number) => (
                    <div key={idx} className="text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 truncate">
                      {uri}
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-xs text-slate-500 font-medium uppercase">Allowed Scopes</label>
                  <div className="flex flex-wrap gap-2">
                    {app.scopes.map((scope: string) => (
                      <span key={scope} className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1 opacity-70" />
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
