import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Radio, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle2, 
  Flame,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles
} from 'lucide-react';
import { SimulationPreset } from '../../types';

export const SimulationControlBar: React.FC = () => {
  const {
    isLiveSimulation,
    toggleSimulation,
    simulationPreset,
    setSimulationPreset,
    simulationSpeedMs,
    setSimulationSpeedMs,
    telemetry,
    setManualSensorValue,
    secondsSinceLastUpdate
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  const presets: { id: SimulationPreset; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: 'normal',
      label: 'Normal',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
      desc: 'pH 7.2, Turbidity 2.1 NTU, TDS 175 ppm, Suhu 25°C'
    },
    {
      id: 'warning',
      label: 'Warning',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
      desc: 'pH 8.8 (Basa), Kekeruhan 6.8 NTU, TDS 340 ppm'
    },
    {
      id: 'critical',
      label: 'Critical',
      icon: <Flame className="w-3.5 h-3.5" />,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
      desc: 'pH 9.5, Kekeruhan 14.5 NTU, TDS 640 ppm, Suhu 35°C'
    },
    {
      id: 'sensor_offline',
      label: 'Sensor Offline',
      icon: <Radio className="w-3.5 h-3.5" />,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/20',
      desc: 'Sensor pH & TDS terputus / error kalibrasi'
    },
    {
      id: 'device_offline',
      label: 'Device Offline',
      icon: <WifiOff className="w-3.5 h-3.5" />,
      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/20',
      desc: 'Jaringan IoT Gateway terputus total'
    }
  ];

  return (
    <aside aria-label="Panel Kontrol Simulasi IoT" className="bg-white/95 dark:bg-[#080C14]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-all z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Simulation Engine Status & Play/Pause */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700/50 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                {isLiveSimulation && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveSimulation ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </span>
              <span className="text-slate-700 dark:text-slate-200 text-[11px] font-mono">
                IoT: {isLiveSimulation ? 'LIVE' : 'PAUSED'}
              </span>
            </div>

            <button
              id="sim-toggle-play-btn"
              onClick={() => toggleSimulation()}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLiveSimulation
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
              title={isLiveSimulation ? 'Jeda Simulasi Data' : 'Mulai Simulasi Data'}
            >
              {isLiveSimulation ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-xs">{isLiveSimulation ? 'Jeda' : 'Jalan'}</span>
            </button>

            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden md:inline">
              Update {secondsSinceLastUpdate}d lalu
            </span>
          </div>

          {/* Center: Quick Scenario Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:inline mr-1">
              Preset:
            </span>
            {presets.map((p) => {
              const isSelected = simulationPreset === p.id;
              return (
                <button
                  key={p.id}
                  id={`sim-preset-${p.id}`}
                  onClick={() => setSimulationPreset(p.id)}
                  title={p.desc}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'ring-1.5 ring-cyan-500 shadow-xs ' + p.color
                      : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Sliders Toggle & Interval */}
          <div className="flex items-center gap-2">
            <select
              id="sim-speed-select"
              value={simulationSpeedMs}
              onChange={(e) => setSimulationSpeedMs(Number(e.target.value))}
              aria-label="Kecepatan interval pembaruan simulasi"
              className="text-xs bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value={1000}>Interval 1s</option>
              <option value={3000}>Interval 3s</option>
              <option value={5000}>Interval 5s</option>
            </select>

            <button
              id="sim-expand-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 font-semibold px-2 py-1 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tuning Probe</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expanded Manual Sensor Tuning Bar */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
            {/* pH Slider */}
            <div className="bg-slate-50/90 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">pH Level:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{telemetry.ph.value} pH</span>
              </div>
              <input
                id="manual-slider-ph"
                type="range"
                min="4"
                max="11"
                step="0.1"
                value={telemetry.ph.value}
                onChange={(e) => setManualSensorValue('ph', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>4.0 (Asam)</span>
                <span className="text-emerald-500 font-semibold">6.5 - 8.5 (Normal)</span>
                <span>11.0 (Basa)</span>
              </div>
            </div>

            {/* Turbidity Slider */}
            <div className="bg-slate-50/90 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Kekeruhan (Turbidity):</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{telemetry.turbidity.value} NTU</span>
              </div>
              <input
                id="manual-slider-turbidity"
                type="range"
                min="0"
                max="30"
                step="0.2"
                value={telemetry.turbidity.value}
                onChange={(e) => setManualSensorValue('turbidity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span className="text-emerald-500 font-semibold">0 - 5.0 NTU</span>
                <span className="text-amber-500">5 - 10 NTU</span>
                <span className="text-rose-500">&gt; 10 NTU</span>
              </div>
            </div>

            {/* TDS Slider */}
            <div className="bg-slate-50/90 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">TDS (Zat Terlarut):</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{telemetry.tds.value} ppm</span>
              </div>
              <input
                id="manual-slider-tds"
                type="range"
                min="50"
                max="900"
                step="10"
                value={telemetry.tds.value}
                onChange={(e) => setManualSensorValue('tds', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span className="text-emerald-500 font-semibold">&lt; 300 (Baik)</span>
                <span className="text-amber-500">300-500</span>
                <span className="text-rose-500">&gt; 500 (Kritis)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="bg-slate-50/90 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Suhu Air:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{telemetry.temperature.value} °C</span>
              </div>
              <input
                id="manual-slider-temp"
                type="range"
                min="15"
                max="40"
                step="0.5"
                value={telemetry.temperature.value}
                onChange={(e) => setManualSensorValue('temperature', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>15°C</span>
                <span className="text-emerald-500 font-semibold">22 - 28°C (Ideal)</span>
                <span>40°C</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
