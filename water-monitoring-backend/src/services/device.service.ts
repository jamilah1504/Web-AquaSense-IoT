import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDevices = async () => {
  return prisma.device.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const getDeviceById = async (id: string) => {
  const device = await prisma.device.findUnique({
    where: { id },
    include: { sensors: true } // Sekalian ambil data sensor yang menempel
  });
  if (!device) throw new Error('Device tidak ditemukan');
  return device;
};

export const createDevice = async (data: Prisma.DeviceCreateInput) => {
  // Cek apakah deviceId sudah dipakai
  const existingDevice = await prisma.device.findUnique({ where: { deviceId: data.deviceId } });
  if (existingDevice) throw new Error('Device ID sudah terdaftar');

  return prisma.device.create({ data });
};

export const updateDevice = async (id: string, data: Prisma.DeviceUpdateInput) => {
  await getDeviceById(id); // Pastikan device ada dulu
  return prisma.device.update({
    where: { id },
    data,
  });
};

export const deleteDevice = async (id: string) => {
  await getDeviceById(id); // Pastikan device ada
  return prisma.device.delete({ where: { id } });
};