import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../config/api'; // <-- IMPORT AXIOS
import { socket } from '../../config/socket'; // <-- IMPORT SOCKET
import { 
  Activity, 
  Droplets, 
  EyeOff, 
  Layers, 
  Thermometer, 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  ArrowUpRight, 
  CheckCircle2, 
  Radio, 
  Download, 
  MessageSquare, 
  ChevronRight, 
  BatteryCharging, 
  Signal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  RotateCcw
} from 'lucide-react';
import { SensorType, SensorStatus, StandardPresetType } from '../../types';
import { STANDARD_PRESETS } from '../../utils/constants';

export const DashboardView: React.FC = () => {
  const {
    thresholdConfigs,
    selectedDeviceId,
    setSelectedDeviceId,
    devices,
    alerts,
    setActiveView,
    setSelectedSensorDetail,
    setSelectedAlertForDetail,
    exportHistoryToCSV,
    isLiveSimulation,
    toggleSimulation,
    injectAnomalyScenario,
    soundAlertEnabled,
    toggleSoundAlert,
    activeStandardPreset,
    applyStandardPreset
  } = useApp();

  // =================================================================
  // STATE LOKAL UNTUK MENAMPUNG DATA DARI BACKEND & SOCKET
  // =================================================================
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [telemetry, setTelemetry] = useState({
    ph: { value: 7.2, status: 'normal' },
    turbidity: { value: 2.1, status: 'normal' },
    tds: { value: 250, status: 'normal' },
    temperature: { value: 26.5, status: 'normal' }
  });
  const [pingLatency, setPingLatency] = useState(24);
  const [packetsReceived, setPacketsReceived] = useState(1420);
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<Date>(new Date());
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(10);

  // A. Ambil Data Dashboard dari Backend saat pertama kali dibuka
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get(`/dashboard?deviceId=${selectedDeviceId}`);
        setDashboardData(response.data.data);
        if (response.data.data?.latestReading) {
          const r = response.data.data.latestReading;
          setTelemetry({
            ph: { value: r.ph, status: r.ph < 6.5 || r.ph > 8.5 ? 'warning' : 'normal' },
            turbidity: { value: r.turbidity, status: r.turbidity > 5 ? 'warning' : 'normal' },
            tds: { value: r.tds, status: r.tds > 300 ? 'warning' : 'normal' },
            temperature: { value: r.temperature, status: 'normal' }
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      }
    };

    fetchDashboard();
  }, [selectedDeviceId]);

  // B. Tangkap Real-time Update dari Arduino via Socket.IO
  useEffect(() => {
    socket.connect();

    socket.on('sensor:update', (newData) => {
      const analysis = newData.analysis;
      setTelemetry({
        ph: { value: analysis.ph.value, status: analysis.ph.status.toLowerCase() },
        turbidity: { value: analysis.turbidity.value, status: analysis.turbidity.status.toLowerCase() },
        tds: { value: analysis.tds.value, status: analysis.tds.status.toLowerCase() },
        temperature: { value: analysis.temperature.value, status: analysis.temperature.status.toLowerCase() }
      });
      setLastTelemetryUpdate(new Date());
      setPacketsReceived(prev => prev + 1);
    });

    return () => {
      socket.off('sensor:update');
    };
  }, []);

  const activeDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];
  const overallWaterQuality = dashboardData?.overallWaterQuality || 'normal';
  const overallQualityScore = dashboardData?.qualityScore || 95;
  const activeAlerts = alerts.filter(a => a.status === 'active');

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Normal
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
            <Flame className="w-3 h-3" /> Critical
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Radio className="w-3 h-3" /> Offline
          </span>
        );
    }
  };

  const sensorCards = [
    {
      type: 'ph' as SensorType,
      name: thresholdConfigs.ph?.name || 'Derajat Keasaman (pH)',
      value: telemetry.ph.value,
      unit: thresholdConfigs.ph?.unit || 'pH',
      status: telemetry.ph.status as SensorStatus,
      icon: <Droplets className="w-6 h-6 text-cyan-500" />,
      threshold: `Baku Mutu: ${thresholdConfigs.ph?.minNormal} - ${thresholdConfigs.ph?.maxNormal} pH`
    },
    {
      type: 'turbidity' as SensorType,
      name: thresholdConfigs.turbidity?.name || 'Kekeruhan (Turbidity)',
      value: telemetry.turbidity.value,
      unit: thresholdConfigs.turbidity?.unit || 'NTU',
      status: telemetry.turbidity.status as SensorStatus,
      icon: <EyeOff className="w-6 h-6 text-amber-500" />,
      threshold: `Baku Mutu: < ${thresholdConfigs.turbidity?.maxNormal} NTU`
    },
    {
      type: 'tds' as SensorType,
      name: thresholdConfigs.tds?.name || 'Total Dissolved Solids (TDS)',
      value: telemetry.tds.value,
      unit: thresholdConfigs.tds?.unit || 'ppm',
      status: telemetry.tds.status as SensorStatus,
      icon: <Layers className="w-6 h-6 text-indigo-500" />,
      threshold: `Baku Mutu: < ${thresholdConfigs.tds?.maxNormal} ppm`
    },
    {
      type: 'temperature' as SensorType,
      name: thresholdConfigs.temperature?.name || 'Suhu Air',
      value: telemetry.temperature.value,
      unit: thresholdConfigs.temperature?.unit || '°C',
      status: telemetry.temperature.status as SensorStatus,
      icon: <Thermometer className="w-6 h-6 text-emerald-500" />,
      threshold: `Baku Mutu: ${thresholdConfigs.temperature?.minNormal} - ${thresholdConfigs.temperature?.maxNormal} °C`
    }
  ];

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      
      {/* Top Welcome & Summary Header Bar */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center justify-between dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Dashboard Telemetri Realtime
            </h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex.full.w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
              <span className="relative inline-flex.full rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitoring kondisi kualitas air pada <strong className="text-slate-800 dark:text-slate-200">{activeDevice?.name}</strong>.
          </p>
        </div>

        {/* Live Network Indicators & Fast Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-audio-toggle-btn"
            onClick={toggleSoundAlert}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              soundAlertEnabled 
                ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            {soundAlertEnabled ? <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundAlertEnabled ? 'Audio Aktif' : 'Mute'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-mono">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{pingLatency}ms</span>
            <span className="text-slate-400">| #{packetsReceived}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <div className="text-left">
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                {lastTelemetryUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isLiveSimulation ? `Refresh in ${autoRefreshCountdown}s` : 'Paused'}
              </span>
            </div>
          </div>

          <button
            id="dashboard-export-csv-btn"
            onClick={() => exportHistoryToCSV()}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dynamic Node Selector Pill Strip */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white border dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 px-2 text-xs font-bold shrink-0 text-slate-500 dark:text-slate-400">
          <Radio className="w-4 h-4 text-cyan-500" />
          <span>Pilih Node IoT:</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {devices.map(dev => (
            <button
              key={dev.id}
              id={`dash-select-node-${dev.id}`}
              onClick={() => setSelectedDeviceId(dev.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                selectedDeviceId === dev.id
                  ? 'bg-cyan-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dev.status === 'online' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{dev.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({dev.id})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Standard Baku Mutu Presets Bar */}
      <div className="flex flex-col gap-3 p-3.5 bg-slate-50/80 dark:bg-[#0E131F]/60 sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 font-bold shrink-0 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Rujukan Baku Mutu Aktif:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(STANDARD_PRESETS) as StandardPresetType[]).map(presetKey => {
            const isSelected = activeStandardPreset === presetKey;
            return (
              <button
                key={presetKey}
                id={`dash-preset-${presetKey}`}
                onClick={() => applyStandardPreset(presetKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {STANDARD_PRESETS[presetKey].label.split('(')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Status & Device Overview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Overall Water Quality Card (Span 7) */}
        <div className="relative flex flex-col justify-between p-6 bg-white border lg:col-span-7 dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                Indeks Status Mutu Air
              </span>
              <h2 className="flex items-center gap-2.5 mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Kondisi {overallWaterQuality.toUpperCase()}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                {overallQualityScore}%
              </span>
              <p className="text-[11px] text-slate-400">Water Quality Score</p>
            </div>
          </div>

          {/* Progress Bar of Quality Score */}
          <div className="my-5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallWaterQuality === 'normal'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : overallWaterQuality === 'warning'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                    : 'bg-gradient-to-r from-rose-600 to-red-400 animate-pulse'
                }`}
                style={{ width: `${overallQualityScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1.5">
              <span>0% (Tercemar Kritis)</span>
              <span>50% (Peringatan / Fluktuasi)</span>
              <span className="font-bold text-emerald-500">100% (Aman & Baku Mutu)</span>
            </div>
          </div>

          {/* Diagnostic summary info */}
          <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block text-[10px]">Standar Rujukan</span>
              <strong className="block truncate text-slate-800 dark:text-slate-200">
                {STANDARD_PRESETS[activeStandardPreset]?.label.split('(')[0] || 'Permenkes 2/2023'}
              </strong>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block text-[10px]">Sensor Aktif</span>
              <strong className="text-slate-800 dark:text-slate-200">4 Parameter Terhubung</strong>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-400 block text-[10px]">Rekomendasi</span>
              <strong className={overallWaterQuality === 'normal' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {overallWaterQuality === 'normal' ? 'Air Siap Distribusi' : 'Perlu Pengawasan Filter'}
              </strong>
            </div>
          </div>
        </div>

        {/* Device Status & Health Card (Span 5) */}
        <div className="flex flex-col justify-between p-6 bg-white border lg:col-span-5 dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                Informasi Node IoT
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeDevice?.status === 'online'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80'
                }`}
              >
                {activeDevice?.status === 'online' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {activeDevice?.status?.toUpperCase()}
              </span>
            </div>

            <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white">
              {activeDevice?.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {activeDevice?.location}
            </p>

            {/* Device specs pills */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-sans">Device ID:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{activeDevice?.id}</span>
              </div>
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-sans">IP Gateway:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{activeDevice?.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Sinyal LoRa:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeDevice?.signalStrength}%</span>
                </div>
                <Signal className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Baterai Backup:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{activeDevice?.batteryLevel}%</span>
                </div>
                <BatteryCharging className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
          </div>

          <button
            id="dash-device-manage-btn"
            onClick={() => setActiveView('devices')}
            className="w-full mt-4 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Buka Device Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Quick Dynamic Scenario Injector Strip */}
      <div className="p-4 bg-white border dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Skenario Uji Cepat Dinamis (Simulasi Lingkungan)
            </span>
          </div>
          <button
            id="dash-toggle-live-sim"
            onClick={() => toggleSimulation()}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {isLiveSimulation ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{isLiveSimulation ? 'Jeda Simulasi' : 'Lanjutkan Live'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <button
            id="btn-scenario-rain"
            onClick={() => injectAnomalyScenario('rain')}
            className="p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors text-left flex items-center justify-between cursor-pointer"
          >
            <span>🌧️ Hujan & Kekeruhan</span>
          </button>
          <button
            id="btn-scenario-chemical"
            onClick={() => injectAnomalyScenario('chemical')}
            className="p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-semibold transition-colors text-left flex items-center justify-between cursor-pointer"
          >
            <span>🧪 Asam Kritis</span>
          </button>
          <button
            id="btn-scenario-saline"
            onClick={() => injectAnomalyScenario('saline')}
            className="p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-xs font-semibold transition-colors text-left flex items-center justify-between cursor-pointer"
          >
            <span>🧂 TDS Intrusi</span>
          </button>
          <button
            id="btn-scenario-heatwave"
            onClick={() => injectAnomalyScenario('heatwave')}
            className="p-2 rounded-xl bg-orange-50/70 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 border border-orange-200/80 dark:border-orange-800/60 text-orange-800 dark:text-orange-300 text-xs font-semibold transition-colors text-left flex items-center justify-between cursor-pointer"
          >
            <span>🌡️ Lonjakan Suhu</span>
          </button>
          <button
            id="btn-scenario-recovery"
            onClick={() => injectAnomalyScenario('recovery')}
            className="p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors text-left flex items-center justify-between cursor-pointer col-span-2 sm:col-span-1"
          >
            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Normalisasi</span>
          </button>
        </div>
      </div>

      {/* 4 Realtime Sensor Telemetry Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nilai Realtime Sensor & Status
            </h3>
          </div>
          <button
            id="dash-view-all-monitoring-btn"
            onClick={() => setActiveView('monitoring')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            <span>Lihat Grafik Lengkap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sensorCards.map((card) => (
            <div
              key={card.type}
              id={`dash-sensor-card-${card.type}`}
              onClick={() => {
                setSelectedSensorDetail(card.type);
                setActiveView('detail_sensor');
              }}
              className="bg-white dark:bg-[#0E131F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-cyan-500/50 dark:hover:border-cyan-500/40 transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <div>{getStatusBadge(card.status)}</div>
              </div>

              <div className="my-4">
                <span className="block text-xs font-medium truncate text-slate-500 dark:text-slate-400">
                  {card.name}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black tracking-tight font-mono text-slate-900 dark:text-white">
                    {card.status === 'offline' ? '--' : card.value}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-500 dark:text-slate-400">
                    {card.unit}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{card.threshold}</span>
                <span className="font-bold text-cyan-500 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Warnings & Active Alert Feed */}
      <div className="p-6 bg-white border dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ringkasan Warning & Alert Terbaru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeAlerts.length} peringatan aktif memerlukan perhatian operasional.
              </p>
            </div>
          </div>

          <button
            id="dash-open-alerts-view-btn"
            onClick={() => setActiveView('alerts')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Lihat Semua Alert ({alerts.length})
          </button>
        </div>

        {activeAlerts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  setSelectedAlertForDetail(alert);
                  setActiveView('alerts');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                  alert.level === 'critical'
                    ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60'
                    : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${alert.level === 'critical' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold tracking-wide uppercase text-slate-900 dark:text-white">
                      {alert.level} - {alert.sensorName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-3 mt-3 text-xs border-t border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Terbaca: <strong className="font-mono text-slate-800 dark:text-slate-200">{alert.currentValue} {alert.unit}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp: {alert.whatsappStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Semua Parameter Sensor dalam Batas Normal
            </h4>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              Tidak ada warning atau anomali yang terdeteksi pada sistem penampungan air saat ini.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};