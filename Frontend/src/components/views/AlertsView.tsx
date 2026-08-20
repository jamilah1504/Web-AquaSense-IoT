import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Eye, 
  Filter, 
  Search, 
  Send, 
  CheckCheck, 
  X, 
  FileCheck,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { AlertRecord, AlertLevel, AlertStatus } from '../../types';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    resolveAlert,
    selectedAlertForDetail,
    setSelectedAlertForDetail,
    setPreviewWhatsAppAlert,
    sendWhatsAppSimulation,
    activeAlertsCount
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState<AlertRecord | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === 'active' && a.status !== 'active') return false;
    if (activeTab === 'resolved' && a.status !== 'resolved') return false;
    if (levelFilter !== 'all' && a.level !== levelFilter) return false;
    return true;
  });

  const getLevelBadge = (level: AlertLevel) => {
    switch (level) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Normal
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" /> Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse">
            <Flame className="w-3.5 h-3.5" /> Critical
          </span>
        );
    }
  };

  const handleOpenResolve = (alert: AlertRecord) => {
    setAlertToResolve(alert);
    setResolveNotes('');
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = () => {
    if (alertToResolve) {
      resolveAlert(alertToResolve.id, resolveNotes);
      setIsResolveModalOpen(false);
      setAlertToResolve(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E131F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Manajemen Warning & Alert Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau dan tindak lanjuti insiden deviasi parameter air. Terintegrasi dengan notifikasi WhatsApp otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 font-bold text-xs">
            {activeAlertsCount} Alert Aktif
          </span>
        </div>
      </div>

      {/* Filter Tabs & Level Selector */}
      <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            id="alerts-tab-all"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({alerts.length})
          </button>

          <button
            id="alerts-tab-active"
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Warning Aktif ({alerts.filter(a => a.status === 'active').length})</span>
          </button>

          <button
            id="alerts-tab-resolved"
            onClick={() => setActiveTab('resolved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resolved'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Selesai ({alerts.filter(a => a.status === 'resolved').length})
          </button>
        </div>

        {/* Tingkat Warning Level Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Tingkat:</span>
          <select
            id="alerts-level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            aria-label="Filter tingkat keparahan warning"
            className="text-xs font-medium bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">Semua Tingkat</option>
            <option value="critical">🔴 Critical Saja</option>
            <option value="warning">🟡 Warning Saja</option>
            <option value="normal">🟢 Normal</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid / List */}
      <div className="space-y-3.5">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCritical = alert.level === 'critical';
            const isActive = alert.status === 'active';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`bg-white dark:bg-[#0E131F] rounded-2xl p-5 sm:p-6 border transition-all shadow-xs ${
                  isActive
                    ? isCritical
                      ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/30 dark:bg-rose-950/20'
                      : 'border-amber-300 dark:border-amber-900/80 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200/80 dark:border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getLevelBadge(alert.level)}

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isActive
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {isActive ? 'Aktif Perlu Tindakan' : 'Telah Diselesaikan'}
                      </span>

                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.timestamp}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {alert.sensorName} pada {alert.deviceName}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>

                    {/* Sensor parameters metadata */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                      <span className="bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                        Nilai Terbaca: <strong className="text-slate-900 dark:text-white">{alert.currentValue} {alert.unit}</strong>
                      </span>
                      <span className="bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                        Batas Threshold: <strong>{alert.thresholdLimit}</strong>
                      </span>
                      {alert.resolvedBy && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-sans text-xs flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" /> Diselesaikan oleh {alert.resolvedBy} ({alert.resolvedAt})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/80 dark:border-slate-800/80">
                    {/* WhatsApp Status Button & Preview */}
                    <button
                      id={`alert-wa-preview-${alert.id}`}
                      onClick={() => setPreviewWhatsAppAlert(alert)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/80 transition-colors cursor-pointer"
                      title="Lihat Format Pesan WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp: {alert.whatsappStatus}</span>
                    </button>

                    {/* Resolve Button */}
                    {isActive ? (
                      <button
                        id={`alert-resolve-btn-${alert.id}`}
                        onClick={() => handleOpenResolve(alert)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesaikan (Resolve)</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">
                        Kasus Ditutup
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Tidak Ada Alert Sesuai Filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sistem berjalan lancar dan tidak ada anomali yang perlu ditindaklanjuti.
            </p>
          </div>
        )}
      </div>

      {/* Modal Selesaikan Alert */}
      {isResolveModalOpen && alertToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Tandai Alert Selesai
              </h3>
              <button onClick={() => setIsResolveModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{alertToResolve.sensorName}</p>
              <p className="text-slate-500 dark:text-slate-400">{alertToResolve.message}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Tindakan Petugas (Opsional):
              </label>
              <textarea
                id="alert-resolve-notes-input"
                rows={3}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Contoh: Dosis koagulan disesuaikan, filter dibersihkan..."
                className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                id="alert-resolve-confirm-btn"
                onClick={handleConfirmResolve}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Simpan & Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
