import { PrismaClient, Prisma } from '@prisma/client';
import { analyzeQuality } from './quality.service';
import { getIO } from '../socket/socket.handler';
import { evaluateReadingAndNotify } from '../services/warning.service';

const prisma = new PrismaClient();

// FUNGSI 1: Menyimpan data dari IoT
export const saveSensorReading = async (data: {
  deviceId: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
}) => {
  const device = await prisma.device.findUnique({ where: { deviceId: data.deviceId } });
  if (!device) throw new Error(`Device dengan ID ${data.deviceId} tidak ditemukan`);

  // Simpan data pembacaan
  const reading = await prisma.sensorReading.create({
    data: {
      deviceId: data.deviceId,
      ph: data.ph,
      turbidity: data.turbidity,
      tds: data.tds,
      temperature: data.temperature,
    }
  });

  try {
    await evaluateReadingAndNotify(reading);
  } catch (err: any) {
    console.error('Gagal evaluasi warning/notifikasi:', err.message);
    // jangan throw, biar reading tetap dianggap sukses tersimpan
  }


  // Perbarui status alat menjadi online
  await prisma.device.update({
    where: { deviceId: data.deviceId },
    data: { lastSeen: new Date(), status: 'ONLINE' }
  });

  // Lakukan analisis
  const analysis = await analyzeQuality({
    ph: data.ph,
    turbidity: data.turbidity,
    tds: data.tds,
    temperature: data.temperature
  });

  // Proses warning (Cek duplikasi & Trigger Notifikasi WhatsApp)
  // const newWarnings = await processWarnings(data.deviceId, reading.id, analysis);

  // Pancarkan (Emit) data terbaru ke Frontend via Socket.IO
  try {
    getIO().emit('sensor:update', {
      deviceId: data.deviceId,
      timestamp: reading.timestamp,
      ph: data.ph,
      turbidity: data.turbidity,
      tds: data.tds,
      temperature: data.temperature,
      overallStatus: analysis.overallStatus
    });
  } catch (err) {
    // Abaikan jika socket belum siap, agar tidak mengganggu operasional IoT
  }

  return {
    readingId: reading.id,
    timestamp: reading.timestamp,
    deviceId: data.deviceId,
    analysis
    // newWarnings 
  };
};

// FUNGSI 2: Mengambil riwayat untuk API Frontend (History)
export const getReadingHistory = async (filters: {
  page: number;
  limit: number;
  deviceId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { page, limit, deviceId, startDate, endDate } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.SensorReadingWhereInput = {};
  
  if (deviceId) {
    where.deviceId = deviceId;
  }
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate); 
    if (endDate) where.timestamp.lte = new Date(endDate);     
  }

  const [total, data] = await Promise.all([
    prisma.sensorReading.count({ where }),
    prisma.sensorReading.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' }, 
    }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};