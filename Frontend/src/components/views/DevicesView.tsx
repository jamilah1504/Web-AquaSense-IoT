import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Radio, 
  BatteryCharging, 
  Signal, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Plus, 
  Search, 
  Clock, 
  HardDrive, 
  Sliders,
  Power
} from 'lucide-react';
import { IoTDevice, SensorStatus, SensorType } from '../../types';

export const DevicesView: React.FC = () => {
  const {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    toggleDeviceStatus,
    rebootDevice,
    setActiveView
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSensorStatusDot = (status: SensorStatus) => {
    switch (status) {
      case 'normal':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Normal" />;
      case 'warning':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Warning" />;
      case 'critical':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" title="Critical" />;
      case 'offline':
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-400" title="Offline" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E131F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-500" />
            Device Management & Node IoT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola unit gateway telemetri, pantau konektivitas LoRa/WiFi, baterai, dan status probe sensor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
            Total {devices.length} Perangkat ({devices.filter(d => d.status === 'online').length} Online)
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="devices-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama perangkat, lokasi, ID node..."
            className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDevices.map((device) => {
          const isSelected = selectedDeviceId === device.id;
          const isOnline = device.status === 'online';

          return (
            <div
              key={device.id}
              id={`device-card-${device.id}`}
              className={`bg-white dark:bg-[#0E131F] rounded-2xl p-6 border transition-all shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                  : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {device.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {device.location}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isOnline
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                {/* Device Specifications Grid */}
                <div className="grid grid-cols-2 gap-2.5 my-5 text-xs font-mono">
                  <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-sans">Node ID</span>
                    <strong className="text-slate-800 dark:text-slate-200">{device.id}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-sans">Firmware</span>
                    <strong className="text-slate-800 dark:text-slate-200">{device.firmwareVersion}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-sans">IP Gateway</span>
                    <strong className="text-slate-800 dark:text-slate-200">{device.ipAddress}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-sans">MAC Address</span>
                    <strong className="text-slate-800 dark:text-slate-200">{device.macAddress}</strong>
                  </div>
                </div>

                {/* Battery, Signal & Last Seen */}
                <div className="flex items-center justify-between text-xs p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl mb-4">
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-4 h-4 text-emerald-500" />
                    <span>Sinyal: <strong className="font-mono">{device.signalStrength}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BatteryCharging className="w-4 h-4 text-cyan-500" />
                    <span>Baterai: <strong className="font-mono">{device.batteryLevel}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{device.lastSeen}</span>
                  </div>
                </div>

                {/* Attached Sensor Statuses */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status Sensor Terpasang:
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {(['ph', 'turbidity', 'tds', 'temperature'] as SensorType[]).map((st) => (
                      <div key={st} className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">{st}</span>
                        {getSensorStatusDot(device.sensorsStatus[st])}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <button
                  id={`device-select-btn-${device.id}`}
                  onClick={() => {
                    setSelectedDeviceId(device.id);
                    setActiveView('dashboard');
                  }}
                  className="px-3.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-cyan-200/80 dark:border-cyan-800/80"
                >
                  {isSelected ? '✓ Sedang Dimonitor' : 'Monitor Node Ini'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id={`device-toggle-status-${device.id}`}
                    onClick={() => toggleDeviceStatus(device.id)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs transition-colors cursor-pointer"
                    title={isOnline ? 'Putus Koneksi (Simulasi Offline)' : 'Hubungkan Kembali (Simulasi Online)'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    id={`device-reboot-btn-${device.id}`}
                    onClick={() => rebootDevice(device.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Kirim Sinyal Reboot"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reboot</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
