// scripts/test-threshold-trigger.ts

import { evaluateReadingAndNotify } from '../src/services/warning.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const DEVICE_ID = 'WATER-001'; // sesuaikan dengan deviceId yang ada di DB

  const device = await prisma.device.upsert({
    where: { deviceId: DEVICE_ID },
    update: {},
    create: { deviceId: DEVICE_ID, name: 'Device Testing', status: 'ONLINE' },
  });

  // Nilai sengaja dibuat CRITICAL (pH sangat rendah) supaya pasti trigger
  const reading = await prisma.sensorReading.create({
    data: {
      deviceId: device.deviceId,
      ph: 4.0,          // di bawah criticalMin (6.0) -> harus CRITICAL
      turbidity: 2,
      tds: 200,
      temperature: 25,
    },
  });

  console.log('Reading dibuat:', reading.id);

  await evaluateReadingAndNotify({
    id: reading.id,
    deviceId: reading.deviceId,
    ph: reading.ph,
    turbidity: reading.turbidity,
    tds: reading.tds,
    temperature: reading.temperature,
  });

  console.log('Evaluasi selesai, cek tabel Warning & NotificationLog');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());