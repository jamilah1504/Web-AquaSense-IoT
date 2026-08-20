import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sliders, 
  Droplets, 
  EyeOff, 
  Layers, 
  Thermometer, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { SensorType, SensorThresholdConfig } from '../../types';

export const ThresholdsView: React.FC = () => {
  const {
    thresholdConfigs,
    updateThresholdConfig,
    resetThresholdsToStandard,
    currentUser
  } = useApp();

  const [formData, setFormData] = useState<Record<string, SensorThresholdConfig>>(thresholdConfigs);
  const [hasChanges, setHasChanges] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleChange = (sensor: SensorType, field: keyof SensorThresholdConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [sensor]: {
        ...prev[sensor],
        [field]: Number(value)
      }
    }));
    setHasChanges(true);
  };

  const handleSave = (sensor: SensorType) => {
    updateThresholdConfig(sensor, formData[sensor]);
    setHasChanges(false);
  };

  const handleSaveAll = () => {
    (['ph', 'turbidity', 'tds', 'temperature'] as SensorType[]).forEach(s => {
      updateThresholdConfig(s, formData[s]);
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    resetThresholdsToStandard();
    setFormData(thresholdConfigs);
    setHasChanges(false);
  };

  const sensorIcons: Record<SensorType, React.ReactNode> = {
    ph: <Droplets className="w-5 h-5 text-cyan-500" />,
    turbidity: <EyeOff className="w-5 h-5 text-amber-500" />,
    tds: <Layers className="w-5 h-5 text-indigo-500" />,
    temperature: <Thermometer className="w-5 h-5 text-emerald-500" />
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E131F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-500" />
            Pengaturan Ambang Batas (Threshold) Sensor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasi batas nilai Normal, Warning, dan Kritis yang memicu alert otomatis dan notifikasi WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="threshold-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Baku Mutu Standar</span>
          </button>

          {isAdmin && (
            <button
              id="threshold-save-all-btn"
              onClick={handleSaveAll}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Semua Perubahan</span>
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Anda masuk sebagai <strong>Petugas Lapangan</strong> (Read-Only). Masuk sebagai Administrator untuk mengubah parameter ambang batas.
          </span>
        </div>
      )}

      {/* Threshold Cards for 4 Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(['ph', 'turbidity', 'tds', 'temperature'] as SensorType[]).map((sensorKey) => {
          const item = formData[sensorKey] || thresholdConfigs[sensorKey];

          return (
            <div
              key={sensorKey}
              id={`threshold-card-${sensorKey}`}
              className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header with Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      {sensorIcons[sensorKey]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">Satuan: {item.unit}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50">
                    {item.standardReference}
                  </span>
                </div>

                {/* Range Input Fields Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Normal Range */}
                  <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      Rentang Normal (Aman)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Min</label>
                        <input
                          id={`threshold-min-normal-${sensorKey}`}
                          type="number"
                          step="0.1"
                          disabled={!isAdmin}
                          value={item.minNormal}
                          onChange={(e) => handleChange(sensorKey, 'minNormal', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Max</label>
                        <input
                          id={`threshold-max-normal-${sensorKey}`}
                          type="number"
                          step="0.1"
                          disabled={!isAdmin}
                          value={item.maxNormal}
                          onChange={(e) => handleChange(sensorKey, 'maxNormal', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warning Range */}
                  <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                      Batas Warning (Peringatan)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Min Warn</label>
                        <input
                          id={`threshold-min-warn-${sensorKey}`}
                          type="number"
                          step="0.1"
                          disabled={!isAdmin}
                          value={item.minWarning}
                          onChange={(e) => handleChange(sensorKey, 'minWarning', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Max Warn</label>
                        <input
                          id={`threshold-max-warn-${sensorKey}`}
                          type="number"
                          step="0.1"
                          disabled={!isAdmin}
                          value={item.maxWarning}
                          onChange={(e) => handleChange(sensorKey, 'maxWarning', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critical Limit Information */}
                <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-rose-800 dark:text-rose-300">Pemicu Alert Kritis:</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Nilai melampaui &gt; {item.maxWarning} {item.unit} atau di bawah &lt; {item.minWarning} {item.unit}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">Critical Zone</span>
                </div>
              </div>

              {/* Single Card Save Button */}
              {isAdmin && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    id={`threshold-save-single-${sensorKey}`}
                    onClick={() => handleSave(sensorKey)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
                  >
                    Terapkan untuk {item.name.split(' ')[0]}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
