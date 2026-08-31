"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AppWindow,
  ScrollText,
  ShieldCheck,
  UserCircle,
  LogOut,
  Bell,
  Menu,
  X,
  Shield,
  ChevronDown
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Applications", href: "/dashboard/applications", icon: AppWindow },
    { name: "Audit Logs", href: "/dashboard/audit-logs", icon: ScrollText },
    { name: "Security", href: "/dashboard/security", icon: ShieldCheck },
    { name: "My Profile", href: "/dashboard/profile", icon: UserCircle },
  ];

  const getPageTitle = () => {
    const link = navLinks.find((link) => link.href === pathname || pathname.startsWith(link.href + "/"));
    return link ? link.name : "Dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 font-sans flex overflow-hidden selection:bg-brand-500/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Shield className="w-8 h-8 text-brand-500 mr-3 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            CloudGuard IAM
          </span>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-brand-400"
                  }`}
                />
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center px-3 py-3 mb-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || "Admin User"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-brand-900/20 rounded-full blur-[120px] pointer-events-none -z-10 transform -translate-y-1/2"></div>
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-surface-950/50 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center">
            <button
              className="lg:hidden text-slate-400 hover:text-white mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 border-2 border-[#0a0e1a]"></span>
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <button className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors">
              <span>{user?.name?.split(' ')[0] || "Admin"}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
