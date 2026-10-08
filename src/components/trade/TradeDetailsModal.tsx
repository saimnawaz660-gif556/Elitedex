import React from 'react';
import { BinaryTrade } from '../../types';
import { ShieldCheck, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export const TradeDetailsModal: React.FC<{
  trade: BinaryTrade | null;
  onClose: () => void;
}> = ({ trade, onClose }) => {
  if (!trade) return null;

  const isUp = trade.direction === 'UP';
  const isWon = trade.status === 'WON';
  const isLost = trade.status === 'LOST';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Settlement Audit Record</h3>
              <p className="text-[11px] font-mono text-slate-400">Trade #{trade.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Status Hero Badge */}
        <div
          className={`p-4 rounded-xl border text-center space-y-1 ${
            isWon
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : isLost
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-base font-bold font-mono">
            {isWon ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : isLost ? <XCircle className="w-5 h-5 text-rose-400" /> : <Clock className="w-5 h-5 text-amber-400" />}
            <span>{trade.status}</span>
          </div>
          <p className="text-xs font-mono">
            {isWon ? `Payout Credited: +$${trade.actualPayout.toFixed(2)}` : isLost ? `Stake Lost: -$${trade.stake.toFixed(2)}` : 'Trade In Progress'}
          </p>
        </div>

        {/* Data Grid */}
        <div className="space-y-2 border border-slate-800 bg-slate-950/60 p-3.5 rounded-xl font-mono">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Market Asset:</span>
            <span className="font-bold text-white">{trade.pair}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Predicted Direction:</span>
            <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trade.direction} ({isUp ? 'Higher' : 'Lower'})
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Trade Stake:</span>
            <span className="text-white">${trade.stake.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Profit Return Rate:</span>
            <span className="text-emerald-400">+{trade.payoutRate}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Entry Price:</span>
            <span className="text-white font-bold">${trade.entryPrice}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Expiry Price:</span>
            <span className="text-white font-bold">{trade.expiryPrice ? `$${trade.expiryPrice}` : 'Pending expiry...'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Duration:</span>
            <span className="text-slate-300">{trade.duration} seconds</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">Entry Timestamp:</span>
            <span className="text-slate-400 text-[11px]">{new Date(trade.entryTimestamp).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400 font-sans">Expiry Timestamp:</span>
            <span className="text-slate-400 text-[11px]">{new Date(trade.expiryTimestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Audit Verification */}
        {trade.settlementReason && (
          <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authoritative Settlement Proof:</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
              {trade.settlementReason}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Market Source: {trade.settlementSource || 'BINANCE_PUBLIC'}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
        >
          Close Record
        </button>
      </div>
    </div>
  );
};
