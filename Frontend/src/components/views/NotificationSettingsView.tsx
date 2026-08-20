import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../config/api'; // <-- Terhubung ke Backend
import { 
  MessageSquare, 
  PhoneCall, 
  Plus, 
  Trash2, 
  Send, 
  BellRing, 
  Clock, 
  UserPlus, 
  X, 
  AlertTriangle,
  Flame,
  Radio,
  WifiOff,
  Phone
} from 'lucide-react';
import { RecipientNumber } from '../../types';

export const NotificationSettingsView: React.FC = () => {
  const { addToast } = useApp();

  // State Utama Pengaturan WhatsApp dari Database MySQL
  const [whatsAppConfig, setWhatsAppConfig] = useState({
    isEnabled: true,
    triggerOnWarning: true,
    triggerOnCritical: true,
    triggerOnSensorOffline: false,
    triggerOnDeviceOffline: true,
    cooldownMinutes: 15,
    recipients: [] as any[]
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('+62 8');
  const [newRecipientRole, setNewRecipientRole] = useState('Petugas Lapangan');
  const [testPhoneNumber, setTestPhoneNumber] = useState('+62 812-9900-1122');
  const [isTesting, setIsTesting] = useState(false);

  // A. Ambil Konfigurasi dari Database saat Halaman Dibuka
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setWhatsAppConfig(response.data.data);
      }
    } catch (error) {
      console.error('Gagal memuat konfigurasi notifikasi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // B. Simpan Perubahan Konfigurasi ke Backend (Database)
  const updateWhatsAppConfig = async (updates: any) => {
    const updated = { ...whatsAppConfig, ...updates };
    setWhatsAppConfig(updated); // Update UI secara instan

    try {
      await api.put('/notifications/config', {
        isEnabled: updated.isEnabled,
        triggerOnWarning: updated.triggerOnWarning,
        triggerOnCritical: updated.triggerOnCritical,
        triggerOnSensorOffline: updated.triggerOnSensorOffline,
        triggerOnDeviceOffline: updated.triggerOnDeviceOffline,
        cooldownMinutes: updated.cooldownMinutes
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Gagal Menyimpan', message: 'Perubahan pengaturan gagal disimpan ke database.' });
      fetchConfig(); // Rollback jika gagal
    }
  };

  // C. Tambah Nomor Penerima Baru ke Database
  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientName.trim() || !newRecipientPhone.trim()) return;

    try {
      const response = await api.post('/notifications/recipients', {
        name: newRecipientName,
        phone: newRecipientPhone,
        role: newRecipientRole,
        isActive: true
      });

      if (response.data.success) {
        addToast({ type: 'success', title: 'Berhasil', message: 'Nomor penerima baru berhasil disimpan.' });
        fetchConfig(); 
        setNewRecipientName('');
        setNewRecipientPhone('+62 8');
        setIsAddModalOpen(false);
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Gagal', message: 'Tidak dapat menambahkan nomor penerima ke database.' });
    }
  };

  // D. Ubah Status Aktif / Nonaktif Nomor Penerima
  const handleUpdateRecipientStatus = async (id: string, currentActiveStatus: boolean) => {
    try {
      await api.put(`/notifications/recipients/${id}`, { isActive: !currentActiveStatus });
      fetchConfig();
    } catch (error) {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal memperbarui status nomor.' });
    }
  };

  // E. Hapus Nomor Penerima dari Database
  const handleDeleteRecipient = async (id: string) => {
    try {
      await api.delete(`/notifications/recipients/${id}`);
      addToast({ type: 'success', title: 'Terhapus', message: 'Nomor penerima berhasil dihapus dari database.' });
      fetchConfig();
    } catch (error) {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal menghapus nomor.' });
    }
  };

  // F. Uji Coba Kirim Pesan
  const handleTestSend = async () => {
    setIsTesting(true);
    try {
      await api.post('/notifications/test', { 
        phone: testPhoneNumber, 
        message: '⚠️ Test Simulasi Sistem AquaSense: Terhubung ke Database MySQL.' 
      });
      
      addToast({
        type: 'success',
        title: 'WhatsApp Terkirim',
        message: `Pesan uji coba berhasil disimulasikan ke ${testPhoneNumber}.`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Gagal Mengirim',
        message: 'Terjadi kesalahan saat mengirim pesan uji coba.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center justify-between dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
            <MessageSquare className="w-6 h-6 text-emerald-500" />
            Pengaturan Notifikasi & Integrasi WhatsApp Gateway
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Konfigurasi penerima broadcast WhatsApp otomatis ketika sensor mendeteksi anomali atau putus jaringan.
          </p>
        </div>

        {/* Global Master Toggle */}
        <div className="flex items-center gap-3 bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60">
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
            WhatsApp Gateway:
          </span>
          <button
            id="wa-master-toggle"
            onClick={() => updateWhatsAppConfig({ isEnabled: !whatsAppConfig.isEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              whatsAppConfig.isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                whatsAppConfig.isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Triggers & Cooldown Settings (Span 6) */}
        <div className="space-y-6 lg:col-span-6">
          
          {/* Triggers Condition Checkboxes */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <BellRing className="w-5 h-5 text-cyan-500" />
              Kondisi Pemicu Notifikasi WhatsApp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih kejadian apa saja yang akan mengirimkan pesan instan ke WhatsApp petugas:
            </p>

            <div className="pt-2 space-y-3">
              {/* Trigger Warning */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-amber-500 rounded-xl bg-amber-500/10">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold sm:text-sm text-slate-900 dark:text-white">
                      Peringatan (Warning Level)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Nilai sensor mendekati batas ambang kritis baku mutu.
                    </span>
                  </div>
                </div>
                <input
                  id="wa-trigger-warning"
                  type="checkbox"
                  checked={whatsAppConfig.triggerOnWarning}
                  onChange={(e) => updateWhatsAppConfig({ triggerOnWarning: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
                />
              </label>

              {/* Trigger Critical */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-rose-500 rounded-xl bg-rose-500/10">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold sm:text-sm text-slate-900 dark:text-white">
                      Bahaya Kritis (Critical Level)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Parameter air melampaui batas aman Permenkes/WHO.
                    </span>
                  </div>
                </div>
                <input
                  id="wa-trigger-critical"
                  type="checkbox"
                  checked={whatsAppConfig.triggerOnCritical}
                  onChange={(e) => updateWhatsAppConfig({ triggerOnCritical: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
                />
              </label>

              {/* Trigger Sensor Offline */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-orange-500 rounded-xl bg-orange-500/10">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold sm:text-sm text-slate-900 dark:text-white">
                      Sensor Terputus (Sensor Offline)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Probe elektroda rusak atau tidak memberikan sinyal kalibrasi.
                    </span>
                  </div>
                </div>
                <input
                  id="wa-trigger-sensor-offline"
                  type="checkbox"
                  checked={whatsAppConfig.triggerOnSensorOffline}
                  onChange={(e) => updateWhatsAppConfig({ triggerOnSensorOffline: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
                />
              </label>

              {/* Trigger Device Offline */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-slate-500 rounded-xl bg-slate-500/10">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold sm:text-sm text-slate-900 dark:text-white">
                      Perangkat Offline (Gateway Down)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Node IoT kehilangan daya atau koneksi LoRa/WiFi terputus.
                    </span>
                  </div>
                </div>
                <input
                  id="wa-trigger-device-offline"
                  type="checkbox"
                  checked={whatsAppConfig.triggerOnDeviceOffline}
                  onChange={(e) => updateWhatsAppConfig({ triggerOnDeviceOffline: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Cooldown Interval Selector */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Clock className="w-5 h-5 text-cyan-500" />
              Interval Cooldown Notifikasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mencegah spam pesan WhatsApp beruntun untuk insiden yang sama:
            </p>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  id={`cooldown-btn-${mins}`}
                  onClick={() => updateWhatsAppConfig({ cooldownMinutes: mins })}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    whatsAppConfig.cooldownMinutes === mins
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  {mins} Menit
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Recipient Phone Numbers & Test Dispatch (Span 6) */}
        <div className="space-y-6 lg:col-span-6">
          
          {/* Recipient Numbers List */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <PhoneCall className="w-5 h-5 text-emerald-500" />
                  Daftar Nomor Penerima WhatsApp
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {whatsAppConfig.recipients.filter((r: any) => r.isActive).length} nomor penerima aktif.
                </p>
              </div>

              <button
                id="wa-add-recipient-btn"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Nomor</span>
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              {whatsAppConfig.recipients.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 text-emerald-500 rounded-xl bg-emerald-500/10">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="block text-xs font-bold sm:text-sm text-slate-900 dark:text-white">
                          {rec.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                          {rec.role}
                        </span>
                      </div>
                      <span className="block mt-0.5 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {rec.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateRecipientStatus(rec.id, rec.isActive)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        rec.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {rec.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>

                    <button
                      onClick={() => handleDeleteRecipient(rec.id)}
                      className="p-1.5 transition-colors cursor-pointer text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                      title="Hapus Nomor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test WhatsApp Message Dispatch Box */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Send className="w-5 h-5 text-cyan-500" />
              Uji Coba Pengiriman WhatsApp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kirimkan simulasi payload alert telemetri untuk memastikan konektivitas bot WhatsApp:
            </p>

            <div className="flex flex-col items-center gap-2 pt-1 sm:flex-row">
              <input
                id="wa-test-phone-input"
                type="text"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="+62 812-xxxx-xxxx"
                className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm font-mono rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                id="wa-send-test-btn"
                onClick={handleTestSend}
                disabled={isTesting}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isTesting ? (
                  <div className="w-4 h-4 border-2 rounded-full border-white/40 border-t-white animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Test Pesan</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Add Recipient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                Tambah Nomor Penerima WhatsApp
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecipient} className="space-y-3.5">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Penerima / Unit
                </label>
                <input
                  id="wa-new-name"
                  type="text"
                  required
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                  placeholder="misal: Tim Lapangan Intake B"
                  className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp (dengan kode negara)
                </label>
                <input
                  id="wa-new-phone"
                  type="text"
                  required
                  value={newRecipientPhone}
                  onChange={(e) => setNewRecipientPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Peran / Jabatan
                </label>
                <input
                  id="wa-new-role"
                  type="text"
                  value={newRecipientRole}
                  onChange={(e) => setNewRecipientRole(e.target.value)}
                  placeholder="Koordinator Teknisi / Supervisor"
                  className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  id="wa-save-recipient-btn"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Simpan Nomor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};