import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../config/api'; // <-- Terhubung ke Backend jika diperlukan
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  AlertTriangle, 
  Cpu, 
  Sliders, 
  MessageSquare, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Droplets,
  ShieldCheck,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { ViewType } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    logout,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    alerts // Mengambil daftar alert riil dari app context / state
  } = useApp();

  // Ambil data user riil yang sedang login dari localStorage (hasil autentikasi backend)
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Hitung jumlah alert yang statusnya masih 'active' secara riil dari database/state
  const activeAlertsCount = alerts ? alerts.filter((a: any) => a.status === 'active').length : 0;

  const menuItems: {
    id: ViewType;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    adminOnly?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'monitoring',
      label: 'Monitoring Sensor',
      icon: <Activity className="w-5 h-5" />
    },
    {
      id: 'history',
      label: 'Riwayat Data',
      icon: <History className="w-5 h-5" />
    },
    {
      id: 'alerts',
      label: 'Warning / Alert',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: activeAlertsCount, // Menggunakan hitungan riil
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'profile',
      label: 'Profil Pengguna',
      icon: <User className="w-5 h-5" />
    }
  ];

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed left-0 top-0 z-40 lg:z-10 h-screen bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ease-in-out flex flex-col justify-between ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Top Header Section in Mobile */}
        <div className="h-16 px-4 lg:hidden flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                AquaSense <span className="text-cyan-600 dark:text-cyan-400 font-bold text-[10px] bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">IoT</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Monitoring Kualitas Air Realtime</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Tutup menu navigasi"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Top Header Section in Desktop */}
        <div className="hidden lg:flex items-center h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="flex items-center gap-2.5 w-full">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20 shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 transition-opacity duration-300">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 truncate">
                  AquaSense <span className="text-cyan-600 dark:text-cyan-400 font-bold text-[10px] bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">IoT</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Monitoring Kualitas Air Realtime</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className={`shrink-0 ${
                  isActive 
                    ? 'text-cyan-400 dark:text-cyan-600' 
                    : 'text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors'
                }`}>
                  {item.icon}
                </div>

                {!isSidebarCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip Indicator */}
                {isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile / Quick Info & Collapse Control */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          {/* User Preview */}
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-cyan-500/40"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 capitalize font-medium truncate">
                  {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Petugas Lapangan'}
                </p>
              </div>
              <button
                id="sidebar-logout-btn"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                id="sidebar-collapsed-logout-btn"
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Desktop Collapse Toggle Button */}
          <div className="hidden lg:flex justify-end pt-1">
            <button
              id="sidebar-desktop-collapse-btn"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[11px]">Ciutkan Menu</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};