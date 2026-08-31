"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Shield, Clock, MapPin, Monitor, LogOut, Key, ShieldAlert } from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setUser({
        id,
        name: "Alice Johnson",
        email: "alice@example.com",
        roles: ["ADMIN", "USER"],
        status: "ACTIVE",
        mfaEnabled: true,
        createdAt: "2023-01-15T10:00:00Z",
        stats: {
          totalLogins: 432,
          failedAttempts: 3,
          passwordAge: "45 days"
        },
        sessions: [
          { id: "s1", ip: "192.168.1.105", userAgent: "Chrome / Windows", location: "New York, US", lastActive: "10 mins ago" },
          { id: "s2", ip: "10.0.0.45", userAgent: "Safari / iOS", location: "New York, US", lastActive: "2 days ago" },
        ],
        activity: [
          { id: "a1", action: "LOGIN_SUCCESS", time: "10 mins ago", ip: "192.168.1.105" },
          { id: "a2", action: "PASSWORD_CHANGED", time: "45 days ago", ip: "192.168.1.105" },
          { id: "a3", action: "MFA_ENABLED", time: "200 days ago", ip: "10.0.0.45" },
        ]
      });
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
          <div className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
          <div className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link href="/dashboard/users" className="inline-flex items-center text-sm text-slate-400 hover:text-brand-400 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Users
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-600/20 to-transparent rounded-full blur-[80px]"></div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-600 p-1 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-surface-900 rounded-xl flex items-center justify-center text-3xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <span className="bg-success-500/10 text-success-400 border border-success-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                {user.status}
              </span>
              {user.mfaEnabled && (
                <span className="flex items-center text-violet-400 text-xs font-medium bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                  <Shield className="w-3 h-3 mr-1" /> MFA Enabled
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-4">{user.email}</p>
            <div className="flex gap-2">
              {user.roles.map((role: string) => (
                <span key={role} className="text-xs px-2 py-1 rounded-md bg-white/10 text-slate-300 border border-white/10">
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-white/10 text-white rounded-xl text-sm font-medium transition-colors">
              Edit Role
            </button>
            <button className="px-4 py-2 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/20 rounded-xl text-sm font-medium transition-colors">
              Suspend User
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-brand-500/20 rounded-xl text-brand-400">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Logins</p>
            <p className="text-xl font-bold text-white">{user.stats.totalLogins}</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-warning-500/20 rounded-xl text-warning-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Failed Attempts</p>
            <p className="text-xl font-bold text-white">{user.stats.failedAttempts}</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Password Age</p>
            <p className="text-xl font-bold text-white">{user.stats.passwordAge}</p>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
          <button className="text-sm text-danger-400 hover:text-danger-300 font-medium">Revoke All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">Device / Location</th>
                <th className="px-6 py-3">IP Address</th>
                <th className="px-6 py-3">Last Active</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {user.sessions.map((session: any) => (
                <tr key={session.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">{session.userAgent}</span>
                      <span className="text-xs text-slate-400 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1" /> {session.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{session.ip}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-500" /> {session.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-danger-400 hover:text-danger-300 bg-danger-500/10 p-2 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {user.activity.map((act: any, idx: number) => (
              <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-surface-900 text-brand-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow md:mx-auto z-10">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-sm">{act.action.replace(/_/g, ' ')}</h3>
                    <time className="text-xs font-medium text-slate-400">{act.time}</time>
                  </div>
                  <div className="text-slate-400 text-xs flex items-center">
                    IP: {act.ip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
