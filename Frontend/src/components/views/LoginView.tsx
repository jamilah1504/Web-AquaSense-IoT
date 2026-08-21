import React, { useState } from 'react';
import { useApp } from '../../context/AppContext'; // <-- 1. Kembalikan useApp
import { login as backendLogin } from '../../services/auth.service'; // <-- 2. Import service backend kita
import { 
  Droplets, Lock, User, ShieldCheck, Activity, 
  AlertCircle, ArrowRight, Eye, EyeOff, Moon, Sun
} from 'lucide-react';

export const LoginView: React.FC = () => {
  // 3. Ambil fungsi login bawaan dari template Anda
  const { loginWithUser, isDarkMode, toggleDarkMode } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // A. Tembak API Backend Node.js
      const data = await backendLogin(email, password);

      // B. Simpan Token JWT ke LocalStorage agar Axios otomatis menggunakannya
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // C. Beritahu AppContext bahwa user sudah berhasil login!
      // Ini akan otomatis memicu transisi ke DashboardView tanpa me-refresh halaman
      loginWithUser(data.user);

    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Gagal terhubung ke server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 w-full sm:p-6 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] transition-colors duration-200">
      <button
        type="button"
        id="login-theme-toggle-btn"
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
        aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      >
        {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="grid items-center grid-cols-1 gap-8 w-full max-w-5xl lg:grid-cols-12">
        
        {/* Left Side: Product Branding & Features */}
        <div className="space-y-6 text-center text-slate-900 dark:text-white lg:col-span-6 lg:text-left">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Sistem Pemantauan IoT Terintegrasi</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/30">
                <Droplets className="text-white w-7 h-7" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                AquaSense <span className="text-cyan-400">IoT</span>
              </h1>
            </div>
            <p className="max-w-md mx-auto text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base lg:mx-0">
              Platform telemetri kualitas air modern berbasis IoT. Pantau parameter pH, Turbidity, TDS, dan Suhu secara realtime dengan notifikasi otomatis via WhatsApp.
            </p>
          </div>

          {/* Key Capabilities Pills */}
          <div className="grid max-w-md grid-cols-2 gap-3 pt-2 mx-auto text-left lg:mx-0">
            <div className="p-3 border rounded-xl bg-white/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <Activity className="w-4 h-4" />
                <span>Realtime Telemetry</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Update data sensor per detik dengan grafik interaktif.</p>
            </div>

            <div className="p-3 border rounded-xl bg-white/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Multi-Tier Alert</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Peringatan otomatis Normal, Warning, & Critical.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md mx-auto lg:col-span-6">
          <div className="p-6 border shadow-2xl bg-white/90 dark:bg-[#0E131F]/90 border-slate-200 dark:border-slate-800/80 rounded-2xl sm:p-8 backdrop-blur-xl">
            
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Masuk ke Sistem
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Gunakan kredensial Administrator atau Petugas Lapangan.
              </p>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 mb-4 text-xs border rounded-xl bg-rose-500/10 border-rose-500/30 text-rose-400 animate-shake">
                <AlertCircle className="shrink-0 w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aquasense.com"
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    aria-label="Tampilkan / Sembunyikan kata sandi"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-cyan-500" />
                  <span>Ingat saya di perangkat ini</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); }} className="text-cyan-400 hover:underline">
                  Lupa password?
                </a>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 mt-6 text-xs text-center border-t border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
              <span>Status Server IoT: </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected (Online)
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};