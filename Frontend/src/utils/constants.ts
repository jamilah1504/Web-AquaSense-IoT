import {
  SensorThresholdConfig,
  IoTDevice,
  UserProfile,
  WhatsAppConfig,
  HistoricalRecord,
  AlertRecord,
  NotificationItem
} from '../types';

export const DEFAULT_THRESHOLDS: Record<string, SensorThresholdConfig> = {
  ph: {
    sensorType: 'ph',
    name: 'Derajat Keasaman (pH)',
    unit: 'pH',
    iconName: 'Droplets',
    minNormal: 6.5,
    maxNormal: 8.5,
    minWarning: 6.0,
    maxWarning: 9.0,
    minCritical: 4.0,
    maxCritical: 11.0,
    description: 'Tingkat asam-basa air. pH netral dan aman untuk konsumsi berada pada rentang 6.5 - 8.5.',
    standardReference: 'Permenkes No. 2 Tahun 2023 / Standar Baku Mutu Air Minum'
  },
  turbidity: {
    sensorType: 'turbidity',
    name: 'Kekeruhan (Turbidity)',
    unit: 'NTU',
    iconName: 'EyeOff',
    minNormal: 0.0,
    maxNormal: 5.0,
    minWarning: 5.1,
    maxWarning: 10.0,
    minCritical: 10.1,
    maxCritical: 50.0,
    description: 'Tingkat kekeruhan akibat partikel tersuspensi. Air jernih ideal di bawah 5 NTU.',
    standardReference: 'Standar WHO & Permenkes RI (< 5 NTU)'
  },
  tds: {
    sensorType: 'tds',
    name: 'Total Dissolved Solids (TDS)',
    unit: 'ppm',
    iconName: 'Layers',
    minNormal: 50,
    maxNormal: 300,
    minWarning: 301,
    maxWarning: 500,
    minCritical: 501,
    maxCritical: 1500,
    description: 'Konsentrasi padatan terlarut total. Nilai < 300 ppm sangat baik untuk air minum higienis.',
    standardReference: 'Permenkes Standar Baku Mutu (< 300 ppm Baik, < 500 ppm Maksimum)'
  },
  temperature: {
    sensorType: 'temperature',
    name: 'Suhu Air',
    unit: '°C',
    iconName: 'Thermometer',
    minNormal: 22.0,
    maxNormal: 28.0,
    minWarning: 20.0,
    maxWarning: 32.0,
    minCritical: 15.0,
    maxCritical: 40.0,
    description: 'Suhu mempengaruhi laju reaksi kimia dan pertumbuhan mikroba. Suhu ideal suhu ruang 22 - 28°C.',
    standardReference: 'Baku Mutu Lingkungan Suhu Udara ± 3°C'
  }
};

export const STANDARD_PRESETS: Record<string, { label: string; description: string; thresholds: Record<string, SensorThresholdConfig> }> = {
  permenkes: {
    label: 'Permenkes RI No. 2/2023 (Air Minum)',
    description: 'Standar baku mutu air minum nasional Indonesia yang higienis dan aman dikonsumsi manusia.',
    thresholds: DEFAULT_THRESHOLDS
  },
  who: {
    label: 'WHO Guidelines for Drinking-Water',
    description: 'Panduan internasional Organisasi Kesehatan Dunia dengan parameter ketat untuk air perpipaan.',
    thresholds: {
      ph: {
        sensorType: 'ph',
        name: 'Derajat Keasaman (pH)',
        unit: 'pH',
        iconName: 'Droplets',
        minNormal: 6.5,
        maxNormal: 8.0,
        minWarning: 6.2,
        maxWarning: 8.5,
        minCritical: 5.0,
        maxCritical: 10.0,
        description: 'WHO merekomendasikan pH optimal 6.5 - 8.0 untuk mencegah korosi pipa dan efektivitas desinfeksi.',
        standardReference: 'WHO Drinking Water Guidelines 4th Ed'
      },
      turbidity: {
        sensorType: 'turbidity',
        name: 'Kekeruhan (Turbidity)',
        unit: 'NTU',
        iconName: 'EyeOff',
        minNormal: 0.0,
        maxNormal: 1.0,
        minWarning: 1.1,
        maxWarning: 4.0,
        minCritical: 4.1,
        maxCritical: 25.0,
        description: 'Target WHO untuk air terfiltrasi adalah < 1 NTU untuk jaminan efikasi klorinasi.',
        standardReference: 'WHO Water Safety Plan (< 1 NTU ideal)'
      },
      tds: {
        sensorType: 'tds',
        name: 'Total Dissolved Solids (TDS)',
        unit: 'ppm',
        iconName: 'Layers',
        minNormal: 30,
        maxNormal: 250,
        minWarning: 251,
        maxWarning: 450,
        minCritical: 451,
        maxCritical: 1000,
        description: 'WHO menggolongkan TDS < 300 ppm sebagai excellent dan > 600 ppm sebagai poor.',
        standardReference: 'WHO Palatability Category: < 300 ppm Excellent'
      },
      temperature: {
        sensorType: 'temperature',
        name: 'Suhu Air',
        unit: '°C',
        iconName: 'Thermometer',
        minNormal: 20.0,
        maxNormal: 26.0,
        minWarning: 18.0,
        maxWarning: 30.0,
        minCritical: 14.0,
        maxCritical: 38.0,
        description: 'Suhu sejuk mencegah proliferasi biofilm bakteri seperti Legionella.',
        standardReference: 'WHO Microbial Safety: < 25°C Optimal'
      }
    }
  },
  akuakultur: {
    label: 'Akuakultur & Kolam Ikan Air Tawar',
    description: 'Parameter ramah ekosistem biota air tawar (ikan nila, lele, mas, udang vaname).',
    thresholds: {
      ph: {
        sensorType: 'ph',
        name: 'Derajat Keasaman (pH)',
        unit: 'pH',
        iconName: 'Droplets',
        minNormal: 7.0,
        maxNormal: 8.2,
        minWarning: 6.5,
        maxWarning: 8.8,
        minCritical: 5.5,
        maxCritical: 9.5,
        description: 'Biota air tawar tumbuh optimal pada pH sedikit basa 7.0 - 8.2.',
        standardReference: 'Standar KKP Budidaya Perikanan'
      },
      turbidity: {
        sensorType: 'turbidity',
        name: 'Kekeruhan (Turbidity)',
        unit: 'NTU',
        iconName: 'EyeOff',
        minNormal: 0.0,
        maxNormal: 15.0,
        minWarning: 15.1,
        maxWarning: 30.0,
        minCritical: 30.1,
        maxCritical: 100.0,
        description: 'Kekeruhan planktonik wajar hingga 15 NTU untuk kolam terbuka.',
        standardReference: 'SNI Budidaya Ikan Air Tawar'
      },
      tds: {
        sensorType: 'tds',
        name: 'Total Dissolved Solids (TDS)',
        unit: 'ppm',
        iconName: 'Layers',
        minNormal: 100,
        maxNormal: 400,
        minWarning: 401,
        maxWarning: 700,
        minCritical: 701,
        maxCritical: 2000,
        description: 'Salinitas dan mineral terlarut untuk osmoregulasi ikan air tawar.',
        standardReference: 'Baku Mutu Kelas II Lingkungan Hidup'
      },
      temperature: {
        sensorType: 'temperature',
        name: 'Suhu Air',
        unit: '°C',
        iconName: 'Thermometer',
        minNormal: 26.0,
        maxNormal: 30.0,
        minWarning: 23.0,
        maxWarning: 33.0,
        minCritical: 18.0,
        maxCritical: 37.0,
        description: 'Suhu hangat 26 - 30°C merangsang metabolisme dan nafsu makan ikan.',
        standardReference: 'Pedoman Teknis BBPBAT'
      }
    }
  },
  hidroponik: {
    label: 'Hidroponik & Nutrisi Pertanian Modern',
    description: 'Formula presisi larutan nutrisi AB Mix untuk sayuran daun dan buah.',
    thresholds: {
      ph: {
        sensorType: 'ph',
        name: 'Derajat Keasaman (pH)',
        unit: 'pH',
        iconName: 'Droplets',
        minNormal: 5.5,
        maxNormal: 6.5,
        minWarning: 5.0,
        maxWarning: 7.0,
        minCritical: 4.0,
        maxCritical: 8.5,
        description: 'Tanaman hidroponik menyerap unsur hara makro/mikro optimal pada pH asam lemah 5.5 - 6.5.',
        standardReference: 'Pedoman Agronomi Hidroponik'
      },
      turbidity: {
        sensorType: 'turbidity',
        name: 'Kekeruhan (Turbidity)',
        unit: 'NTU',
        iconName: 'EyeOff',
        minNormal: 0.0,
        maxNormal: 3.0,
        minWarning: 3.1,
        maxWarning: 8.0,
        minCritical: 8.1,
        maxCritical: 30.0,
        description: 'Larutan harus bebas endapan pekat agar nozel fertigasi tidak tersumbat.',
        standardReference: 'Standar Fertigasi Bersih'
      },
      tds: {
        sensorType: 'tds',
        name: 'Total Dissolved Solids (TDS)',
        unit: 'ppm',
        iconName: 'Layers',
        minNormal: 560,
        maxNormal: 1200,
        minWarning: 400,
        maxWarning: 1500,
        minCritical: 200,
        maxCritical: 2500,
        description: 'Konsentrasi ion nutrisi (EC 1.2 - 2.4 mS/cm setara TDS 600 - 1200 ppm).',
        standardReference: 'Kebutuhan EC/TDS Sayuran Hijau (Selada, Pakcoy)'
      },
      temperature: {
        sensorType: 'temperature',
        name: 'Suhu Air',
        unit: '°C',
        iconName: 'Thermometer',
        minNormal: 20.0,
        maxNormal: 25.0,
        minWarning: 18.0,
        maxWarning: 28.0,
        minCritical: 15.0,
        maxCritical: 34.0,
        description: 'Suhu larutan nutrisi dingin menjaga kadar oksigen terlarut (DO) akar.',
        standardReference: 'Standar Root-Zone Hydroponic Temperature'
      }
    }
  },
  boiler: {
    label: 'Air Umpan Boiler Industri',
    description: 'Air demineralisasi murni untuk mencegah kerak pipa dan korosi turbin pabrik.',
    thresholds: {
      ph: {
        sensorType: 'ph',
        name: 'Derajat Keasaman (pH)',
        unit: 'pH',
        iconName: 'Droplets',
        minNormal: 8.5,
        maxNormal: 9.5,
        minWarning: 8.0,
        maxWarning: 10.0,
        minCritical: 7.0,
        maxCritical: 11.5,
        description: 'pH basa melindungi permukaan baja boiler dari korosi asam.',
        standardReference: 'ASME Boiler Water Guidelines'
      },
      turbidity: {
        sensorType: 'turbidity',
        name: 'Kekeruhan (Turbidity)',
        unit: 'NTU',
        iconName: 'EyeOff',
        minNormal: 0.0,
        maxNormal: 1.0,
        minWarning: 1.1,
        maxWarning: 3.0,
        minCritical: 3.1,
        maxCritical: 15.0,
        description: 'Kekeruhan nol untuk mencegah pembentukan lumpur termal.',
        standardReference: 'Standard Feedwater Specification'
      },
      tds: {
        sensorType: 'tds',
        name: 'Total Dissolved Solids (TDS)',
        unit: 'ppm',
        iconName: 'Layers',
        minNormal: 0,
        maxNormal: 50,
        minWarning: 51,
        maxWarning: 100,
        minCritical: 101,
        maxCritical: 500,
        description: 'TDS serendah mungkin untuk mencegah foaming dan carryover ke steam.',
        standardReference: 'High Pressure Boiler Demin Water'
      },
      temperature: {
        sensorType: 'temperature',
        name: 'Suhu Air',
        unit: '°C',
        iconName: 'Thermometer',
        minNormal: 60.0,
        maxNormal: 85.0,
        minWarning: 45.0,
        maxWarning: 95.0,
        minCritical: 25.0,
        maxCritical: 110.0,
        description: 'Air deaerator dipanaskan untuk mengusir oksigen terlarut.',
        standardReference: 'Thermal Deaeration Range'
      }
    }
  }
};

export const INITIAL_DEVICES: IoTDevice[] = [
  {
    id: 'DEV-AQ-001',
    name: 'Reservoir Utama Gedung A (Main Intake)',
    location: 'Bak Penampungan Utama - Blok Utara',
    ipAddress: '192.168.10.45',
    macAddress: '3C:71:BF:88:9A:12',
    firmwareVersion: 'v2.4.1-stable',
    status: 'online',
    batteryLevel: 98,
    signalStrength: 92,
    lastSeen: 'Baru saja (1 detik lalu)',
    installedDate: '12 Januari 2024',
    activeSensors: ['ph', 'turbidity', 'tds', 'temperature'],
    sensorsStatus: {
      ph: 'normal',
      turbidity: 'normal',
      tds: 'normal',
      temperature: 'normal'
    }
  },
  {
    id: 'DEV-AQ-002',
    name: 'Instalasi Pengolahan Air (IPA Filter 2)',
    location: 'Stasiun Filtrasi & Klorinasi',
    ipAddress: '192.168.10.46',
    macAddress: '3C:71:BF:88:9A:34',
    firmwareVersion: 'v2.4.0-stable',
    status: 'online',
    batteryLevel: 87,
    signalStrength: 85,
    lastSeen: '1 menit lalu',
    installedDate: '15 Februari 2024',
    activeSensors: ['ph', 'turbidity', 'tds', 'temperature'],
    sensorsStatus: {
      ph: 'normal',
      turbidity: 'warning',
      tds: 'normal',
      temperature: 'normal'
    }
  },
  {
    id: 'DEV-AQ-003',
    name: 'Pipa Distribusi Zona Selatan',
    location: 'Jaringan Pipa Distribusi Utama Km 4',
    ipAddress: '192.168.10.49',
    macAddress: '3C:71:BF:88:9A:78',
    firmwareVersion: 'v2.3.9-legacy',
    status: 'online',
    batteryLevel: 72,
    signalStrength: 68,
    lastSeen: '3 menit lalu',
    installedDate: '20 Maret 2024',
    activeSensors: ['ph', 'turbidity', 'tds', 'temperature'],
    sensorsStatus: {
      ph: 'normal',
      turbidity: 'normal',
      tds: 'normal',
      temperature: 'normal'
    }
  },
  {
    id: 'DEV-AQ-004',
    name: 'Bak Sedimentasi Cadangan (Standby)',
    location: 'Kolam Pengendapan Sisi Barat',
    ipAddress: '192.168.10.52',
    macAddress: '3C:71:BF:88:9A:90',
    firmwareVersion: 'v2.4.1-stable',
    status: 'offline',
    batteryLevel: 14,
    signalStrength: 0,
    lastSeen: '2 hari lalu',
    installedDate: '05 Mei 2024',
    activeSensors: ['ph', 'turbidity', 'tds', 'temperature'],
    sensorsStatus: {
      ph: 'offline',
      turbidity: 'offline',
      tds: 'offline',
      temperature: 'offline'
    }
  }
];

export const MOCK_USERS: Record<string, UserProfile> = {
  admin: {
    id: 'USR-ADM-001',
    name: 'Ir. Hendra Pratama, M.T.',
    email: 'admin@aquasense.id',
    username: 'admin',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+62 812-3456-7890',
    department: 'Divisi Pengawasan Mutu & Pengendalian Sistem',
    lastLogin: 'Hari ini, 08:30 WIB'
  },
  petugas: {
    id: 'USR-PTG-002',
    name: 'Budi Santoso, S.Si',
    email: 'petugas@aquasense.id',
    username: 'petugas',
    role: 'petugas',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+62 813-9876-5432',
    department: 'Teknisi Lapangan & Pemeliharaan Sensor',
    lastLogin: 'Hari ini, 07:45 WIB'
  }
};

export const INITIAL_WHATSAPP_CONFIG: WhatsAppConfig = {
  isEnabled: true,
  triggerOnWarning: true,
  triggerOnCritical: true,
  triggerOnSensorOffline: true,
  triggerOnDeviceOffline: true,
  cooldownMinutes: 15,
  recipients: [
    {
      id: 'REC-01',
      name: 'Pusat Kendali Operasional (Command Center)',
      phone: '+62 812-9900-1122',
      role: 'Admin Utama',
      isActive: true
    },
    {
      id: 'REC-02',
      name: 'Tim Reaksi Cepat Lapangan (TRC)',
      phone: '+62 813-4455-6677',
      role: 'Koordinator Teknisi',
      isActive: true
    },
    {
      id: 'REC-03',
      name: 'Kepala Bagian Pengawasan Kualitas',
      phone: '+62 811-2233-4455',
      role: 'Supervisor',
      isActive: false
    }
  ]
};

// Generate realistic initial historical dataset
export function generateInitialHistory(count = 35): HistoricalRecord[] {
  const records: HistoricalRecord[] = [];
  const now = Date.now();
  const stepMs = 15 * 60 * 1000; // every 15 minutes

  for (let i = 0; i < count; i++) {
    const time = new Date(now - i * stepMs);
    const dateStr = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ', ' + 
                    time.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    // Slight variance with realistic patterns
    let ph = 7.15 + (Math.sin(i * 0.3) * 0.4) + (Math.random() * 0.2 - 0.1);
    let turbidity = 2.4 + (Math.cos(i * 0.25) * 1.2) + (Math.random() * 0.4 - 0.2);
    let tds = 185 + (Math.sin(i * 0.4) * 45) + (Math.random() * 15 - 7.5);
    let temp = 25.2 + (Math.sin(i * 0.15) * 1.5) + (Math.random() * 0.4 - 0.2);

    let status: 'normal' | 'warning' | 'critical' = 'normal';

    // Inject some warning/critical in past for realistic history
    if (i === 6) {
      turbidity = 7.8;
      status = 'warning';
    } else if (i === 14) {
      ph = 9.2;
      tds = 530;
      status = 'critical';
    } else if (i === 22) {
      temp = 32.8;
      status = 'warning';
    }

    records.push({
      id: `HIST-${1000 + i}`,
      timestamp: dateStr,
      deviceId: 'DEV-AQ-001',
      deviceName: 'Reservoir Utama Gedung A',
      ph: parseFloat(ph.toFixed(2)),
      turbidity: parseFloat(turbidity.toFixed(2)),
      tds: Math.round(tds),
      temperature: parseFloat(temp.toFixed(1)),
      overallStatus: status,
      remarks: status === 'critical' ? 'Lonjakan TDS terdeteksi' : status === 'warning' ? 'Fluktuasi kekeruhan pasca hujan' : 'Kondisi stabil & memenuhi baku mutu'
    });
  }

  return records;
}

export const INITIAL_ALERTS: AlertRecord[] = [
  {
    id: 'ALT-2026-089',
    timestamp: '15 Menit lalu (22:33 WIB)',
    deviceId: 'DEV-AQ-002',
    deviceName: 'Instalasi Pengolahan Air (IPA Filter 2)',
    sensorType: 'turbidity',
    sensorName: 'Kekeruhan (Turbidity)',
    level: 'warning',
    status: 'active',
    currentValue: 7.85,
    thresholdLimit: '> 5.0 NTU',
    unit: 'NTU',
    message: 'Kekeruhan melampaui batas normal (7.85 NTU > 5.00 NTU). Rekomendasi: Periksa media filtrasi pasir aktif.',
    whatsappStatus: 'sent',
    whatsappSentAt: '22:34 WIB'
  },
  {
    id: 'ALT-2026-088',
    timestamp: '2 Jam lalu (20:45 WIB)',
    deviceId: 'DEV-AQ-001',
    deviceName: 'Reservoir Utama Gedung A',
    sensorType: 'ph',
    sensorName: 'Derajat Keasaman (pH)',
    level: 'critical',
    status: 'resolved',
    currentValue: 9.35,
    thresholdLimit: '> 9.0 pH',
    unit: 'pH',
    message: 'pH air mencapai kondisi basa kritis 9.35 pH. Dosis asam netralisator telah diinjeksi oleh sistem otomatis.',
    resolvedAt: '21:10 WIB',
    resolvedBy: 'Budi Santoso (Petugas)',
    whatsappStatus: 'sent',
    whatsappSentAt: '20:46 WIB'
  },
  {
    id: 'ALT-2026-087',
    timestamp: 'Kemarin, 14:15 WIB',
    deviceId: 'DEV-AQ-004',
    deviceName: 'Bak Sedimentasi Cadangan',
    sensorType: 'temperature',
    sensorName: 'Semua Sensor (Device)',
    level: 'critical',
    status: 'active',
    currentValue: 0,
    thresholdLimit: 'Heartbeat Timeout',
    unit: '-',
    message: 'Perangkat tidak mengirim data selama lebih dari 2 jam. Indikasi baterai habis atau koneksi LoRa/WiFi putus.',
    whatsappStatus: 'sent',
    whatsappSentAt: 'Kemarin, 14:16 WIB'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    timestamp: '15 Menit lalu',
    title: 'Peringatan Sensor Kekeruhan',
    message: 'Kekeruhan pada IPA Filter 2 terdeteksi 7.85 NTU (Batas normal < 5.0 NTU).',
    level: 'warning',
    isRead: false,
    type: 'alert',
    whatsappStatus: 'sent',
    recipientPhone: '+62 812-9900-1122'
  },
  {
    id: 'NOTIF-02',
    timestamp: '1 Jam lalu',
    title: 'Pengiriman WhatsApp Berhasil',
    message: 'Notifikasi telemetry ringkasan per jam telah dikirim ke 2 nomor penerima aktif.',
    level: 'normal',
    isRead: false,
    type: 'system',
    whatsappStatus: 'sent',
    recipientPhone: '+62 813-4455-6677'
  },
  {
    id: 'NOTIF-03',
    timestamp: '2 Jam lalu',
    title: 'Alert pH Terselesaikan',
    message: 'Status anomali pH pada Reservoir Utama telah ditangani dan kembali normal (7.25 pH).',
    level: 'normal',
    isRead: true,
    type: 'alert',
    whatsappStatus: 'sent'
  },
  {
    id: 'NOTIF-04',
    timestamp: 'Kemarin',
    title: 'Perangkat Offline Terdeteksi',
    message: 'Device DEV-AQ-004 (Bak Sedimentasi Cadangan) terputus dari jaringan.',
    level: 'critical',
    isRead: true,
    type: 'device',
    whatsappStatus: 'failed',
    recipientPhone: '+62 812-9900-1122'
  }
];

export function buildWhatsAppMessageTemplate(alert: AlertRecord): string {
  const emoji = alert.level === 'critical' ? '🔴 *[CRITICAL ALERT KUALITAS AIR]*' : '🟡 *[WARNING KUALITAS AIR]*';
  return `${emoji}
━━━━━━━━━━━━━━━━━━━
🏢 *Sistem:* AquaSense IoT Monitoring
📍 *Lokasi:* ${alert.deviceName} (${alert.deviceId})
⚠️ *Parameter:* ${alert.sensorName}
📊 *Nilai Terbaca:* *${alert.currentValue} ${alert.unit}*
🎯 *Batas Normal:* ${alert.thresholdLimit}
⏱️ *Waktu Kejadian:* ${alert.timestamp}
━━━━━━━━━━━━━━━━━━━
📝 *Keterangan:*
${alert.message}

Silakan periksa dashboard web segera:
👉 https://aquasense.iot.monitoring/alerts/${alert.id}
━━━━━━━━━━━━━━━━━━━
_Pesan otomatis sistem AquaSense IoT_`;
}
