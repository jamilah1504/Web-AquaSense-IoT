/// <reference types="vite/client" />

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Kita buat false agar socket hanya menyala saat user sudah login/masuk dashboard
  withCredentials: true,
});