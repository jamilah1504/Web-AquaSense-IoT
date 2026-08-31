import { Request, Response } from 'express';
import { loginUser, getUserById } from '../services/auth.service';
import { loginSchema } from '../validators/auth.validator';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData.email, validatedData.password);
    
    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.errors ? error.errors[0].message : error.message
    });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error('User ID tidak ditemukan');

    const user = await getUserById(userId);
    
    res.status(200).json({
      success: true,
      message: 'Data user berhasil diambil',
      data: { user }
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// ENDPOINT: UPDATE PROFIL
// ==========================================
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Gunakan fallback: cari 'id' atau 'userId' dari dalam token
    const userPayload = (req as any).user;
    const userId = userPayload?.id || userPayload?.userId; 

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Akses ditolak: ID tidak valid' });
    }

    const { name, email, phone, department } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, phone, department }
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('[Auth] Error update profile:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil' });
  }
};

// ==========================================
// ENDPOINT: UPDATE PASSWORD
// ==========================================
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload?.id || userPayload?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Akses ditolak: ID tidak valid' });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Kata sandi saat ini salah' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Kata sandi berhasil diperbarui'
    });
  } catch (error) {
    console.error('[Auth] Error update password:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kata sandi' });
  }
};

export const logout = (req: Request, res: Response) => {
  // JWT bersifat stateless, jadi logout biasanya cukup menghapus token di sisi frontend (React)
  res.status(200).json({
    success: true,
    message: 'Logout berhasil'
  });
};