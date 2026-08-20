import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../config/api'; // <-- IMPORT AXIOS KITA
import { socket } from '../../config/socket'; // <-- IMPORT SOCKET.IO KITA
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  ArrowUpDown,
  Eye,
  X
} from 'lucide-react';
import { HistoricalRecord, WaterQualityStatus } from '../../types';

export const HistoryView: React.FC = () => {
  // Kita keluarkan historicalData dari useApp, karena akan kita buat state lokal
  const {
    exportHistoryToCSV,
    devices
  } = useApp();

  // =================================================================
  // BAGIAN INTEGRASI BACKEND & REAL-TIME IOT (MULAI)
  // =================================================================
  
  const [historicalData, setHistoricalData] = useState<HistoricalRecord[]>([]);

  // A. Ambil Riwayat Data Saat Halaman Dibuka
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Ambil 500 data terakhir dari backend (bisa disesuaikan limitnya)
        const response = await api.get('/readings?limit=500'); 
        const rawData = response.data.data;
        
        // Format data dari database MySQL agar cocok dengan tipe 'HistoricalRecord' milik UI
        const formattedData: HistoricalRecord[] = rawData.map((item: any) => ({
          id: item.readingId || item.id,
          timestamp: new Date(item.createdAt || item.timestamp).toLocaleString('id-ID'),
          deviceName: item.device?.name || 'Sensor Tandon Utama',
          deviceId: item.deviceId,
          ph: item.ph,
          turbidity: item.turbidity,
          tds: item.tds,
          temperature: item.temperature,
          overallStatus: (item.status || 'normal').toLowerCase() as WaterQualityStatus,
          remarks: `Terekam otomatis via API IoT`
        }));
        
        setHistoricalData(formattedData);
      } catch (error) {
        console.error("Gagal mengambil data histori:", error);
      }
    };
    
    fetchHistory();
  }, []);

  // B. Tangkap Data Real-Time (Agar tabel tambah baris otomatis saat alat ngirim data)
  useEffect(() => {
    socket.connect();

    socket.on('sensor:update', (newData) => {
      const analysis = newData.analysis;
      
      const newRecord: HistoricalRecord = {
        id: newData.readingId || Date.now().toString(),
        timestamp: new Date(newData.timestamp).toLocaleString('id-ID'),
        deviceName: 'Sensor Tandon Utama',
        deviceId: newData.deviceId,
        ph: analysis.ph.value,
        turbidity: analysis.turbidity.value,
        tds: analysis.tds.value,
        temperature: analysis.temperature.value,
        overallStatus: analysis.overallStatus.toLowerCase() as WaterQualityStatus,
        remarks: 'Update realtime dari alat'
      };

      // Taruh data terbaru di urutan paling atas array
      setHistoricalData(prev => [newRecord, ...prev]);
    });

    return () => {
      socket.off('sensor:update');
    };
  }, []);

  // =================================================================
  // BAGIAN INTEGRASI BACKEND & REAL-TIME IOT (SELESAI)
  // =================================================================


  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRowDetail, setSelectedRowDetail] = useState<HistoricalRecord | null>(null);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return historicalData.filter((item) => {
      // Search term
      const matchesSearch = 
        item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.timestamp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.remarks && item.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Status filter
      if (selectedStatusFilter !== 'all' && item.overallStatus !== selectedStatusFilter) {
        return false;
      }

      // Date quick filter
      if (selectedDateFilter === 'today') {
        const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        // Karena format .toLocaleString() menghasilkan format tanggal yang bervariasi tergantung browser,
        // kita menggunakan pendekatan string matching sederhana.
        if (!item.timestamp.includes(todayStr) && !item.timestamp.includes(new Date().getDate().toString())) {
            return false;
        }
      }

      return true;
    });
  }, [historicalData, searchTerm, selectedStatusFilter, selectedDateFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusPill = (status: WaterQualityStatus) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Normal
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <Flame className="w-3 h-3" /> Critical
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center justify-between dark:bg-[#0E131F] rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
            <History className="w-6 h-6 text-cyan-500" />
            Riwayat Data & Histori Sensor
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Daftar log pencatatan telemetri kualitas air periodik. Tersedia opsi filter, pencarian, dan unduh CSV.
          </p>
        </div>

        <button
          id="history-export-csv-btn"
          onClick={() => exportHistoryToCSV(filteredRecords)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          <span>Export CSV ({filteredRecords.length} Data)</span>
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="grid items-center grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Search Box (Span 5) */}
          <div className="relative lg:col-span-5">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="history-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari lokasi, device ID, atau keterangan..."
              className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter (Span 3) */}
          <div className="lg:col-span-3">
            <select
              id="history-status-filter"
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter status kualitas air"
              className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-cyan-500 font-medium cursor-pointer"
            >
              <option value="all">Semua Status Kualitas</option>
              <option value="normal">🟢 Normal Sahaja</option>
              <option value="warning">🟡 Warning (Peringatan)</option>
              <option value="critical">🔴 Critical (Kritis)</option>
            </select>
          </div>

          {/* Date Filter (Span 2) */}
          <div className="lg:col-span-2">
            <select
              id="history-date-filter"
              value={selectedDateFilter}
              onChange={(e) => {
                setSelectedDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter rentang tanggal"
              className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-cyan-500 font-medium cursor-pointer"
            >
              <option value="all">Semua Rentang Waktu</option>
              <option value="today">Hari Ini</option>
            </select>
          </div>

          {/* Rows Per Page (Span 2) */}
          <div className="lg:col-span-2">
            <select
              id="history-per-page-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Jumlah baris per halaman"
              className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-cyan-500 font-medium cursor-pointer"
            >
              <option value={10}>10 Baris / Hal</option>
              <option value={25}>25 Baris / Hal</option>
              <option value={50}>50 Baris / Hal</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200/80 dark:border-slate-800/80 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Waktu Pembacaan</th>
                <th className="px-4 py-3.5">Perangkat / Lokasi</th>
                <th className="px-4 py-3.5 font-mono">pH</th>
                <th className="px-4 py-3.5 font-mono">Turbidity</th>
                <th className="px-4 py-3.5 font-mono">TDS</th>
                <th className="px-4 py-3.5 font-mono">Suhu</th>
                <th className="px-4 py-3.5">Status Kualitas</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {row.timestamp}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold truncate max-w-xs text-slate-900 dark:text-white">{row.deviceName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.deviceId}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`font-bold ${row.ph < 6.5 || row.ph > 8.5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {row.ph}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">pH</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`font-bold ${row.turbidity > 5.0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {row.turbidity}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">NTU</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`font-bold ${row.tds > 300 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        {row.tds}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">ppm</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">{row.temperature}</span>
                      <span className="text-[10px] text-slate-400 ml-1">°C</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusPill(row.overallStatus)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        id={`history-view-row-${row.id}`}
                        onClick={() => setSelectedRowDetail(row)}
                        className="p-1.5 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Rincian Telemetri"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">Tidak ada data histori yang cocok dengan filter.</p>
                    <p className="mt-1 text-xs">Coba ubah kata kunci pencarian atau reset filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Menampilkan <strong>{filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> -{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</strong> dari{' '}
            <strong>{filteredRecords.length}</strong> total rekaman
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              id="history-prev-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-800 dark:text-slate-200">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              id="history-next-page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row Detail Modal */}
      {selectedRowDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E131F] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Rincian Log Telemetri</h3>
                <p className="text-xs font-mono text-slate-400">{selectedRowDetail.id} &bull; {selectedRowDetail.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="p-1 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400 block font-medium">Derajat Keasaman</span>
                <strong className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">{selectedRowDetail.ph} pH</strong>
              </div>
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400 block font-medium">Kekeruhan</span>
                <strong className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{selectedRowDetail.turbidity} NTU</strong>
              </div>
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400 block font-medium">TDS (Padatan Terlarut)</span>
                <strong className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{selectedRowDetail.tds} ppm</strong>
              </div>
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400 block font-medium">Suhu Air</span>
                <strong className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{selectedRowDetail.temperature} °C</strong>
              </div>
            </div>

            <div className="p-3 text-xs space-y-1 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
              <span className="block text-slate-400">Keterangan Diagnostik:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">{selectedRowDetail.remarks}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="px-4 py-2 text-xs font-bold transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};