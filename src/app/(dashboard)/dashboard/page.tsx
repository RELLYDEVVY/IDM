"use client";

import React, { useEffect, useState } from "react";
import { Users, Activity, AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app: await fetch('/api/analytics/dashboard')
        setTimeout(() => {
          setData({
            user: { name: "Admin" },
            kpis: {
              totalUsers: 12450,
              usersTrend: "+12%",
              activeSessions: 342,
              sessionsTrend: "+5%",
              failedLogins: 89,
              failedLoginsTrend: "-14%",
              mfaAdoption: 82,
              mfaTrend: "+2%",
            },
            securityScore: 85,
            loginTrends: [
              { name: 'Mon', success: 4000, failed: 240 },
              { name: 'Tue', success: 3000, failed: 139 },
              { name: 'Wed', success: 2000, failed: 980 },
              { name: 'Thu', success: 2780, failed: 390 },
              { name: 'Fri', success: 1890, failed: 480 },
              { name: 'Sat', success: 2390, failed: 380 },
              { name: 'Sun', success: 3490, failed: 430 },
            ],
            recentActivity: [
              { id: 1, type: "LOGIN_FAILED", user: "john.doe@example.com", time: "2 mins ago", severity: "WARNING" },
              { id: 2, type: "MFA_ENABLED", user: "sarah.smith@example.com", time: "15 mins ago", severity: "INFO" },
              { id: 3, type: "USER_CREATED", user: "new.user@example.com", time: "1 hour ago", severity: "INFO" },
              { id: 4, type: "ROLE_CHANGED", user: "mike.admin@example.com", time: "3 hours ago", severity: "WARNING" },
              { id: 5, type: "BRUTE_FORCE_DETECTED", user: "Multiple Accounts", time: "5 hours ago", severity: "CRITICAL" },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const KPICard = ({ title, value, trend, icon: Icon, colorClass, gradientClass }: any) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientClass} rounded-full blur-[50px] opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className="text-slate-400 font-medium text-sm">{title}</div>
        <div className={`p-2 rounded-xl bg-white/5 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline space-x-3">
        <h2 className="text-3xl font-bold text-white">{value}</h2>
        <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-success-400' : 'text-danger-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {data?.user?.name || "Admin"}</h1>
          <p className="text-slate-400 text-sm">Here's what's happening in your system today.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Users" 
          value={data.kpis.totalUsers.toLocaleString()} 
          trend={data.kpis.usersTrend}
          icon={Users}
          colorClass="text-brand-400"
          gradientClass="from-brand-500 to-blue-500"
        />
        <KPICard 
          title="Active Sessions" 
          value={data.kpis.activeSessions.toLocaleString()} 
          trend={data.kpis.sessionsTrend}
          icon={Activity}
          colorClass="text-success-400"
          gradientClass="from-success-500 to-emerald-500"
        />
        <KPICard 
          title="Failed Logins 24h" 
          value={data.kpis.failedLogins.toLocaleString()} 
          trend={data.kpis.failedLoginsTrend}
          icon={AlertTriangle}
          colorClass="text-danger-400"
          gradientClass="from-danger-500 to-rose-500"
        />
        <KPICard 
          title="MFA Adoption" 
          value={`${data.kpis.mfaAdoption}%`} 
          trend={data.kpis.mfaTrend}
          icon={Shield}
          colorClass="text-violet-400"
          gradientClass="from-violet-500 to-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Login Trends Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Authentication Trends</h3>
            <select className="bg-surface-900 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.loginTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Successful" />
                <Area type="monotone" dataKey="failed" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Score */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-8 self-start w-full">Security Posture</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={data.securityScore >= 70 ? "#10b981" : data.securityScore >= 40 ? "#eab308" : "#f43f5e"} 
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * data.securityScore) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white">{data.securityScore}</span>
              <span className="text-sm text-slate-400 mt-1">/ 100</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Identity Protection</span>
              <span className="text-success-400 font-medium">92%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="bg-success-400 h-1.5 rounded-full" style={{ width: '92%' }}></div>
            </div>
            
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-400">Device Security</span>
              <span className="text-warning-400 font-medium">65%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="bg-warning-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Security Events</h3>
          <button className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">
            View All Logs
          </button>
        </div>
        <div className="space-y-4">
          {data.recentActivity.map((event: any) => (
            <div key={event.id} className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
              <div className={`p-2 rounded-lg mr-4 ${
                event.severity === 'CRITICAL' ? 'bg-danger-500/20 text-danger-400' :
                event.severity === 'WARNING' ? 'bg-warning-500/20 text-warning-400' :
                'bg-brand-500/20 text-brand-400'
              }`}>
                {event.severity === 'CRITICAL' ? <ShieldAlert className="w-5 h-5" /> :
                 event.severity === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
                 <ShieldCheck className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{event.type.replace(/_/g, ' ')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{event.user}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                  event.severity === 'CRITICAL' ? 'bg-danger-500/10 text-danger-400 border border-danger-500/20' :
                  event.severity === 'WARNING' ? 'bg-warning-500/10 text-warning-400 border border-warning-500/20' :
                  'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                }`}>
                  {event.severity}
                </span>
                <p className="text-xs text-slate-500 mt-1">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
