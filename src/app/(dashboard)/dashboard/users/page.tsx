"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, MoreVertical, Shield, ShieldOff, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers([
        { id: "1", name: "Alice Johnson", email: "alice@example.com", roles: ["ADMIN", "USER"], status: "ACTIVE", mfaEnabled: true, lastLogin: "10 mins ago" },
        { id: "2", name: "Bob Smith", email: "bob@example.com", roles: ["USER"], status: "ACTIVE", mfaEnabled: false, lastLogin: "2 hours ago" },
        { id: "3", name: "Charlie Davis", email: "charlie@example.com", roles: ["USER", "DEVELOPER"], status: "SUSPENDED", mfaEnabled: true, lastLogin: "5 days ago" },
        { id: "4", name: "Diana Prince", email: "diana@example.com", roles: ["USER"], status: "DEACTIVATED", mfaEnabled: false, lastLogin: "1 month ago" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-success-500/10 text-success-400 border-success-500/20",
      SUSPENDED: "bg-warning-500/10 text-warning-400 border-warning-500/20",
      DEACTIVATED: "bg-danger-500/10 text-danger-400 border-danger-500/20",
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${styles[status] || "bg-slate-500/10 text-slate-400"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
          <p className="text-slate-400 text-sm">Manage identities, roles, and access policies.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full bg-surface-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select className="bg-surface-900 border border-white/10 rounded-xl py-2 px-4 text-sm text-slate-300 focus:outline-none focus:border-brand-500">
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select className="bg-surface-900 border border-white/10 rounded-xl py-2 px-4 text-sm text-slate-300 focus:outline-none focus:border-brand-500">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 bg-white/5">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Roles</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">MFA</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-32 bg-white/5 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-6 bg-white/5 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-white/5 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role: string) => (
                          <span key={role} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4">
                      {user.mfaEnabled ? (
                        <Shield className="w-5 h-5 text-success-500" />
                      ) : (
                        <ShieldOff className="w-5 h-5 text-slate-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex justify-end">
                        <Link 
                          href={`/dashboard/users/${user.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-colors mr-2"
                        >
                          View Details
                        </Link>
                        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400">
          <div>Showing 1 to 4 of 4 results</div>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Add New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input type="text" className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input type="email" className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select className="w-full bg-surface-950 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">
                Cancel
              </button>
              <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors">
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
