"use client";

import React, { useState, useEffect } from "react";
import { Download, Filter, ChevronDown, ChevronRight, Search, Calendar } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setLogs([
        { id: "log_1", timestamp: "2023-10-25 14:32:01", user: "alice@example.com", eventType: "USER_LOGIN", severity: "INFO", ip: "192.168.1.100", details: { method: "PASSWORD", browser: "Chrome 118", os: "Windows 11" } },
        { id: "log_2", timestamp: "2023-10-25 14:30:12", user: "SYSTEM", eventType: "POLICY_UPDATED", severity: "WARNING", ip: "10.0.0.1", details: { policy: "PASSWORD_COMPLEXITY", changedBy: "admin@example.com" } },
        { id: "log_3", timestamp: "2023-10-25 13:15:44", user: "bob@example.com", eventType: "LOGIN_FAILED", severity: "CRITICAL", ip: "203.0.113.42", details: { reason: "INVALID_CREDENTIALS", attempts: 5, locked: true } },
        { id: "log_4", timestamp: "2023-10-25 11:20:00", user: "charlie@example.com", eventType: "MFA_SETUP", severity: "INFO", ip: "198.51.100.12", details: { method: "TOTP", status: "SUCCESS" } },
      ]);
      setLoading(false);
    }, 700);
  }, []);

  const SeverityDot = ({ severity }: { severity: string }) => {
    const colors: Record<string, string> = {
      INFO: "bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]",
      WARNING: "bg-warning-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]",
      CRITICAL: "bg-danger-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
    };
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[severity] || "bg-slate-400"}`}></div>
        <span className="text-sm text-slate-300">{severity}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Audit Logs</h1>
          <p className="text-slate-400 text-sm">Comprehensive track of all system and user activities.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-white/10 text-white rounded-xl text-sm font-medium transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 bg-surface-900 border border-white/10 rounded-xl px-3 py-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input type="date" className="bg-transparent text-sm text-slate-300 focus:outline-none" />
          <span className="text-slate-500">-</span>
          <input type="date" className="bg-transparent text-sm text-slate-300 focus:outline-none" />
        </div>
        
        <select className="bg-surface-900 border border-white/10 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none">
          <option>All Severities</option>
          <option>INFO</option>
          <option>WARNING</option>
          <option>CRITICAL</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by user or IP..." 
            className="w-full bg-surface-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 bg-white/5">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Event Type</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-16 bg-white/5"></td>
                  </tr>
                ))
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${expandedRow === log.id ? 'bg-white/5' : ''}`}
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-4 text-slate-400 text-center">
                        {expandedRow === log.id ? <ChevronDown className="w-5 h-5 mx-auto" /> : <ChevronRight className="w-5 h-5 mx-auto" />}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{log.user}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-slate-300">
                          {log.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4"><SeverityDot severity={log.severity} /></td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.ip}</td>
                    </tr>
                    {expandedRow === log.id && (
                      <tr className="bg-surface-950/50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-surface-950 border border-white/5 rounded-xl p-4 relative">
                            <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono">ID: {log.id}</div>
                            <h4 className="text-sm font-semibold text-white mb-2">Event Metadata</h4>
                            <pre className="text-xs text-brand-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
