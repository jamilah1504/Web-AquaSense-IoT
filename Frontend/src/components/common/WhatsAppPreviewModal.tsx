import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, CheckCheck, Send, ExternalLink, ShieldAlert, PhoneCall } from 'lucide-react';
import { AlertRecord } from '../../types';
import { buildWhatsAppMessageTemplate } from '../../utils/constants';
import { useApp } from '../../context/AppContext';

interface WhatsAppPreviewModalProps {
  alert: AlertRecord | null;
  onClose: () => void;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({ alert, onClose }) => {
  const { whatsAppConfig, sendWhatsAppSimulation } = useApp();

  if (!alert) return null;

  const rawMessage = buildWhatsAppMessageTemplate(alert);
  const activeRecipients = whatsAppConfig.recipients.filter(r => r.isActive);

  const handleResend = async () => {
    await sendWhatsAppSimulation(alert);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Window styled like WhatsApp chat interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0c1317] dark:bg-[#0c1317] rounded-2xl shadow-2xl border border-emerald-900/40 overflow-hidden flex flex-col text-slate-100 z-10 max-h-[90vh]"
        >
          {/* WhatsApp Header bar */}
          <div className="bg-[#1f2c34] px-4 py-3.5 flex items-center justify-between border-b border-emerald-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700/80 flex items-center justify-center text-white font-bold text-lg ring-2 ring-emerald-500/50">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                  AquaSense IoT Bot 
                  <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-sm">
                    OFFICIAL
                  </span>
                </h3>
                <p className="text-xs text-emerald-400 font-mono">Status: Gateway Online</p>
              </div>
            </div>

            <button
              id="wa-modal-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Background & Message Area */}
          <div className="p-4 sm:p-5 overflow-y-auto bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-opacity-40 flex-1 space-y-4">
            {/* Status notice banner */}
            <div className="bg-[#182229] border border-[#222e35] p-3 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${alert.whatsappStatus === 'sent' ? 'bg-emerald-400 animate-pulse' : alert.whatsappStatus === 'failed' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                <span>
                  Status Pengiriman: <strong className="text-white capitalize">{alert.whatsappStatus}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{alert.whatsappSentAt || 'Waktu kejadian'}</span>
            </div>

            {/* Simulated WhatsApp bubble */}
            <div className="flex justify-end">
              <div className="max-w-[90%] bg-[#005c4b] text-slate-100 p-3.5 rounded-2xl rounded-tr-xs shadow-xs border border-emerald-700/30 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {rawMessage}

                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200 mt-2">
                  <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className={`w-3.5 h-3.5 ${alert.whatsappStatus === 'sent' ? 'text-cyan-300' : 'text-slate-400'}`} />
                </div>
              </div>
            </div>

            {/* Recipient list preview */}
            <div className="bg-[#111b21] p-3 rounded-xl border border-slate-800/80 text-xs">
              <h4 className="text-slate-400 font-semibold mb-2 flex items-center justify-between">
                <span>Daftar Nomor Penerima Aktif ({activeRecipients.length})</span>
                <span className="text-emerald-400 font-mono text-[11px]">Auto Dispatch</span>
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {activeRecipients.length > 0 ? (
                  activeRecipients.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between text-slate-300 bg-[#182229] px-2.5 py-1.5 rounded-lg text-[11px]">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-3 h-3 text-emerald-400" />
                        <span className="font-medium text-white">{rec.name}</span>
                        <span className="text-slate-400">({rec.role})</span>
                      </div>
                      <span className="font-mono text-emerald-300">{rec.phone}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-400 italic">Belum ada nomor penerima aktif yang terdaftar.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="bg-[#182229] px-4 py-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Simulasi WhatsApp Gateway v2.4
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="wa-modal-resend-btn"
                onClick={handleResend}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Simulasikan Kirim Ulang
              </button>
              <button
                id="wa-modal-dismiss-btn"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
