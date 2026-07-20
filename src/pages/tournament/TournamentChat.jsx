import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageCircle, Lock, Trash2, RefreshCw } from 'lucide-react';
import { chatApi } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// BOX CHAT GIAI DAU
// - Chi user da dang ky giai moi vao duoc (backend kiem tra)
// - Polling 4s: tu dong lay tin nhan moi
// Props: tournamentId, currentUser (co id, role), darkMode
// ─────────────────────────────────────────────────────────────
export default function TournamentChat({ tournamentId, currentUser, darkMode = true, language = 'vi' }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const dm = darkMode;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(null); // null = dang kiem tra
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const lastIdRef = useRef(0);          // id tin nhan cuoi cung da tai
  const pollTimer = useRef(null);
  const isAdminBtc = ['admin', 'btc'].includes((currentUser?.role || '').toLowerCase());

  // Cuon xuong duoi cung
  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // Kiem tra quyen vao chat
  useEffect(() => {
    if (!tournamentId) return;
    let alive = true;
    chatApi.checkAccess(tournamentId)
      .then(ok => { if (alive) { setCanAccess(ok); if (!ok) setLoading(false); } })
      .catch(() => { if (alive) { setCanAccess(false); setLoading(false); } });
    return () => { alive = false; };
  }, [tournamentId]);

  // Tai tin nhan (lan dau lay het, sau chi lay tin moi qua afterId)
  const loadMessages = useCallback(async (initial = false) => {
    if (!tournamentId) return;
    try {
      const afterId = initial ? 0 : lastIdRef.current;
      const list = await chatApi.getMessages(tournamentId, afterId);
      if (list.length > 0) {
        lastIdRef.current = list[list.length - 1].id;
        setMessages(prev => {
          if (initial) return list;
          // Them tin moi, tranh trung id
          const existIds = new Set(prev.map(m => m.id));
          const news = list.filter(m => !existIds.has(m.id));
          return news.length ? [...prev, ...news] : prev;
        });
        if (initial || list.length > 0) scrollToBottom();
      } else if (initial) {
        setMessages([]);
      }
      setError(null);
    } catch (e) {
      // Im lang khi polling loi (tranh spam), chi bao khi tai lan dau
      if (initial) setError('Khong tai duoc tin nhan.');
    } finally {
      if (initial) setLoading(false);
    }
  }, [tournamentId]);

  // Bat dau tai + polling khi co quyen
  useEffect(() => {
    if (canAccess !== true) return;
    loadMessages(true);
    // Polling moi 4 giay
    pollTimer.current = setInterval(() => loadMessages(false), 4000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [canAccess, loadMessages]);

  // Gui tin nhan
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.send(tournamentId, text);
      setInput('');
      if (msg && msg.id) {
        lastIdRef.current = Math.max(lastIdRef.current, msg.id);
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        scrollToBottom();
      }
    } catch (e) {
      setError('Khong gui duoc tin nhan.');
    } finally {
      setSending(false);
    }
  };

  // Xoa tin nhan (admin/btc)
  const handleDelete = async (id) => {
    if (!window.confirm('Xoa tin nhan nay?')) return;
    try {
      await chatApi.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch { /* im lang */ }
  };

  const fmtTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  // Nhan dien link trong tin nhan -> bien thanh the <a> bam duoc (mo app/tab moi)
  const renderContent = (text, mine) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
            className={`underline break-all font-semibold ${mine ? 'text-white' : (dm ? 'text-cyan-300' : 'text-blue-600')}`}
            onClick={(e) => e.stopPropagation()}>
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ── Dang kiem tra quyen ──
  if (canAccess === null) {
    return (
      <div className={`rounded-2xl border-2 p-8 flex items-center justify-center gap-2 ${dm ? 'border-white/10 bg-white/3 text-slate-400' : 'border-gray-200 bg-white text-slate-500'}`}>
        <Loader2 size={18} className="animate-spin" /> Đang kiểm tra...
      </div>
    );
  }

  // ── Khong co quyen ──
  if (canAccess === false) {
    return (
      <div className={`rounded-2xl border-2 p-8 flex flex-col items-center justify-center gap-3 text-center ${dm ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-white'}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dm ? 'bg-white/5' : 'bg-slate-100'}`}>
          <Lock size={24} className="text-amber-400" />
        </div>
        <div>
          <p className={`font-bold ${dm ? 'text-white' : 'text-gray-800'}`}>{tr('Chưa thể vào chat', 'Cannot join chat')}</p>
          <p className={`text-sm mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Bạn cần đăng ký tham dự giải này để vào box chat.
          </p>
        </div>
      </div>
    );
  }

  // ── Box chat ──
  return (
    <div className={`rounded-2xl border-2 flex flex-col ${dm ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-white'}`} style={{ height: '540px' }}>
      {/* Header - toi uu mobile: cho phep xuong dong, tieu de gon */}
      <div className={`flex items-center flex-wrap gap-x-2 gap-y-1.5 px-3 py-2.5 border-b ${dm ? 'border-white/8' : 'border-gray-200'}`}>
        <MessageCircle size={16} className="text-cyan-400 shrink-0" />
        <h3 className={`text-sm font-bold shrink-0 ${dm ? 'text-white' : 'text-gray-800'}`}>{tr('Chat Giải Đấu', 'Tournament Chat')}</h3>
        <span className={`hidden sm:inline text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{tr('· Tự cập nhật', '· Auto-refresh')}</span>
        {/* Admin/BTC: nut copy link chia se chat */}
        {isAdminBtc && (
          <button onClick={() => {
            const link = `${window.location.origin}${window.location.pathname}?chat=${tournamentId}`;
            navigator.clipboard.writeText(link).then(() => {
              setError(null);
              alert(tr('Đã copy link chat! Gửi link này cho người tham dự để họ vào chat.', 'Chat link copied! Share it with participants so they can join the chat.'));
            }).catch(() => {});
          }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${dm ? 'bg-violet-500/15 text-violet-300 hover:bg-violet-500/25' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'}`}
            title={tr('Copy link mời vào chat', 'Copy chat invite link')}>
            🔗 {tr('Link mời','Invite link')}
          </button>
        )}
        {/* Admin/BTC: gui link box chat thanh tin nhan trong khung chat */}
        {isAdminBtc && (
          <button onClick={async () => {
            const link = `${window.location.origin}${window.location.pathname}?chat=${tournamentId}`;
            const text = tr(`📌 Link box chat giải đấu: ${link}`, `📌 Tournament chat link: ${link}`);
            try {
              const msg = await chatApi.send(tournamentId, text);
              if (msg && msg.id) {
                lastIdRef.current = Math.max(lastIdRef.current, msg.id);
                setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
                scrollToBottom();
              }
            } catch { setError('Khong gui duoc link.'); }
          }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${dm ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
            title="Gui link box chat vao khung chat cho moi nguoi thay">
            📌 {tr('Gửi link','Send link')}
          </button>
        )}
        <button onClick={() => loadMessages(false)} className={`ml-auto p-1.5 rounded-lg transition-all shrink-0 ${dm ? 'text-slate-400 hover:bg-white/8' : 'text-slate-500 hover:bg-slate-100'}`} title={tr('Làm mới', 'Refresh')}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Danh sach tin nhan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className={`flex items-center justify-center gap-2 py-8 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            <Loader2 size={16} className="animate-spin" /> Đang tải...
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className={`flex flex-col items-center justify-center gap-2 py-12 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            <MessageCircle size={32} className="opacity-40" />
            <p className="text-sm">{tr('Chưa có tin nhắn. Hãy bắt đầu trò chuyện!', 'No messages yet. Start the conversation!')}</p>
          </div>
        )}
        {messages.map(m => {
          const isMe = m.isMine ?? (m.userId === currentUser?.id);
          return (
            <div key={m.id} className={`flex gap-2 group ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black overflow-hidden ${dm ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>
                {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : (m.userName || '?').charAt(0).toUpperCase()}
              </div>
              {/* Bong bong tin nhan */}
              <div className={`max-w-[80%] sm:max-w-[70%] min-w-0 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-xs font-bold ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{isMe ? tr('Bạn', 'You') : m.userName}</span>
                  <span className={`text-[10px] ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{fmtTime(m.createdAt)}</span>
                  {isAdminBtc && (
                    <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity" title={tr('Xóa', 'Delete')}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
                <div className={`px-3 py-2 rounded-2xl text-sm break-words ${isMe
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-sm'
                  : dm ? 'bg-white/8 text-slate-100 rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  {renderContent(m.content, isMe)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* O nhap tin nhan */}
      <div className={`flex items-center gap-2 p-3 border-t ${dm ? 'border-white/8' : 'border-gray-200'}`}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={tr('Nhập tin nhắn...', 'Type a message...')}
          maxLength={1000}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${dm ? 'bg-white/5 text-white placeholder-slate-500 border border-white/10 focus:border-cyan-500/40' : 'bg-slate-50 text-gray-800 border border-gray-200 focus:border-cyan-400'}`}
        />
        <button onClick={handleSend} disabled={sending || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 px-4 pb-2">{error}</p>}
    </div>
  );
}