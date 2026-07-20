import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { assistantApi } from '../services/api';

// Khung chat AI noi goc phai duoi. Hoi gi ve web thi tra loi (goi Groq qua backend).
export default function ChatWidget() {
  // Component nay khong nhan prop language -> doc ngon ngu da luu
  const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'vi';
  const tr = (vi, en) => (lang === 'en' ? en : vi);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Mình là trợ lý của PNH Football. Bạn cần hỏi gì về cách dùng web nào? 👋' },
  ]);
  const endRef = useRef(null);

  // Tu cuon xuong tin moi nhat
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      // Gui toan bo lich su (backend tu cat bot cho gon)
      const reply = await assistantApi.send(next.map((m) => ({ role: m.role, content: m.content })));
      setMessages((prev) => [...prev, { role: 'assistant', content: reply || tr('Xin lỗi, mình chưa trả lời được. Bạn thử hỏi lại nhé.','Sorry, I could not answer that. Please try asking again.') }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Có lỗi khi kết nối trợ lý. Bạn thử lại sau nhé.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Nut noi mo chat */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mở trợ lý AI"
          className="fixed bottom-5 right-5 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(56,189,248,.5)] transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #0e7490)' }}
        >
          <MessageCircle size={26} className="text-white" />
        </button>
      )}

      {/* Cua so chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[9999] w-[92vw] max-w-[380px] h-[70vh] max-h-[560px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ background: '#0b1120' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
            style={{ background: 'linear-gradient(135deg, #0e7490, #0b1120)' }}>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-cyan-300" />
              <span className="text-white font-black text-sm">Trợ lý PNH Football</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Đóng" className="text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Danh sach tin nhan */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'text-white rounded-br-sm' : 'text-slate-100 rounded-bl-sm'
                  }`}
                  style={{ background: m.role === 'user' ? 'linear-gradient(135deg, #38bdf8, #0e7490)' : '#1e293b' }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm text-[13px] text-slate-400" style={{ background: '#1e293b' }}>
                  {tr('Đang trả lời…','Replying…')}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* O nhap */}
          <div className="p-2.5 border-t border-white/10 flex items-end gap-2" style={{ background: '#0b1120' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={tr("Nhập câu hỏi về web…","Ask about the site…")}
              className="flex-1 resize-none bg-slate-800 text-slate-100 text-[13px] rounded-xl px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50 max-h-24"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Gửi"
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #38bdf8, #0e7490)' }}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}