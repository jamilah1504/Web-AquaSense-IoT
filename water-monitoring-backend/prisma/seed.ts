import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Menghapus data lama...');
  await prisma.notificationLog.deleteMany();
  await prisma.warning.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.deviceLog.deleteMany();
  await prisma.device.deleteMany();
  await prisma.threshold.deleteMany();
  await prisma.user.deleteMany();

  console.log('Memulai proses seeding...');

  // 1. Buat Users (1 Admin, 2 Operator)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Utama',
      email: 'admin@aquasense.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const operator1 = await prisma.user.create({
    data: {
      name: 'Operator Satu',
      email: 'operator1@aquasense.com',
      password: passwordHash,
      role: 'OPERATOR',
    },
  });

  const operator2 = await prisma.user.create({
    data: {
      name: 'Operator Dua',
      email: 'operator2@aquasense.com',
      password: passwordHash,
      role: 'OPERATOR',
    },
  });

  console.log('✅ Users berhasil dibuat');

  // 2. Buat Device
  const device = await prisma.device.create({
    data: {
      deviceId: 'WATER-001',
      name: 'Sensor Tandon Utama',
      status: 'ONLINE',
      lastSeen: new Date(),
      firmwareVersion: 'v1.0.0',
    },
  });

  console.log('✅ Device berhasil dibuat');

  // 3. Buat Sensors untuk Device tersebut
  const sensors = await prisma.sensor.createMany({
    data: [
      { deviceId: device.deviceId, type: 'PH', name: 'pH Meter', unit: 'pH', status: 'ONLINE' },
      { deviceId: device.deviceId, type: 'TURBIDITY', name: 'Turbidity Sensor', unit: 'NTU', status: 'ONLINE' },
      { deviceId: device.deviceId, type: 'TDS', name: 'TDS Meter', unit: 'ppm', status: 'ONLINE' },
      { deviceId: device.deviceId, type: 'TEMPERATURE', name: 'Temperature Sensor', unit: '°C', status: 'ONLINE' },
    ],
  });

  console.log('✅ Sensors berhasil dibuat');

  // 4. Buat Thresholds (Nilai sementara)
  await prisma.threshold.createMany({
    data: [
      { parameter: 'PH', warningMin: 6.5, warningMax: 8.5, criticalMin: 6.0, criticalMax: 9.0 },
      { parameter: 'TURBIDITY', warningMin: null, warningMax: 5.0, criticalMin: null, criticalMax: 10.0 },
      { parameter: 'TDS', warningMin: null, warningMax: 300.0, criticalMin: null, criticalMax: 500.0 },
      { parameter: 'TEMPERATURE', warningMin: 20.0, warningMax: 30.0, criticalMin: 15.0, criticalMax: 35.0 },
    ],
  });

  console.log('✅ Thresholds berhasil dibuat');

  // 5. Buat Dummy Sensor Readings
  const reading = await prisma.sensorReading.create({
    data: {
      deviceId: device.deviceId,
      ph: 7.2,
      turbidity: 2.1,
      tds: 250,
      temperature: 26.5,
    },
  });

  console.log('✅ Dummy Readings berhasil dibuat');

  // 6. Buat Dummy Warning & Notification Log
  const warning = await prisma.warning.create({
    data: {
      deviceId: device.deviceId,
      readingId: reading.id,
      parameter: 'TURBIDITY',
      value: 8.7,
      threshold: 5.0,
      severity: 'CRITICAL',
      message: 'Kekeruhan air melebihi batas kritis',
      status: 'ACTIVE',
    },
  });

  await prisma.notificationLog.create({
    data: {
      warningId: warning.id,
      channel: 'WHATSAPP',
      recipient: '081234567890',
      message: '⚠️ WARNING KUALITAS AIR\nDevice: WATER-001\nParameter: Turbidity...',
      status: 'SENT',
      sentAt: new Date(),
    },
  });

  console.log('✅ Dummy Warning & Logs berhasil dibuat');
  console.log('🎉 Proses Seeding Selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });