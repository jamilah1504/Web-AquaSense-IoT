import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../config/api'; // <-- IMPORT AXIOS KITA
import { 
  User, 
  Mail, 
  Shield, 
  Phone, 
  Building, 
  Key, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Camera,
  LogOut
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    logout,
    addToast // Kita ambil addToast untuk menampilkan notifikasi sukses/gagal
  } = useApp();

  // =================================================================
  // AMBIL DATA USER DARI LOCAL STORAGE (Hasil Login Backend)
  // =================================================================
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setName(parsedUser.name || '');
      setEmail(parsedUser.email || '');
      setPhone(parsedUser.phone || '');
      setDepartment(parsedUser.department || 'Operasional Pusat');
    }
  }, []);

  // Profile Edit State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // =================================================================
  // FUNGSI UPDATE KE BACKEND
  // =================================================================
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // INI DIAKTIFKAN: Tembak endpoint backend
      const response = await api.put('/auth/profile', { name, email, phone, department });
      
      // Update data di localStorage agar persisten menggunakan data RESMI DARI DATABASE
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      addToast({
        type: 'success',
        title: 'Profil Diperbarui',
        message: 'Perubahan data profil berhasil disimpan ke database.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan data profil.'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setIsSavingPassword(true);

    try {
      // INI DIAKTIFKAN: Tembak endpoint backend
      await api.put('/auth/password', { currentPassword, newPassword });
      
      addToast({
        type: 'success',
        title: 'Kata Sandi Diperbarui',
        message: 'Kata sandi berhasil diubah dengan aman di database.'
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center justify-between dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
            <User className="w-6 h-6 text-cyan-500" />
            Profil Pengguna & Keamanan Akun
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola data identitas akun operasional Anda dan perbarui kata sandi sistem.
          </p>
        </div>

        <button
          id="profile-logout-top-btn"
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200/80 dark:border-rose-800/80 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: User Summary Card (Span 4) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="block object-cover w-24 h-24 mx-auto rounded-full shadow-sm ring-4 ring-cyan-500/30"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentUser?.name || 'Memuat...'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser?.email || '...'}</p>
              <div className="inline-flex items-center gap-1 mt-2.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Shield className="w-3.5 h-3.5" />
                <span className="capitalize">{currentUser?.role === 'ADMIN' ? 'Administrator Sistem' : 'Petugas Lapangan'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-left text-xs space-y-2.5 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Building className="shrink-0 w-4 h-4 text-slate-400" />
                <span className="truncate">{department || 'Operasional Pusat'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="shrink-0 w-4 h-4 text-slate-400" />
                <span className="font-mono">{phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="shrink-0 w-4 h-4 text-slate-400" />
                <span>Login Terakhir: Hari ini</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms (Span 8) */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <User className="w-5 h-5 text-cyan-500" />
              Ubah Data Informasi Profil
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nama Lengkap
                  </label>
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Alamat Email
                  </label>
                  <input
                    id="profile-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    id="profile-phone-input"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm font-mono rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Divisi / Departemen
                  </label>
                  <input
                    id="profile-dept-input"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="profile-save-btn"
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSavingProfile ? (
                    <div className="w-4 h-4 border-2 rounded-full border-white/40 border-t-white animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Key className="w-5 h-5 text-amber-500" />
              Ubah Kata Sandi (Password)
            </h3>

            {passwordError && (
              <div className="flex items-center gap-2 p-3 text-xs border rounded-xl bg-rose-500/10 border-rose-500/30 text-rose-500">
                <AlertCircle className="shrink-0 w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi Saat Ini
                </label>
                <input
                  id="pass-current-input"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kata Sandi Baru (Min. 6 karakter)
                  </label>
                  <input
                    id="pass-new-input"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kata sandi baru"
                    className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    id="pass-confirm-input"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="pass-submit-btn"
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSavingPassword ? (
                    <div className="w-4 h-4 border-2 rounded-full border-white/40 border-t-white animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};