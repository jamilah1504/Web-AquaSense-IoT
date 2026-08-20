export type UserRole = 'admin' | 'petugas';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string;
  phone: string;
  department: string;
  lastLogin: string;
}

export type SensorType = 'ph' | 'turbidity' | 'tds' | 'temperature';

export type SensorStatus = 'normal' | 'warning' | 'critical' | 'offline';

export type WaterQualityStatus = 'normal' | 'warning' | 'critical';

export type DeviceStatus = 'online' | 'offline';

export type AlertLevel = 'normal' | 'warning' | 'critical';

export type AlertStatus = 'active' | 'resolved';

export type WhatsAppDeliveryStatus = 'pending' | 'sent' | 'failed';

export interface SensorReading {
  value: number;
  status: SensorStatus;
  lastUpdated: string;
}

export interface SensorTelemetry {
  ph: SensorReading;
  turbidity: SensorReading;
  tds: SensorReading;
  temperature: SensorReading;
}

export interface SensorThresholdConfig {
  sensorType: SensorType;
  name: string;
  unit: string;
  iconName: string;
  // Threshold ranges
  minNormal: number;
  maxNormal: number;
  minWarning: number;
  maxWarning: number;
  minCritical: number;
  maxCritical: number;
  description: string;
  standardReference: string; // e.g., "Permenkes No. 2 Tahun 2023 / WHO Standard"
}

export interface HistoricalRecord {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  overallStatus: WaterQualityStatus;
  remarks?: string;
}

export interface AlertRecord {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  sensorType: SensorType;
  sensorName: string;
  level: AlertLevel;
  status: AlertStatus;
  currentValue: number;
  thresholdLimit: string;
  unit: string;
  message: string;
  resolvedAt?: string;
  resolvedBy?: string;
  whatsappStatus: WhatsAppDeliveryStatus;
  whatsappSentAt?: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  level: AlertLevel;
  isRead: boolean;
  type: 'alert' | 'system' | 'device' | 'threshold';
  whatsappStatus?: WhatsAppDeliveryStatus;
  recipientPhone?: string;
  dataRef?: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  status: DeviceStatus;
  batteryLevel: number;
  signalStrength: number; // in percentage / dBm
  lastSeen: string;
  installedDate: string;
  activeSensors: SensorType[];
  sensorsStatus: Record<SensorType, SensorStatus>;
}

export interface RecipientNumber {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export interface WhatsAppConfig {
  isEnabled: boolean;
  triggerOnWarning: boolean;
  triggerOnCritical: boolean;
  triggerOnSensorOffline: boolean;
  triggerOnDeviceOffline: boolean;
  cooldownMinutes: number; // 5, 15, 30, 60
  recipients: RecipientNumber[];
}

export type ViewType = 
  | 'dashboard'
  | 'monitoring'
  | 'detail_sensor'
  | 'history'
  | 'alerts'
  | 'devices'
  | 'thresholds'
  | 'notification_settings'
  | 'profile';

export type TimeRange = '24h' | '7d' | '30d';

export type SimulationPreset = 
  | 'normal' 
  | 'warning' 
  | 'critical' 
  | 'sensor_offline' 
  | 'device_offline';

export type StandardPresetType = 
  | 'permenkes' 
  | 'who' 
  | 'akuakultur' 
  | 'hidroponik' 
  | 'boiler';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
