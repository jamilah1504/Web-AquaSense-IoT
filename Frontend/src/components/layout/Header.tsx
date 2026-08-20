import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Moon, 
  Sun, 
  Menu, 
  Droplets, 
  Wifi, 
  WifiOff, 
  CheckCheck, 
  ExternalLink,
  ChevronDown,
  User,
  LogOut,
  Sliders,
  Settings,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    logout,
    activeView,
    setActiveView,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    isDarkMode,
    toggleDarkMode,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isNotificationsOpen,
    setIsNotificationsOpen,
    overallWaterQuality,
    alerts
  } = useApp();

  // Ambil data user riil dari localStorage (hasil login backend)
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Hitung notifikasi & alert secara riil
  const unreadNotificationsCount = notifications ? notifications.filter((n: any) => !n.isRead).length : 0;
  const activeAlertsCount = alerts ? alerts.filter((a: any) => a.status === 'active').length : 0;

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotificationsOpen]);

  const currentDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  AquaSense <span className="text-cyan-600 dark:text-cyan-400 font-bold text-[10px] bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">IoT</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Monitoring Kualitas Air Realtime</p>
              </div>
            </div>
          </div>

          {/* Center: Device Switcher Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentDevice?.status === 'online' ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>Perangkat:</span>
            </div>
            <select
              id="header-device-select"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              aria-label="Pilih perangkat IoT untuk dimonitor"
              className="text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-none rounded-lg px-2.5 py-1.5 outline-none shadow-xs cursor-pointer focus:ring-1 focus:ring-cyan-500"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.status === 'offline' ? '(Offline)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Actions (Quality Status Badge, Notifications, Theme, Profile) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Status Quality Indicator Pill */}
            <div
              onClick={() => setActiveView('alerts')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                overallWaterQuality === 'normal'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
                  : overallWaterQuality === 'warning'
                  ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80'
                  : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80 animate-pulse'
              }`}
              title="Klik untuk melihat detail alert kualitas air"
            >
              <span className={`w-2 h-2 rounded-full ${
                overallWaterQuality === 'normal' ? 'bg-emerald-500' : overallWaterQuality === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="capitalize">{overallWaterQuality} Quality</span>
              {activeAlertsCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 rounded-full font-bold">
                  {activeAlertsCount}
                </span>
              )}
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                id="header-notification-bell"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                aria-label="Lihat notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0E131F] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-0 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifikasi Realtime</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {unreadNotificationsCount} notifikasi belum dibaca
                      </p>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        id="notif-mark-all-read-btn"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Tandai Dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((notif: any) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.type === 'alert') setActiveView('alerts');
                          }}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-cyan-50/30 dark:bg-cyan-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                notif.level === 'critical' ? 'bg-rose-500' : notif.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {notif.title}
                              </h5>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                              {notif.timestamp}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 pl-3.5 line-clamp-2">
                            {notif.message}
                          </p>

                          {notif.whatsappStatus && (
                            <div className="mt-2 pl-3.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>WhatsApp: <strong className="capitalize">{notif.whatsappStatus}</strong></span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Tidak ada notifikasi saat ini.
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <button
                      id="notif-view-all-alerts"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveView('alerts');
                      }}
                      className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline px-2 py-1 cursor-pointer"
                    >
                      Buka Riwayat Alert &rarr;
                    </button>
                    <button
                      id="notif-view-wa-settings"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveView('notification_settings');
                      }}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 cursor-pointer"
                    >
                      Atur WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              id="header-theme-toggle-btn"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                id="header-profile-btn"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/40"
                />
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser?.name ? currentUser.name.split(' ')[0] : 'Admin'}
                  </div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 capitalize font-medium">
                    {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Petugas'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0E131F] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Administrator'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser?.email || 'admin@aquasense.com'}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      {currentUser?.role || 'ADMIN'}
                    </span>
                  </div>

                  <button
                    id="profile-dropdown-profile"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveView('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-cyan-500" />
                    <span>Profil & Pengaturan Akun</span>
                  </button>

                  <button
                    id="profile-dropdown-thresholds"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setActiveView('thresholds');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-cyan-500" />
                    <span>Pengaturan Threshold</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                  <button
                    id="profile-dropdown-logout"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};