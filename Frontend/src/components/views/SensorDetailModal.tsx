import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  ArrowLeft, 
  Droplets, 
  EyeOff, 
  Layers, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Radio, 
  Cpu, 
  Calendar, 
  Activity, 
  Download, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react';
import { SensorType, SensorStatus } from '../../types';

export const SensorDetailView: React.FC = () => {
  const {
    selectedSensorDetail,
    setSelectedSensorDetail,
    telemetry,
    thresholdConfigs,
    historicalData,
    setActiveView,
    exportHistoryToCSV,
    activeDevice
  } = useApp();

  const currentSensor: SensorType = selectedSensorDetail || 'ph';
  const config = thresholdConfigs[currentSensor];
  const liveReading = telemetry[currentSensor];

  // Sensor specific metadata icons
  const sensorMeta: Record<SensorType, { title: string; subtitle: string; icon: React.ReactNode; color: string }> = {
    ph: {
      title: 'Derajat Keasaman Air (pH Meter)',
      subtitle: 'Sensor Elektroda Kaca Kombinasi BNC High Precision',
      icon: <Droplets className="w-6 h-6 text-cyan-500" />,
      color: 'cyan'
    },
    turbidity: {
      title: 'Tingkat Kekeruhan (Optical Turbidity)',
      subtitle: 'Sensor Hamburan Cahaya Inframerah 850nm Nephelometric',
      icon: <EyeOff className="w-6 h-6 text-amber-500" />,
      color: 'amber'
    },
    tds: {
      title: 'Total Dissolved Solids (TDS / Konduktivitas)',
      subtitle: 'Probe Konduktivitas Elektrik Titanium Alloy',
      icon: <Layers className="w-6 h-6 text-indigo-500" />,
      color: 'indigo'
    },
    temperature: {
      title: 'Suhu Air Termal (Water Temperature)',
      subtitle: 'Probe Termokopel Digital DS18B20 Waterproof Stainless',
      icon: <Thermometer className="w-6 h-6 text-emerald-500" />,
      color: 'emerald'
    }
  };

  const currentMeta = sensorMeta[currentSensor];

  // Chart data
  const chartData = useMemo(() => {
    return historicalData.slice(0, 30).reverse().map((item, idx) => {
      const parts = item.timestamp.split(',');
      return {
        time: parts[0] || `${idx}`,
        fullTime: item.timestamp,
        value: item[currentSensor],
        status: item.overallStatus
      };
    });
  }, [historicalData, currentSensor]);

  // Statistics calculation
  const stats = useMemo(() => {
    const raw = chartData.map(d => Number(d.value)).filter(v => v > 0);
    if (raw.length === 0) return { min: 0, max: 0, avg: 0, stdDev: 0, samples: 0 };

    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const sum = raw.reduce((a, b) => a + b, 0);
    const avg = sum / raw.length;

    const squareDiffs = raw.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(avg.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      samples: raw.length
    };
  }, [chartData]);

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Kondisi Normal
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4" /> Peringatan (Warning)
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <Flame className="w-4 h-4" /> Kritis (Critical)
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Radio className="w-4 h-4" /> Sensor Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Back Button & Sensor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E131F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="detail-sensor-back-btn"
            onClick={() => setActiveView('monitoring')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
            title="Kembali ke Monitoring"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentMeta.title}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentMeta.subtitle} &bull; Node: <strong className="text-slate-700 dark:text-slate-300">{activeDevice?.name}</strong>
            </p>
          </div>
        </div>

        {/* Sensor Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          {(['ph', 'turbidity', 'tds', 'temperature'] as SensorType[]).map((st) => (
            <button
              key={st}
              id={`detail-switch-${st}`}
              onClick={() => setSelectedSensorDetail(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                currentSensor === st
                  ? 'bg-white dark:bg-[#0E131F] text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Overview: Live Value & Threshold Ranges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Value Card (Span 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
                {currentMeta.icon}
              </div>
              <div>{getStatusBadge(liveReading.status)}</div>
            </div>

            <div className="my-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nilai Telemetri Saat Ini
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {liveReading.status === 'offline' ? '--' : liveReading.value}
                </span>
                <span className="text-xl font-bold font-mono text-slate-500 dark:text-slate-400">
                  {config?.unit}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {config?.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Batas Normal Aman:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                {config.minNormal} - {config.maxNormal} {config.unit}
              </strong>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Batas Peringatan (Warning):</span>
              <strong className="text-amber-600 dark:text-amber-400 font-mono">
                {config.minWarning} - {config.maxWarning} {config.unit}
              </strong>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Batas Bahaya (Critical):</span>
              <strong className="text-rose-600 dark:text-rose-400 font-mono">
                &gt; {config.maxWarning} {config.unit}
              </strong>
            </div>
          </div>
        </div>

        {/* Threshold Spectrum Visualizer & Standards (Span 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kepatuhan Standar Regulasi
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Baku Mutu Kualitas Air ({config?.standardReference})
            </h3>

            {/* Threshold Spectrum Bar Visualizer */}
            <div className="my-6 space-y-2">
              <div className="h-6 w-full rounded-xl overflow-hidden flex font-bold text-[10px] text-white shadow-inner">
                <div className="bg-emerald-500 flex items-center justify-center" style={{ width: '45%' }}>
                  Normal ({config.minNormal} - {config.maxNormal})
                </div>
                <div className="bg-amber-500 flex items-center justify-center" style={{ width: '30%' }}>
                  Warning ({config.maxNormal} - {config.maxWarning})
                </div>
                <div className="bg-rose-500 flex items-center justify-center" style={{ width: '25%' }}>
                  Critical (&gt;{config.maxWarning})
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0 {config.unit}</span>
                <span className="text-emerald-500 font-bold">Ideal</span>
                <span>Max {config.maxCritical} {config.unit}</span>
              </div>
            </div>

            {/* Diagnostics and Hardware Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Tanggal Kalibrasi</span>
                <strong className="text-slate-800 dark:text-slate-200">10 Agustus 2026</strong>
              </div>
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Interval Kalibrasi</span>
                <strong className="text-slate-800 dark:text-slate-200">Tiap 30 Hari</strong>
              </div>
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">Status Probe</span>
                <strong className="text-emerald-600 dark:text-emerald-400">Optimal (98%)</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <button
              id="detail-adjust-threshold-btn"
              onClick={() => setActiveView('thresholds')}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Ubah Parameter Ambang Batas di Pengaturan &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Historical Detailed Chart & Statistical Breakdown */}
      <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Grafik Historis Rinci (30 Titik Pembacaan Terakhir)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analisis pergerakan parameter {config?.name} secara komprehensif.
            </p>
          </div>

          <button
            id="detail-export-csv-btn"
            onClick={() => exportHistoryToCSV()}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Data Sensor</span>
          </button>
        </div>

        {/* Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="detailSensorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs font-mono">
                        <p className="font-sans font-bold text-cyan-400 text-[11px] mb-1">{data.fullTime}</p>
                        <p className="font-bold text-white text-sm">
                          {config?.name}: {data.value} {config?.unit}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={config.minNormal} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={config.maxNormal} stroke="#10b981" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2.5} fill="url(#detailSensorGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Statistical Metrices Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 block font-medium">Nilai Minimum</span>
            <strong className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
              {stats.min} {config?.unit}
            </strong>
          </div>
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 block font-medium">Nilai Maksimum</span>
            <strong className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
              {stats.max} {config?.unit}
            </strong>
          </div>
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 block font-medium">Rata-Rata (Mean)</span>
            <strong className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
              {stats.avg} {config?.unit}
            </strong>
          </div>
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 block font-medium">Standar Deviasi</span>
            <strong className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
              ±{stats.stdDev}
            </strong>
          </div>
        </div>

      </div>

    </div>
  );
};
