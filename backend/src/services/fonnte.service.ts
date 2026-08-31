import axios from 'axios';

const FONNTE_API_URL = 'https://api.fonnte.com/send';
const FONNTE_TOKEN = (process.env.FONNTE_TOKEN as string)?.trim();

interface FonnteResponse {
  status: boolean;
  reason?: string;
  target?: string[];
  id?: string[];
  detail?: string;
}

export const normalizePhoneNumber = (raw: string): string => {
  let phone = raw.replace(/[\s\-()]/g, '');
  if (phone.startsWith('+')) phone = phone.slice(1);
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);
  return phone;
};

export const sendFonnteMessage = async (phone: string, message: string): Promise<FonnteResponse> => {
  if (!FONNTE_TOKEN) {
    throw new Error('FONNTE_TOKEN belum dikonfigurasi di environment variable');
  }

  const body = new URLSearchParams();
  body.append('target', normalizePhoneNumber(phone));
  body.append('message', message);
  body.append('countryCode', '62');
  body.append('delay', '1-3'); // opsional, samain kaya versi PHP biar ga kena rate limit

  const response = await axios.post(FONNTE_API_URL, body, {
    headers: {
      Authorization: FONNTE_TOKEN,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 15000,
  });

  const data = response.data as FonnteResponse;

  if (data.status !== true) {
    throw new Error(data.reason || data.detail || 'Fonnte gagal mengirim pesan');
  }

  return data;
};