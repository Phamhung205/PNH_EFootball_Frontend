import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, RefreshCw, X } from 'lucide-react';
import { notificationApi } from '../services/api';

export default function AdminNotifications({ darkMode, language }) {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const panelRef = useRef(null);
  const tr = (vi, en) => language === 'en' ? en : vi;

  useEffect(() => {
    let alive = true;
    let pending = false;
    let forbidden = false;
    const load = async () => {
      if (pending || forbidden || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const data = await notificationApi.list();
        if (alive) { setFeed(data); setError(''); }
      } catch (e) {
        if (e.status === 403) { forbidden = true; if (alive) setFeed(null); }
        if (alive) setError(e.status === 403 ? 'forbidden' : 'load');
      } finally { pending = false; }
    };
    load();
    const timer = window.setInterval(load, 30000);
    document.addEventListener('visibilitychange', load);
    return () => { alive = false; window.clearInterval(timer); document.removeEventListener('visibilitychange', load); };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const dismiss = event => {
      if (event.type === 'keydown' && event.key === 'Escape') setOpen(false);
      if (event.type === 'pointerdown' && !panelRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismiss);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', dismiss); };
  }, [open]);

  const markRead = async () => {
    const throughId = Math.max(0, ...(feed?.items || []).map(item => item.id));
    if (!throughId || marking) return;
    setMarking(true);
    try {
      await notificationApi.markRead(throughId);
      setRefresh(value => value + 1);
    } catch { setError('read'); }
    finally { setMarking(false); }
  };

  const panel = darkMode ? 'border-slate-700 bg-[#0a1424] text-slate-100' : 'border-slate-200 bg-white text-slate-900';
  return <div ref={panelRef} className="relative">
    <button type="button" onClick={() => { setOpen(value => !value); setRefresh(value => value + 1); }} aria-expanded={open} aria-controls="admin-notifications" aria-label={`${tr('Thông báo quản trị', 'Admin notifications')}: ${feed?.unreadCount ?? 0} ${tr('chưa đọc', 'unread')}`} className={`relative rounded-xl border p-2 ${panel}`}>
      <Bell size={20} />
      {feed?.unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold text-white">{feed.unreadCount > 99 ? '99+' : feed.unreadCount}</span>}
    </button>
    {open && <section id="admin-notifications" aria-label={tr('Thông báo quản trị', 'Admin notifications')} className={`fixed right-3 top-[70px] z-[100] w-[calc(100vw-24px)] max-w-sm overflow-hidden rounded-2xl border shadow-2xl sm:absolute sm:right-0 sm:top-full sm:mt-3 ${panel}`}>
      <header className="flex items-center justify-between gap-2 border-b border-slate-500/20 p-4"><h2 className="font-bold">{tr('Thông báo quản trị', 'Admin notifications')}</h2><button type="button" onClick={() => setOpen(false)} aria-label={tr('Đóng thông báo', 'Close notifications')}><X size={18} /></button></header>
      <div className="flex items-center justify-between gap-2 border-b border-slate-500/20 px-4 py-3 text-xs">
        <button type="button" disabled={marking || !feed?.unreadCount} onClick={markRead} className="flex items-center gap-1 disabled:opacity-40"><CheckCheck size={15} />{tr('Đánh dấu đã đọc', 'Mark as read')}</button>
        <button type="button" onClick={() => setRefresh(value => value + 1)} className="flex items-center gap-1"><RefreshCw size={14} />{tr('Làm mới', 'Refresh')}</button>
      </div>
      {error && <p role="alert" className="px-4 py-3 text-xs text-red-500">{error === 'forbidden' ? tr('Tài khoản không có quyền xem thông báo.', 'You do not have access to notifications.') : error === 'read' ? tr('Chưa đánh dấu được thông báo. Vui lòng thử lại.', 'Unable to mark notifications. Please retry.') : tr('Không thể tải thông báo. Vui lòng thử lại.', 'Unable to load notifications. Please retry.')}</p>}
      <div className="max-h-[60vh] overflow-y-auto">
        {!feed && !error && <p role="status" className="p-6 text-center text-sm">{tr('Đang tải thông báo...', 'Loading notifications...')}</p>}
        {feed?.items?.length === 0 && <p className="p-6 text-center text-sm text-slate-500">{tr('Chưa có thông báo mới.', 'No notifications yet.')}</p>}
        <ul>{(feed?.items || []).map(item => <li key={item.id} className={`border-b border-slate-500/15 p-4 ${!item.isRead ? darkMode ? 'bg-cyan-500/10' : 'bg-cyan-50' : ''}`}>
          <p className="text-sm"><span className="font-bold">{item.userName}</span> {tr('đã đăng nhập vào web.', 'signed in to the website.')}{!item.isRead && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-cyan-500" aria-label={tr('Chưa đọc', 'Unread')} />}</p>
          <time dateTime={item.createdAt} className="mt-1 block text-xs text-slate-500">{new Date(item.createdAt).toLocaleString(language === 'en' ? 'en-GB' : 'vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</time>
        </li>)}</ul>
      </div>
    </section>}
  </div>;
}
