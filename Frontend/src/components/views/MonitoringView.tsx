import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../config/api'; // <-- IMPORT AXIOS KITA
import { socket } from '../../config/socket'; // <-- IMPORT SOCKET.IO KITA
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
  Activity, 
  Droplets, 
  EyeOff, 
  Layers, 
  Thermometer, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Download,
  Calendar,
  Maximize2
} from 'lucide-react';
import { SensorType, TimeRange, SensorStatus } from '../../types';

export const MonitoringView: React.FC = () => {
  // 1. Kita keluarkan telemetry & historicalData dari context, 
  // karena kita akan menggantinya dengan data asli dari Backend.
  const {
    thresholdConfigs,
    selectedSensorDetail,
    setSelectedSensorDetail,
    setActiveView,
    exportHistoryToCSV
  } = useApp();

  const [selectedSensor, setSelectedSensor] = useState<SensorType>('ph');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // =================================================================
  // BAGIAN INTEGRASI BACKEND & REAL-TIME IOT (MULAI)
  // =================================================================
  
  // State untuk menyimpan data asli dari database
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  // State untuk angka realtime di kartu atas
  const [telemetry, setTelemetry] = useState<any>({
    ph: { value: 0, status: 'offline' },
    turbidity: { value: 0, status: 'offline' },
    tds: { value: 0, status: 'offline' },
    temperature: { value: 0, status: 'offline' }
  });

  // A. Ambil Riwayat Data Saat Halaman Dibuka (Pakai Axios)
  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const response = await api.get('/readings?limit=80'); // Ambil 80 data terakhir
        const data = response.data.data;
        
        // Ubah format database agar cocok dengan format grafik UI Anda
        const formattedHistory = data.map((item: any) => ({
          timestamp: new Date(item.createdAt).toLocaleString('id-ID'),
          ph: item.ph,
          turbidity: item.turbidity,
          tds: item.tds,
          temperature: item.temperature,
          overallStatus: item.status?.toLowerCase() || 'normal'
        }));
        
        setHistoricalData(formattedHistory);

        // Pasang data paling baru ke kartu Telemetry
        if (data.length > 0) {
          const latest = data[0];
          setTelemetry({
            ph: { value: latest.ph, status: 'normal' },
            turbidity: { value: latest.turbidity, status: 'normal' },
            tds: { value: latest.tds, status: 'normal' },
            temperature: { value: latest.temperature, status: 'normal' }
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data historis:", error);
      }
    };
    
    fetchReadings();
  }, []);

  // B. Tangkap Data Real-Time dari Arduino via Socket.IO
  useEffect(() => {
    socket.connect(); // Nyalakan koneksi websocket

    // Dengarkan pancaran event "sensor:update" dari backend Node.js
    socket.on('sensor:update', (newData) => {
      const analysis = newData.analysis;
      
      // 1. Update Kartu Angka (Berubah instan tanpa refresh)
      setTelemetry({
        ph: { value: analysis.ph.value, status: analysis.ph.status.toLowerCase() },
        turbidity: { value: analysis.turbidity.value, status: analysis.turbidity.status.toLowerCase() },
        tds: { value: analysis.tds.value, status: analysis.tds.status.toLowerCase() },
        temperature: { value: analysis.temperature.value, status: analysis.temperature.status.toLowerCase() }
      });

      // 2. Tambahkan titik baru ke Grafik (Grafik bergerak maju)
      const newHistoryPoint = {
        timestamp: new Date(newData.timestamp).toLocaleString('id-ID'),
        ph: analysis.ph.value,
        turbidity: analysis.turbidity.value,
        tds: analysis.tds.value,
        temperature: analysis.temperature.value,
        overallStatus: analysis.overallStatus.toLowerCase()
      };

      setHistoricalData(prev => {
        const updated = [newHistoryPoint, ...prev];
        if(updated.length > 80) updated.pop(); // Jaga maksimal 80 titik agar tidak berat
        return updated;
      });
    });

    return () => {
      socket.off('sensor:update'); // Matikan listener jika pindah halaman
    };
  }, []);

  // =================================================================
  // BAGIAN INTEGRASI BACKEND & REAL-TIME IOT (SELESAI)
  // =================================================================


  // Compute graph data based on selected time range
  const chartData = useMemo(() => {
    const count = timeRange === '24h' ? 24 : timeRange === '7d' ? 50 : 80;
    const raw = historicalData.slice(0, count).reverse();

    return raw.map((item, index) => {
      const parts = item.timestamp.split(',');
      const timeLabel = parts[0] || `Point ${index}`;
      return {
        time: timeLabel,
        fullTimestamp: item.timestamp,
        ph: item.ph,
        turbidity: item.turbidity,
        tds: item.tds,
        temperature: item.temperature,
        status: item.overallStatus
      };
    });
  }, [historicalData, timeRange]);

  // Compute stats: Min, Max, Average for current sensor
  const stats = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = chartData.map(d => Number(d[selectedSensor]) || 0).filter(v => v > 0);
    if (values.length === 0) return { min: 0, max: 0, avg: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;

    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(avg.toFixed(2))
    };
  }, [chartData, selectedSensor]);

  const currentConfig = thresholdConfigs[selectedSensor];
  const currentReading = telemetry[selectedSensor];

  const sensorTabs: { type: SensorType; name: string; unit: string; icon: React.ReactNode; color: string }[] = [
    { type: 'ph', name: 'pH (Keasaman)', unit: 'pH', icon: <Droplets className="w-4 h-4" />, color: 'cyan' },
    { type: 'turbidity', name: 'Turbidity (Kekeruhan)', unit: 'NTU', icon: <EyeOff className="w-4 h-4" />, color: 'amber' },
    { type: 'tds', name: 'TDS (Padatan Terlarut)', unit: 'ppm', icon: <Layers className="w-4 h-4" />, color: 'indigo' },
    { type: 'temperature', name: 'Suhu Air', unit: '°C', icon: <Thermometer className="w-4 h-4" />, color: 'emerald' }
  ];

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sensor Normal
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" /> Sensor Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse">
            <Flame className="w-3.5 h-3.5" /> Sensor Kritis
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Radio className="w-3.5 h-3.5" /> Sensor Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center justify-between dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
            <Activity className="w-6 h-6 text-cyan-500" />
            Monitoring Sensor Analitik
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Analisis tren fluktuasi parameter kualitas air, kalkulasi statistik, dan kepatuhan baku mutu.
          </p>
        </div>

        {/* Timeframe selector (24h / 7d / 30d) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            {(['24h', '7d', '30d'] as TimeRange[]).map((period) => (
              <button
                key={period}
                id={`monitoring-period-${period}`}
                onClick={() => setTimeRange(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === period
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {period === '24h' ? '24 Jam' : period === '7d' ? '7 Hari' : '30 Hari'}
              </button>
            ))}
          </div>

          <button
            id="monitoring-export-btn"
            onClick={() => exportHistoryToCSV()}
            className="p-2 transition-colors border cursor-pointer text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border-slate-200/80 dark:border-slate-700/60"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sensor Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sensorTabs.map((tab) => {
          const isSelected = selectedSensor === tab.type;
          const reading = telemetry[tab.type];

          return (
            <button
              key={tab.type}
              id={`sensor-tab-${tab.type}`}
              onClick={() => setSelectedSensor(tab.type)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-[#0E131F] border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs'
                  : 'bg-white dark:bg-[#0E131F] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className={isSelected ? 'text-cyan-500' : 'text-slate-400'}>{tab.icon}</span>
                  <span className="truncate">{tab.name}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${
                  reading.status === 'normal' ? 'bg-emerald-500' : reading.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
              </div>

              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {reading.status === 'offline' ? '--' : reading.value}
                </span>
                <span className="text-xs font-bold font-mono text-slate-400">{tab.unit}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Chart & Sensor Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Main Chart Area (Span 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                Grafik Perubahan Nilai: {currentConfig?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data historis {timeRange === '24h' ? '24 Jam Terakhir' : timeRange === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="monitoring-view-deep-detail-btn"
                onClick={() => {
                  setSelectedSensorDetail(selectedSensor);
                  setActiveView('detail_sensor');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-200/80 dark:border-cyan-800/80 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Detail & Standar Sensor</span>
              </button>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sensorColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.12} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  dy={5}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 font-mono text-xs text-white border shadow-xl bg-slate-900/95 rounded-xl border-slate-700">
                          <p className="font-sans font-bold text-cyan-400 text-[11px] mb-1">{data.fullTimestamp}</p>
                          <p className="text-sm font-bold text-white">
                            {currentConfig?.name}: {data[selectedSensor]} {currentConfig?.unit}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize mt-1">Status: {data.status}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Visual Reference Lines for Thresholds */}
                {selectedSensor === 'ph' && (
                  <>
                    <ReferenceLine y={currentConfig.minNormal} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min Normal (6.5)', fill: '#10b981', fontSize: 10 }} />
                    <ReferenceLine y={currentConfig.maxNormal} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Max Normal (8.5)', fill: '#10b981', fontSize: 10 }} />
                  </>
                )}
                {selectedSensor === 'turbidity' && (
                  <ReferenceLine y={currentConfig.maxNormal} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Batas Normal (<5 NTU)', fill: '#f59e0b', fontSize: 10 }} />
                )}
                {selectedSensor === 'tds' && (
                  <ReferenceLine y={currentConfig.maxNormal} stroke="#6366f1" strokeDasharray="3 3" label={{ value: 'Batas Ideal (300 ppm)', fill: '#6366f1', fontSize: 10 }} />
                )}
                <Area
                  type="monotone"
                  dataKey={selectedSensor}
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sensorColorGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 text-xs border-t text-slate-400 border-slate-100 dark:border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-0.5 bg-cyan-500"></span>
              Nilai Sensor Terbaca
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block border-dashed w-2.5 h-0.5 bg-emerald-500"></span>
              Batas Ambang Normal
            </span>
            <span>Update Frekuensi: <strong>Realtime</strong></span>
          </div>
        </div>

        {/* Sensor Statistical Summary Cards (Span 4) */}
        <div className="space-y-4 lg:col-span-4">
          
          {/* Current Live State Card */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                Nilai Terkini
              </span>
              <div>{getStatusBadge(currentReading.status)}</div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                {currentReading.status === 'offline' ? '--' : currentReading.value}
              </span>
              <span className="text-base font-bold font-mono text-slate-500 dark:text-slate-400">
                {currentConfig?.unit}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
              <span>Rujukan Baku Mutu: </span>
              <strong className="block mt-0.5 text-slate-800 dark:text-slate-200">
                {currentConfig?.standardReference}
              </strong>
            </div>
          </div>

          {/* Min, Max, Average Summary Box */}
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Statistik Periode {timeRange.toUpperCase()}
            </h4>

            <div className="space-y-3">
              {/* Min Value */}
              <div className="flex items-center justify-between p-3 border bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 text-blue-600 bg-blue-100 rounded-xl dark:bg-blue-950/60 dark:text-blue-400">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Nilai Minimum</span>
                    <strong className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {stats.min} {currentConfig?.unit}
                    </strong>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Low</span>
              </div>

              {/* Max Value */}
              <div className="flex items-center justify-between p-3 border bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 text-rose-600 bg-rose-100 rounded-xl dark:bg-rose-950/60 dark:text-rose-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Nilai Maksimum</span>
                    <strong className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {stats.max} {currentConfig?.unit}
                    </strong>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Peak</span>
              </div>

              {/* Average Value */}
              <div className="flex items-center justify-between p-3 border bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 text-cyan-600 bg-cyan-100 rounded-xl dark:bg-cyan-950/60 dark:text-cyan-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Nilai Rata-rata (Avg)</span>
                    <strong className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {stats.avg} {currentConfig?.unit}
                    </strong>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Mean</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};