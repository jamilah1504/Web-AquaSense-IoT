import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  UserProfile,
  UserRole,
  ViewType,
  SensorType,
  SensorStatus,
  SensorTelemetry,
  WaterQualityStatus,
  HistoricalRecord,
  AlertRecord,
  NotificationItem,
  IoTDevice,
  WhatsAppConfig,
  RecipientNumber,
  SensorThresholdConfig,
  SimulationPreset,
  StandardPresetType,
  ToastMessage,
  AlertLevel
} from '../types';
import {
  DEFAULT_THRESHOLDS,
  STANDARD_PRESETS,
  INITIAL_DEVICES,
  MOCK_USERS,
  INITIAL_WHATSAPP_CONFIG,
  generateInitialHistory,
  INITIAL_ALERTS,
  INITIAL_NOTIFICATIONS,
  buildWhatsAppMessageTemplate
} from '../utils/constants';

interface AppContextType {
  // Auth
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role?: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };

  // Navigation
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  selectedSensorDetail: SensorType;
  setSelectedSensorDetail: (sensor: SensorType) => void;
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;

  // Realtime Telemetry & Network
  telemetry: SensorTelemetry;
  overallWaterQuality: WaterQualityStatus;
  overallQualityScore: number;
  lastTelemetryUpdate: Date;
  secondsSinceLastUpdate: number;
  pingLatency: number;
  packetsReceived: number;
  autoRefreshCountdown: number;

  // Sound Audio Alerts
  soundAlertEnabled: boolean;
  toggleSoundAlert: () => void;

  // Simulation Engine
  isLiveSimulation: boolean;
  simulationPreset: SimulationPreset;
  setSimulationPreset: (preset: SimulationPreset) => void;
  toggleSimulation: (enabled?: boolean) => void;
  simulationSpeedMs: number;
  setSimulationSpeedMs: (ms: number) => void;
  setManualSensorValue: (sensor: SensorType, value: number) => void;
  injectAnomalyScenario: (scenario: 'rain' | 'chemical' | 'saline' | 'heatwave' | 'recovery') => void;

  // Devices
  devices: IoTDevice[];
  activeDevice: IoTDevice | undefined;
  toggleDeviceStatus: (deviceId: string) => void;
  setDeviceSensorStatus: (deviceId: string, sensor: SensorType, status: SensorStatus) => void;
  rebootDevice: (deviceId: string) => void;
  addNewDevice: (device: Omit<IoTDevice, 'installedDate' | 'lastSeen'>) => void;
  deleteDevice: (deviceId: string) => void;

  // Thresholds & Presets
  thresholdConfigs: Record<string, SensorThresholdConfig>;
  activeStandardPreset: StandardPresetType;
  updateThresholdConfig: (sensorType: SensorType, updated: Partial<SensorThresholdConfig>) => void;
  applyStandardPreset: (preset: StandardPresetType) => void;
  resetThresholdsToStandard: () => void;

  // Alerts
  alerts: AlertRecord[];
  activeAlertsCount: number;
  resolveAlert: (alertId: string, notes?: string) => void;
  selectedAlertForDetail: AlertRecord | null;
  setSelectedAlertForDetail: (alert: AlertRecord | null) => void;
  triggerManualAlert: (sensorType: SensorType, value: number, level: AlertLevel, message: string) => void;

  // Notifications & WhatsApp
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  whatsAppConfig: WhatsAppConfig;
  updateWhatsAppConfig: (cfg: Partial<WhatsAppConfig>) => void;
  addWhatsAppRecipient: (rec: Omit<RecipientNumber, 'id'>) => void;
  updateWhatsAppRecipient: (id: string, rec: Partial<RecipientNumber>) => void;
  deleteWhatsAppRecipient: (id: string) => void;
  sendWhatsAppSimulation: (alert: AlertRecord) => Promise<{ success: boolean; message: string }>;
  previewWhatsAppAlert: AlertRecord | null;
  setPreviewWhatsAppAlert: (alert: AlertRecord | null) => void;

  // Historical Records
  historicalData: HistoricalRecord[];
  addNewHistoricalRecord: (rec: Omit<HistoricalRecord, 'id' | 'timestamp'>) => void;
  clearHistoricalData: () => void;
  generateFreshHistoricalBatch: () => void;
  exportHistoryToCSV: (filteredData?: HistoricalRecord[]) => void;

  // UI States
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web Audio API helper for dynamic auditory feedback
function playAlertBeep(level: 'warning' | 'critical') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = level === 'critical' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(level === 'critical' ? 880 : 520, ctx.currentTime);
    if (level === 'critical') {
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.18);
    }
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (level === 'critical' ? 0.35 : 0.22));
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (level === 'critical' ? 0.35 : 0.22));
  } catch (e) {
    // Silently ignore if blocked by browser autoplay policy
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('aquasense_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Start logged out so the first open goes to the login page
  });

  const isAuthenticated = !!currentUser;

  // Navigation
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedSensorDetail, setSelectedSensorDetail] = useState<SensorType>('ph');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('DEV-AQ-001');

  // UI Theme & Layout
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('aquasense_theme') === 'dark';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Sound Alerts
  const [soundAlertEnabled, setSoundAlertEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aquasense_sound_alert') === 'true';
  });

  // Thresholds & Presets
  const [activeStandardPreset, setActiveStandardPreset] = useState<StandardPresetType>('permenkes');
  const [thresholdConfigs, setThresholdConfigs] = useState<Record<string, SensorThresholdConfig>>(() => {
    const saved = localStorage.getItem('aquasense_thresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_THRESHOLDS;
      }
    }
    return DEFAULT_THRESHOLDS;
  });

  // Devices
  const [devices, setDevices] = useState<IoTDevice[]>(() => {
    const saved = localStorage.getItem('aquasense_devices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEVICES;
      }
    }
    return INITIAL_DEVICES;
  });

  // WhatsApp Config
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    const saved = localStorage.getItem('aquasense_wa_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_WHATSAPP_CONFIG;
      }
    }
    return INITIAL_WHATSAPP_CONFIG;
  });

  // Alerts & Notifications
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => {
    const saved = localStorage.getItem('aquasense_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ALERTS;
      }
    }
    return INITIAL_ALERTS;
  });
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<AlertRecord | null>(null);
  const [previewWhatsAppAlert, setPreviewWhatsAppAlert] = useState<AlertRecord | null>(null);

  // Historical Records
  const [historicalData, setHistoricalData] = useState<HistoricalRecord[]>(() => generateInitialHistory(40));

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Simulation Engine State
  const [isLiveSimulation, setIsLiveSimulation] = useState<boolean>(true);
  const [simulationPreset, setSimulationPresetState] = useState<SimulationPreset>('normal');
  const [simulationSpeedMs, setSimulationSpeedMs] = useState<number>(3000);
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<Date>(new Date());
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState<number>(0);
  const [pingLatency, setPingLatency] = useState<number>(32);
  const [packetsReceived, setPacketsReceived] = useState<number>(1420);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<number>(3);

  // Current Live Telemetry readings
  const [telemetry, setTelemetry] = useState<SensorTelemetry>({
    ph: { value: 7.24, status: 'normal', lastUpdated: 'Baru saja' },
    turbidity: { value: 2.15, status: 'normal', lastUpdated: 'Baru saja' },
    tds: { value: 168, status: 'normal', lastUpdated: 'Baru saja' },
    temperature: { value: 25.4, status: 'normal', lastUpdated: 'Baru saja' }
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aquasense_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aquasense_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist alerts & devices
  useEffect(() => {
    localStorage.setItem('aquasense_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('aquasense_devices', JSON.stringify(devices));
  }, [devices]);

  // Toast Helpers
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = { ...toast, id, duration: toast.duration || 4500 };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleSoundAlert = () => {
    setSoundAlertEnabled(prev => {
      const next = !prev;
      localStorage.setItem('aquasense_sound_alert', String(next));
      addToast({
        type: next ? 'success' : 'info',
        title: next ? 'Audio Alert Diaktifkan' : 'Audio Alert Dibisukan',
        message: next ? 'Sistem akan membunyikan nada saat terdeteksi anomali/kritis.' : 'Peringatan suara dinonaktifkan.'
      });
      if (next) playAlertBeep('warning');
      return next;
    });
  };

  // Update timer ticks for "Last updated Xs ago" and countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const diffSec = Math.floor((Date.now() - lastTelemetryUpdate.getTime()) / 1000);
      setSecondsSinceLastUpdate(diffSec);

      setAutoRefreshCountdown(prev => {
        if (!isLiveSimulation) return Math.ceil(simulationSpeedMs / 1000);
        return prev > 1 ? prev - 1 : Math.ceil(simulationSpeedMs / 1000);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lastTelemetryUpdate, isLiveSimulation, simulationSpeedMs]);

  // Helper to determine single sensor status against threshold configs
  const evaluateSensorStatus = useCallback((sensorType: SensorType, val: number): SensorStatus => {
    const cfg = thresholdConfigs[sensorType];
    if (!cfg) return 'normal';

    if (sensorType === 'ph') {
      if (val < cfg.minCritical || val > cfg.maxCritical) return 'critical';
      if (val < cfg.minNormal || val > cfg.maxNormal) return 'warning';
      return 'normal';
    }

    if (sensorType === 'turbidity' || sensorType === 'tds') {
      if (val >= cfg.minCritical) return 'critical';
      if (val >= cfg.minWarning) return 'warning';
      return 'normal';
    }

    if (sensorType === 'temperature') {
      if (val < cfg.minCritical || val > cfg.maxCritical) return 'critical';
      if (val < cfg.minNormal || val > cfg.maxNormal) return 'warning';
      return 'normal';
    }

    return 'normal';
  }, [thresholdConfigs]);

  // Overall water quality & score calculation
  const { overallWaterQuality, overallQualityScore } = useMemo(() => {
    const statuses = [
      telemetry.ph.status,
      telemetry.turbidity.status,
      telemetry.tds.status,
      telemetry.temperature.status
    ];

    if (statuses.some(s => s === 'critical' || s === 'offline')) {
      return { overallWaterQuality: 'critical' as WaterQualityStatus, overallQualityScore: 42 };
    }
    if (statuses.some(s => s === 'warning')) {
      return { overallWaterQuality: 'warning' as WaterQualityStatus, overallQualityScore: 74 };
    }
    return { overallWaterQuality: 'normal' as WaterQualityStatus, overallQualityScore: 96 };
  }, [telemetry]);

  // Function to dispatch WhatsApp simulated notification
  const dispatchWhatsAppNotification = useCallback((alert: AlertRecord) => {
    if (!whatsAppConfig.isEnabled) return;
    
    if (alert.level === 'warning' && !whatsAppConfig.triggerOnWarning) return;
    if (alert.level === 'critical' && !whatsAppConfig.triggerOnCritical) return;

    const activeRecipients = whatsAppConfig.recipients.filter(r => r.isActive);
    if (activeRecipients.length === 0) return;

    addToast({
      type: alert.level === 'critical' ? 'error' : 'warning',
      title: `📲 WhatsApp Terkirim (${activeRecipients.length} Kontak)`,
      message: `Peringatan: ${alert.sensorName} (${alert.currentValue} ${alert.unit}) dikirim via WhatsApp Gateway.`
    });
  }, [whatsAppConfig, addToast]);

  // Simulation Engine Core Tick
  useEffect(() => {
    if (!isLiveSimulation) return;

    const timer = setInterval(() => {
      const now = new Date();
      setLastTelemetryUpdate(now);
      setPingLatency(Math.floor(26 + Math.random() * 18));
      setPacketsReceived(p => p + 1);

      const currDev = devices.find(d => d.id === selectedDeviceId);
      const isDeviceOffline = currDev?.status === 'offline';

      if (isDeviceOffline || simulationPreset === 'device_offline') {
        setTelemetry({
          ph: { value: 0, status: 'offline', lastUpdated: 'Node Offline' },
          turbidity: { value: 0, status: 'offline', lastUpdated: 'Node Offline' },
          tds: { value: 0, status: 'offline', lastUpdated: 'Node Offline' },
          temperature: { value: 0, status: 'offline', lastUpdated: 'Node Offline' }
        });
        return;
      }

      // Base values according to selected node for realism
      let basePh = 7.24;
      let baseTurb = 2.15;
      let baseTds = 170;
      let baseTemp = 25.4;

      if (selectedDeviceId === 'DEV-AQ-002') {
        basePh = 6.85;
        baseTurb = 5.40; // IPA filter slightly more turbid
        baseTds = 280;
        baseTemp = 26.8;
      } else if (selectedDeviceId === 'DEV-AQ-003') {
        basePh = 7.40;
        baseTurb = 0.85; // Clean filtered distribution
        baseTds = 110;
        baseTemp = 24.9;
      }

      let newPhVal = basePh;
      let newTurbVal = baseTurb;
      let newTdsVal = baseTds;
      let newTempVal = baseTemp;

      let phStat: SensorStatus = 'normal';
      let turbStat: SensorStatus = 'normal';
      let tdsStat: SensorStatus = 'normal';
      let tempStat: SensorStatus = 'normal';

      if (simulationPreset === 'normal') {
        newPhVal = basePh + (Math.random() * 0.3 - 0.15);
        newTurbVal = baseTurb + (Math.random() * 0.6 - 0.3);
        newTdsVal = baseTds + Math.round(Math.random() * 16 - 8);
        newTempVal = baseTemp + (Math.random() * 0.4 - 0.2);

        phStat = evaluateSensorStatus('ph', newPhVal);
        turbStat = evaluateSensorStatus('turbidity', newTurbVal);
        tdsStat = evaluateSensorStatus('tds', newTdsVal);
        tempStat = evaluateSensorStatus('temperature', newTempVal);
      } else if (simulationPreset === 'warning') {
        newPhVal = 8.75 + (Math.random() * 0.2 - 0.1);
        newTurbVal = 6.80 + (Math.random() * 0.8 - 0.4);
        newTdsVal = 340 + Math.round(Math.random() * 20 - 10);
        newTempVal = 29.8 + (Math.random() * 0.6 - 0.3);

        phStat = 'warning';
        turbStat = 'warning';
        tdsStat = 'warning';
        tempStat = 'warning';
      } else if (simulationPreset === 'critical') {
        newPhVal = 9.45 + (Math.random() * 0.3 - 0.1);
        newTurbVal = 14.50 + (Math.random() * 2.0 - 1.0);
        newTdsVal = 640 + Math.round(Math.random() * 40 - 20);
        newTempVal = 35.2 + (Math.random() * 0.8 - 0.4);

        phStat = 'critical';
        turbStat = 'critical';
        tdsStat = 'critical';
        tempStat = 'critical';
      } else if (simulationPreset === 'sensor_offline') {
        newPhVal = 0;
        newTurbVal = 2.4;
        newTdsVal = 0;
        newTempVal = 25.1;

        phStat = 'offline';
        turbStat = 'normal';
        tdsStat = 'offline';
        tempStat = 'normal';
      }

      // Check probe disabled in active device
      if (currDev?.sensorsStatus) {
        if (currDev.sensorsStatus.ph === 'offline') { newPhVal = 0; phStat = 'offline'; }
        if (currDev.sensorsStatus.turbidity === 'offline') { newTurbVal = 0; turbStat = 'offline'; }
        if (currDev.sensorsStatus.tds === 'offline') { newTdsVal = 0; tdsStat = 'offline'; }
        if (currDev.sensorsStatus.temperature === 'offline') { newTempVal = 0; tempStat = 'offline'; }
      }

      const updatedTelemetry: SensorTelemetry = {
        ph: {
          value: parseFloat(newPhVal.toFixed(2)),
          status: phStat,
          lastUpdated: 'Baru saja'
        },
        turbidity: {
          value: parseFloat(newTurbVal.toFixed(2)),
          status: turbStat,
          lastUpdated: 'Baru saja'
        },
        tds: {
          value: Math.round(newTdsVal),
          status: tdsStat,
          lastUpdated: 'Baru saja'
        },
        temperature: {
          value: parseFloat(newTempVal.toFixed(1)),
          status: tempStat,
          lastUpdated: 'Baru saja'
        }
      };

      setTelemetry(updatedTelemetry);

      // Sound chime if critical / warning and sound enabled
      if (soundAlertEnabled && (simulationPreset === 'critical' || phStat === 'critical' || turbStat === 'critical' || tdsStat === 'critical')) {
        playAlertBeep('critical');
      }

      // Append to historical dataset
      const dateStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' +
                      now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

      const overall = (phStat === 'critical' || turbStat === 'critical' || tdsStat === 'critical' || tempStat === 'critical')
        ? 'critical'
        : (phStat === 'warning' || turbStat === 'warning' || tdsStat === 'warning' || tempStat === 'warning')
        ? 'warning'
        : 'normal';

      const newHistRecord: HistoricalRecord = {
        id: `HIST-${Date.now().toString().slice(-6)}`,
        timestamp: dateStr,
        deviceId: selectedDeviceId,
        deviceName: currDev?.name || 'Reservoir Utama Gedung A',
        ph: updatedTelemetry.ph.value,
        turbidity: updatedTelemetry.turbidity.value,
        tds: updatedTelemetry.tds.value,
        temperature: updatedTelemetry.temperature.value,
        overallStatus: overall,
        remarks: overall === 'critical' ? 'Parameter kritis melebihi ambang batas' : overall === 'warning' ? 'Fluktuasi sensor terdeteksi' : 'Kualitas air normal sesuai baku mutu'
      };

      setHistoricalData(prev => [newHistRecord, ...prev.slice(0, 150)]);

      // Check if we should generate an active alert for warning/critical
      if (simulationPreset === 'warning' || simulationPreset === 'critical') {
        const isCritical = simulationPreset === 'critical';
        const level: 'warning' | 'critical' = isCritical ? 'critical' : 'warning';
        
        setAlerts(prevAlerts => {
          const hasActiveSame = prevAlerts.some(a => a.status === 'active' && a.level === level);
          if (hasActiveSame) return prevAlerts;

          const newAlert: AlertRecord = {
            id: `ALT-${Date.now().toString().slice(-4)}`,
            timestamp: 'Baru saja (' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB)',
            deviceId: selectedDeviceId,
            deviceName: currDev?.name || 'Reservoir Utama Gedung A',
            sensorType: isCritical ? 'tds' : 'turbidity',
            sensorName: isCritical ? 'Total Dissolved Solids (TDS)' : 'Kekeruhan (Turbidity)',
            level: level,
            status: 'active',
            currentValue: isCritical ? updatedTelemetry.tds.value : updatedTelemetry.turbidity.value,
            thresholdLimit: isCritical ? '> 500 ppm' : '> 5.0 NTU',
            unit: isCritical ? 'ppm' : 'NTU',
            message: isCritical 
              ? 'TDS melampaui batas aman kritis (640 ppm > 500 ppm). Segera cek sumber air baku.'
              : 'Kekeruhan air melebihi standar normal (6.80 NTU > 5.0 NTU). Lakukan flushing filter.',
            whatsappStatus: 'sent',
            whatsappSentAt: 'Baru saja'
          };

          const newNotif: NotificationItem = {
            id: `NOTIF-${Date.now()}`,
            timestamp: 'Baru saja',
            title: `Peringatan Kualitas Air: ${newAlert.sensorName}`,
            message: newAlert.message,
            level: level,
            isRead: false,
            type: 'alert',
            whatsappStatus: 'sent',
            recipientPhone: '+62 812-9900-1122'
          };

          setNotifications(nPrev => [newNotif, ...nPrev]);
          dispatchWhatsAppNotification(newAlert);

          return [newAlert, ...prevAlerts];
        });
      }
    }, simulationSpeedMs);

    return () => clearInterval(timer);
  }, [
    isLiveSimulation, 
    simulationPreset, 
    simulationSpeedMs, 
    evaluateSensorStatus, 
    selectedDeviceId, 
    devices, 
    dispatchWhatsAppNotification,
    soundAlertEnabled
  ]);

  // Quick Anomaly Scenario Injections
  const injectAnomalyScenario = (scenario: 'rain' | 'chemical' | 'saline' | 'heatwave' | 'recovery') => {
    if (scenario === 'rain') {
      setManualSensorValue('turbidity', 12.8);
      addToast({ type: 'warning', title: 'Skenario: Hujan Lebat & Erosi', message: 'Kekeruhan air melonjak ke 12.8 NTU akibat limpasan air hujan.' });
    } else if (scenario === 'chemical') {
      setManualSensorValue('ph', 4.3);
      addToast({ type: 'error', title: 'Skenario: Kontaminasi Asam', message: 'pH air anjlok ke 4.3 pH (Asam Kritis).' });
    } else if (scenario === 'saline') {
      setManualSensorValue('tds', 680);
      addToast({ type: 'error', title: 'Skenario: Intrusi Mineral / Garam', message: 'TDS melonjak ke 680 ppm (Kritis).' });
    } else if (scenario === 'heatwave') {
      setManualSensorValue('temperature', 36.8);
      addToast({ type: 'warning', title: 'Skenario: Pemanasan Suhu', message: 'Suhu air meningkat menjadi 36.8 °C.' });
    } else {
      setSimulationPresetState('normal');
      setTelemetry({
        ph: { value: 7.25, status: 'normal', lastUpdated: 'Baru saja' },
        turbidity: { value: 2.10, status: 'normal', lastUpdated: 'Baru saja' },
        tds: { value: 175, status: 'normal', lastUpdated: 'Baru saja' },
        temperature: { value: 25.4, status: 'normal', lastUpdated: 'Baru saja' }
      });
      addToast({ type: 'success', title: 'Skenario: Pemulihan Normal', message: 'Seluruh parameter kualitas air dinormalisasi ke standar baku mutu.' });
    }
  };

  // Auth Functions
  const login = (username: string, password: string, rolePreference?: UserRole) => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Username dan Password wajib diisi!' };
    }

    if (username === 'admin' || username === 'admin@aquasense.id' || rolePreference === 'admin') {
      const user = MOCK_USERS.admin;
      setCurrentUser(user);
      localStorage.setItem('aquasense_user', JSON.stringify(user));
      addToast({
        type: 'success',
        title: 'Login Berhasil',
        message: `Selamat datang kembali, ${user.name} (Administrator).`
      });
      return { success: true };
    }

    if (username === 'petugas' || username === 'petugas@aquasense.id' || rolePreference === 'petugas') {
      const user = MOCK_USERS.petugas;
      setCurrentUser(user);
      localStorage.setItem('aquasense_user', JSON.stringify(user));
      addToast({
        type: 'success',
        title: 'Login Berhasil',
        message: `Selamat datang kembali, ${user.name} (Petugas Lapangan).`
      });
      return { success: true };
    }

    // Default fallback allow login with inputted username
    const customUser: UserProfile = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: `${username.toLowerCase()}@aquasense.id`,
      username: username,
      role: 'petugas',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: '+62 812-0000-1111',
      department: 'Divisi Operasional Lapangan',
      lastLogin: 'Baru saja'
    };
    setCurrentUser(customUser);
    localStorage.setItem('aquasense_user', JSON.stringify(customUser));
    addToast({
      type: 'success',
      title: 'Login Berhasil',
      message: `Selamat datang, ${customUser.name}.`
    });
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aquasense_user');
    addToast({
      type: 'info',
      title: 'Logout Berhasil',
      message: 'Anda telah keluar dari sesi sistem AquaSense.'
    });
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('aquasense_user', JSON.stringify(updated));
    addToast({
      type: 'success',
      title: 'Profil Diperbarui',
      message: 'Perubahan data profil Anda berhasil disimpan.'
    });
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!oldPass || !newPass) {
      return { success: false, message: 'Harap lengkapi semua kolom kata sandi!' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter!' };
    }
    addToast({
      type: 'success',
      title: 'Kata Sandi Diperbarui',
      message: 'Kata sandi akun Anda telah berhasil diubah.'
    });
    return { success: true, message: 'Kata sandi berhasil diubah.' };
  };

  // Simulation Controls
  const setSimulationPreset = (preset: SimulationPreset) => {
    setSimulationPresetState(preset);
    const names = {
      normal: '🟢 Normal (Semua Parameter Aman)',
      warning: '🟡 Warning (Keasaman & Kekeruhan Naik)',
      critical: '🔴 Critical (TDS Tinggi & Suhu Ekstrem)',
      sensor_offline: '⚠️ Sensor Sebagian Offline',
      device_offline: '📡 Device Putus Jaringan (Offline)'
    };
    addToast({
      type: preset === 'critical' ? 'error' : preset === 'warning' ? 'warning' : 'info',
      title: 'Skenario Simulasi Aktif',
      message: names[preset]
    });
  };

  const toggleSimulation = (enabled?: boolean) => {
    setIsLiveSimulation(prev => {
      const next = enabled !== undefined ? enabled : !prev;
      addToast({
        type: next ? 'success' : 'warning',
        title: next ? 'Simulasi Live Dimulai' : 'Simulasi Live Dijeda',
        message: next ? 'Data sensor berfluktuasi secara otomatis.' : 'Data sensor dalam status freeze (statis).'
      });
      return next;
    });
  };

  const setManualSensorValue = (sensor: SensorType, value: number) => {
    const status = evaluateSensorStatus(sensor, value);
    setTelemetry(prev => ({
      ...prev,
      [sensor]: {
        value,
        status,
        lastUpdated: 'Diatur manual'
      }
    }));
    setLastTelemetryUpdate(new Date());

    if (status === 'critical' || status === 'warning') {
      const now = new Date();
      const newAlert: AlertRecord = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        timestamp: 'Baru saja (' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB)',
        deviceId: selectedDeviceId,
        deviceName: devices.find(d => d.id === selectedDeviceId)?.name || 'Reservoir Utama',
        sensorType: sensor,
        sensorName: thresholdConfigs[sensor]?.name || sensor,
        level: status,
        status: 'active',
        currentValue: value,
        thresholdLimit: status === 'critical' ? `Kritis (${thresholdConfigs[sensor]?.minCritical})` : `Warning`,
        unit: thresholdConfigs[sensor]?.unit || '',
        message: `Nilai ${thresholdConfigs[sensor]?.name} diubah manual menjadi ${value} ${thresholdConfigs[sensor]?.unit} (${status.toUpperCase()}).`,
        whatsappStatus: 'sent',
        whatsappSentAt: 'Baru saja'
      };

      setAlerts(p => [newAlert, ...p]);
      dispatchWhatsAppNotification(newAlert);
      if (soundAlertEnabled && (status === 'critical' || status === 'warning')) {
        playAlertBeep(status);
      }
    }
  };

  // Device Management actions
  const toggleDeviceStatus = (deviceId: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const nextStatus = d.status === 'online' ? 'offline' : 'online';
        addToast({
          type: nextStatus === 'online' ? 'success' : 'warning',
          title: `Status Perangkat Berubah`,
          message: `${d.name} sekarang ${nextStatus.toUpperCase()}.`
        });
        return {
          ...d,
          status: nextStatus,
          lastSeen: nextStatus === 'online' ? 'Baru saja' : 'Offline manual'
        };
      }
      return d;
    }));
  };

  const setDeviceSensorStatus = (deviceId: string, sensor: SensorType, status: SensorStatus) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          sensorsStatus: {
            ...d.sensorsStatus,
            [sensor]: status
          }
        };
      }
      return d;
    }));

    addToast({
      type: 'info',
      title: 'Status Sensor Probe Diubah',
      message: `Probe ${sensor.toUpperCase()} diubah menjadi ${status.toUpperCase()}.`
    });
  };

  const rebootDevice = (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    addToast({
      type: 'info',
      title: 'Memulai Ulang Perangkat',
      message: `Perintah reboot dikirim ke ${dev?.name || deviceId}...`
    });

    setTimeout(() => {
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'online', lastSeen: 'Baru saja (Rebooted)' } : d));
      addToast({
        type: 'success',
        title: 'Perangkat Online',
        message: `${dev?.name || deviceId} telah berhasil booting kembali.`
      });
    }, 2000);
  };

  const addNewDevice = (newDev: Omit<IoTDevice, 'installedDate' | 'lastSeen'>) => {
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const fullDevice: IoTDevice = {
      ...newDev,
      installedDate: today,
      lastSeen: 'Baru saja didaftarkan'
    };

    setDevices(prev => [fullDevice, ...prev]);
    setSelectedDeviceId(fullDevice.id);

    addToast({
      type: 'success',
      title: 'Node IoT Berhasil Ditambahkan',
      message: `${fullDevice.name} (${fullDevice.id}) siap dimonitor.`
    });
  };

  const deleteDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    if (selectedDeviceId === deviceId) {
      const remaining = devices.filter(d => d.id !== deviceId);
      if (remaining.length > 0) {
        setSelectedDeviceId(remaining[0].id);
      }
    }
    addToast({
      type: 'info',
      title: 'Perangkat Dihapus',
      message: `Node ${deviceId} telah dihapus dari jaringan.`
    });
  };

  // Thresholds & Presets actions
  const updateThresholdConfig = (sensorType: SensorType, updated: Partial<SensorThresholdConfig>) => {
    setThresholdConfigs(prev => {
      const next = {
        ...prev,
        [sensorType]: {
          ...prev[sensorType],
          ...updated
        }
      };
      localStorage.setItem('aquasense_thresholds', JSON.stringify(next));
      return next;
    });

    addToast({
      type: 'success',
      title: 'Threshold Diperbarui',
      message: `Pengaturan ambang batas ${thresholdConfigs[sensorType]?.name || sensorType} berhasil disimpan.`
    });
  };

  const applyStandardPreset = (presetKey: StandardPresetType) => {
    const preset = STANDARD_PRESETS[presetKey];
    if (!preset) return;

    setActiveStandardPreset(presetKey);
    setThresholdConfigs(preset.thresholds);
    localStorage.setItem('aquasense_thresholds', JSON.stringify(preset.thresholds));

    addToast({
      type: 'success',
      title: `Standar Baku Mutu Diaktifkan`,
      message: `Sistem kini menerapkan parameter: ${preset.label}`
    });
  };

  const resetThresholdsToStandard = () => {
    applyStandardPreset('permenkes');
  };

  // Alert actions
  const resolveAlert = (alertId: string, notes?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'resolved',
          resolvedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          resolvedBy: currentUser?.name || 'Petugas',
          message: notes ? `${a.message} (Catatan Tindakan: ${notes})` : a.message
        };
      }
      return a;
    }));

    addToast({
      type: 'success',
      title: 'Alert Diselesaikan',
      message: `Peringatan ${alertId} telah ditandai sebagai Selesai / Teratasi.`
    });
  };

  const triggerManualAlert = (sensorType: SensorType, value: number, level: AlertLevel, message: string) => {
    const now = new Date();
    const newAlert: AlertRecord = {
      id: `ALT-MANUAL-${Date.now().toString().slice(-4)}`,
      timestamp: 'Baru saja (' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB)',
      deviceId: selectedDeviceId,
      deviceName: devices.find(d => d.id === selectedDeviceId)?.name || 'Reservoir Utama',
      sensorType: sensorType,
      sensorName: thresholdConfigs[sensorType]?.name || sensorType,
      level: level,
      status: 'active',
      currentValue: value,
      thresholdLimit: level === 'critical' ? 'Manual Test Critical' : 'Manual Test Warning',
      unit: thresholdConfigs[sensorType]?.unit || '',
      message: message || `Uji coba alarm manual untuk sensor ${thresholdConfigs[sensorType]?.name || sensorType}.`,
      whatsappStatus: 'sent',
      whatsappSentAt: 'Baru saja'
    };

    setAlerts(prev => [newAlert, ...prev]);
    dispatchWhatsAppNotification(newAlert);
    if (soundAlertEnabled && (level === 'critical' || level === 'warning')) {
      playAlertBeep(level);
    }

    addToast({
      type: level === 'critical' ? 'error' : 'warning',
      title: 'Simulasi Alert Dipicu',
      message: newAlert.message
    });
  };

  // Notifications & WhatsApp
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast({
      type: 'info',
      title: 'Semua Dibaca',
      message: 'Semua notifikasi ditandai sebagai sudah dibaca.'
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateWhatsAppConfig = (cfg: Partial<WhatsAppConfig>) => {
    setWhatsAppConfig(prev => {
      const next = { ...prev, ...cfg };
      localStorage.setItem('aquasense_wa_config', JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'success',
      title: 'Pengaturan WhatsApp Disimpan',
      message: 'Konfigurasi integrasi notifikasi WhatsApp berhasil diperbarui.'
    });
  };

  const addWhatsAppRecipient = (rec: Omit<RecipientNumber, 'id'>) => {
    const newRec: RecipientNumber = {
      ...rec,
      id: `REC-${Date.now().toString().slice(-4)}`
    };
    setWhatsAppConfig(prev => {
      const next = {
        ...prev,
        recipients: [...prev.recipients, newRec]
      };
      localStorage.setItem('aquasense_wa_config', JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'success',
      title: 'Nomor Penerima Ditambahkan',
      message: `${rec.name} (${rec.phone}) berhasil didaftarkan ke grup alert WhatsApp.`
    });
  };

  const updateWhatsAppRecipient = (id: string, updated: Partial<RecipientNumber>) => {
    setWhatsAppConfig(prev => {
      const next = {
        ...prev,
        recipients: prev.recipients.map(r => r.id === id ? { ...r, ...updated } : r)
      };
      localStorage.setItem('aquasense_wa_config', JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'success',
      title: 'Kontak Diperbarui',
      message: 'Perubahan kontak WhatsApp berhasil disimpan.'
    });
  };

  const deleteWhatsAppRecipient = (id: string) => {
    setWhatsAppConfig(prev => {
      const next = {
        ...prev,
        recipients: prev.recipients.filter(r => r.id !== id)
      };
      localStorage.setItem('aquasense_wa_config', JSON.stringify(next));
      return next;
    });
    addToast({
      type: 'info',
      title: 'Nomor Dihapus',
      message: 'Penerima berhasil dihapus dari daftar notifikasi WhatsApp.'
    });
  };

  const sendWhatsAppSimulation = async (alert: AlertRecord): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, whatsappStatus: 'sent', whatsappSentAt: 'Baru saja' } : a));

    addToast({
      type: 'success',
      title: 'WhatsApp Berhasil Terkirim',
      message: `Pesan alert dikirim ke ${whatsAppConfig.recipients.filter(r => r.isActive).length} kontak aktif.`
    });

    return { success: true, message: 'Simulasi pesan WhatsApp berhasil dikirim!' };
  };

  // Historical Records Handlers
  const addNewHistoricalRecord = (rec: Omit<HistoricalRecord, 'id' | 'timestamp'>) => {
    const now = new Date();
    const dateStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' +
                    now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    const newRecord: HistoricalRecord = {
      ...rec,
      id: `HIST-LAB-${Date.now().toString().slice(-5)}`,
      timestamp: dateStr
    };

    setHistoricalData(prev => [newRecord, ...prev]);

    addToast({
      type: 'success',
      title: 'Sampel Laboratorium Dicatat',
      message: `Data uji kualitas air (${rec.deviceName}) berhasil ditambahkan ke histori.`
    });
  };

  const clearHistoricalData = () => {
    setHistoricalData([]);
    addToast({
      type: 'info',
      title: 'Histori Dikosongkan',
      message: 'Semua rekaman data log telemetri telah dibersihkan.'
    });
  };

  const generateFreshHistoricalBatch = () => {
    const fresh = generateInitialHistory(50);
    setHistoricalData(fresh);
    addToast({
      type: 'success',
      title: 'Data Histori Baru Dimuat',
      message: '50 titik data telemetri historis acak berhasil digenerate.'
    });
  };

  // CSV Exporter
  const exportHistoryToCSV = (customData?: HistoricalRecord[]) => {
    const dataToExport = customData || historicalData;
    if (dataToExport.length === 0) {
      addToast({ type: 'warning', title: 'Data Kosong', message: 'Tidak ada data untuk diexport.' });
      return;
    }

    const headers = ['ID', 'Waktu Pembacaan', 'Device ID', 'Nama Lokasi / Perangkat', 'pH', 'Turbidity (NTU)', 'TDS (ppm)', 'Suhu (C)', 'Status Kualitas Air', 'Keterangan'];
    const rows = dataToExport.map(r => [
      r.id,
      `"${r.timestamp}"`,
      r.deviceId,
      `"${r.deviceName}"`,
      r.ph,
      r.turbidity,
      r.tds,
      r.temperature,
      r.overallStatus.toUpperCase(),
      `"${r.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AquaSense_Histori_Sensor_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Berhasil',
      message: `Berhasil mengunduh ${dataToExport.length} baris data histori ke file CSV.`
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const activeDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        changePassword,
        activeView,
        setActiveView,
        selectedSensorDetail,
        setSelectedSensorDetail,
        selectedDeviceId,
        setSelectedDeviceId,
        telemetry,
        overallWaterQuality,
        overallQualityScore,
        lastTelemetryUpdate,
        secondsSinceLastUpdate,
        pingLatency,
        packetsReceived,
        autoRefreshCountdown,
        soundAlertEnabled,
        toggleSoundAlert,
        isLiveSimulation,
        simulationPreset,
        setSimulationPreset,
        toggleSimulation,
        simulationSpeedMs,
        setSimulationSpeedMs,
        setManualSensorValue,
        injectAnomalyScenario,
        devices,
        activeDevice,
        toggleDeviceStatus,
        setDeviceSensorStatus,
        rebootDevice,
        addNewDevice,
        deleteDevice,
        thresholdConfigs,
        activeStandardPreset,
        updateThresholdConfig,
        applyStandardPreset,
        resetThresholdsToStandard,
        alerts,
        activeAlertsCount,
        resolveAlert,
        selectedAlertForDetail,
        setSelectedAlertForDetail,
        triggerManualAlert,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        whatsAppConfig,
        updateWhatsAppConfig,
        addWhatsAppRecipient,
        updateWhatsAppRecipient,
        deleteWhatsAppRecipient,
        sendWhatsAppSimulation,
        previewWhatsAppAlert,
        setPreviewWhatsAppAlert,
        historicalData,
        addNewHistoricalRecord,
        clearHistoricalData,
        generateFreshHistoricalBatch,
        exportHistoryToCSV,
        isDarkMode,
        toggleDarkMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
