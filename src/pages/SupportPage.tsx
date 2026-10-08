import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupportTicket, TicketCategory } from '../types';
import { MessageSquare, Plus, Send, CheckCircle2, Clock } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('TRADING');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply message
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/support/tickets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
          if (selectedTicket) {
            const updated = data.tickets.find((t: SupportTicket) => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
          }
        }
      } catch {
        // silent
      }
    };
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, [token, selectedTicket?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, category, message }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => [data.ticket, ...prev]);
        setSelectedTicket(data.ticket);
        setShowNewModal(false);
        setSubject('');
        setMessage('');
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedTicket || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setReplyText('');
      }
    } catch {
      // ignore
    } finally {
      setIsReplying(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center text-slate-400">Please sign in to access client support.</div>;
  }

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Support Desk</h1>
          <p className="text-xs text-slate-400 mt-1">Direct inquiries with compliance and trading desk specialists.</p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left: Tickets List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Tickets ({tickets.length})</span>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No support tickets found.</div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-800 border-slate-600 shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate max-w-[200px]">{t.subject}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{t.category}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Ticket Conversation Thread */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          {selectedTicket ? (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Ticket Top Meta */}
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedTicket.subject}</h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Category: {selectedTicket.category} · Ticket #{selectedTicket.id}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-emerald-400">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-2">
                {selectedTicket.messages.map((m) => {
                  const isAdmin = m.senderRole === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl space-y-1 text-xs max-w-[85%] ${
                        isAdmin
                          ? 'bg-slate-800 border border-slate-700 text-slate-200 ml-auto'
                          : 'bg-slate-950 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-slate-400">
                        <strong className={isAdmin ? 'text-emerald-400' : 'text-slate-200'}>
                          {m.senderName} ({isAdmin ? 'Compliance' : 'Trader'})
                        </strong>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500/60"
                  required
                />
                <button
                  type="submit"
                  disabled={isReplying}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p>Select a support ticket on the left to view the reply thread.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Create Support Inquiry</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
                >
                  <option value="TRADING">Trading & Binary Settlements</option>
                  <option value="DEPOSIT">Deposit Processing</option>
                  <option value="WITHDRAWAL">Withdrawal Request</option>
                  <option value="ACCOUNT">Account & KYC Security</option>
                  <option value="TECHNICAL">Technical & API</option>
                  <option value="OTHER">General Inquiry</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Subject</label>
                <input
                  type="text"
                  placeholder="Summary of issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Message Details</label>
                <textarea
                  rows={4}
                  placeholder="Explain your question with relevant transaction or trade IDs..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="w-1/2 py-2.5 rounded-lg bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                >
                  {isSubmitting ? 'Opening Ticket...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
