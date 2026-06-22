import React, { useState, useEffect, useRef } from 'react';
import { User, Save, Camera, Trophy, Crown, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5215';

const Profile = ({ darkMode, language }) => {
  const dm = darkMode;

  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '', website: '' });
  const [avatar, setAvatar] = useState('');           // anh dai dien (base64 hoac URL)
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);                        // de mo hop thoai chon file

  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  // Khi nguoi dung chon anh tu may -> doc thanh base64 va xem truoc ngay
  const handlePickAvatar = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', msg: 'Vui lòng chọn file ảnh.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    // Canh bao neu anh qua nang (base64 luu DB -> nen < 1MB)
    if (file.size > 1024 * 1024) {
      setToast({ type: 'error', msg: 'Ảnh quá lớn (>1MB). Vui lòng chọn ảnh nhẹ hơn.' });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    if (fileRef.current) fileRef.current.value = '';
  };

  useEffect(() => {
    let alive = true;
    const token = localStorage.getItem('token') || '';

    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      if (u && alive) {
        setCurrentUser(u);
        setForm(p => ({ ...p, name: u.name || u.fullName || '', email: u.email || '' }));
        if (u.avatar) setAvatar(u.avatar);
      }
    } catch { /* */ }

    if (token) {
      fetch(`${API_BASE}/api/Auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (!alive || !res) return;
          const u = res.data ?? res;
          const merged = {
            id: u.id,
            email: u.email || '',
            name: u.fullName || '',
            role: u.role || 'User',
            avatar: u.avatarUrl || '',
          };
          setCurrentUser(merged);
          setForm(p => ({
            ...p,
            name: u.fullName || '',
            email: u.email || '',
            phone: u.phoneNumber || '',
          }));
          if (u.avatarUrl) setAvatar(u.avatarUrl);
          localStorage.setItem('user', JSON.stringify(merged));
        })
        .catch(() => { /* offline -> giữ localStorage */ });
    }
    return () => { alive = false; };
  }, []);

  const card = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const label = dm ? 'text-slate-400' : 'text-slate-600';

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE}/api/Auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fullName: form.name, phoneNumber: form.phone, avatarUrl: avatar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Lưu thất bại');

      const u = data.data ?? data;
      const merged = { ...(currentUser || {}), name: u.fullName, email: u.email, role: u.role, avatar: u.avatarUrl || '' };
      setCurrentUser(merged);
      localStorage.setItem('user', JSON.stringify(merged));

      setSaving(false); setSaved(true);
      setToast({ type: 'success', msg: 'Đã lưu hồ sơ!' });
      setTimeout(() => { setSaved(false); setToast(null); }, 2000);
    } catch (err) {
      setSaving(false);
      setToast({ type: 'error', msg: err.message || 'Lỗi lưu hồ sơ' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const initial = (form.name || form.email || '?').trim().charAt(0).toUpperCase();

  const fields = [
    { key: 'name', label: 'Họ và tên', type: 'text', ph: 'Nhập tên...' },
    { key: 'email', label: 'Email', type: 'email', ph: 'email@example.com', readOnly: true },
    { key: 'phone', label: 'Số điện thoại', type: 'tel', ph: '09xxxxxxxx' },
    { key: 'website', label: 'Website', type: 'url', ph: 'https://...' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      <style>{`
        .pf-input {
          background-color: ${dm ? '#0f172a' : '#f8fafc'} !important;
          color: ${dm ? '#ffffff' : '#0f172a'} !important;
          -webkit-text-fill-color: ${dm ? '#ffffff' : '#0f172a'} !important;
          caret-color: #10b981 !important;
          border-color: ${dm ? '#334155' : '#cbd5e1'} !important;
        }
        .pf-input::placeholder { color: ${dm ? '#64748b' : '#94a3b8'} !important; }
        .pf-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 2px rgba(16,185,129,.2) !important;
        }
        .pf-input:read-only { opacity:.7; cursor:not-allowed; }
        .pf-input:-webkit-autofill,
        .pf-input:-webkit-autofill:hover,
        .pf-input:-webkit-autofill:focus {
          -webkit-text-fill-color: ${dm ? '#ffffff' : '#0f172a'} !important;
          -webkit-box-shadow: 0 0 0 1000px ${dm ? '#0f172a' : '#f8fafc'} inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{language === 'vi' ? 'Hồ Sơ Cá Nhân' : 'My Profile'}</h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{language === 'vi' ? 'Quản lý thông tin tài khoản' : 'Manage your account info'}</p>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-emerald-500/20 overflow-hidden">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                : initial}
            </div>
            {/* input file an, mo bang nut Camera */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickAvatar} />
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-md"
              title="Tải ảnh đại diện">
              <Camera size={13} className="text-white" />
            </button>
            {avatar && (
              <button onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                title="Xóa ảnh">
                <X size={12} className="text-white" />
              </button>
            )}
          </div>
          <div>
            <p className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{form.name || '—'}</p>
            <div className="flex items-center gap-2 mt-1">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown size={9} /> ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <User size={9} /> THÀNH VIÊN
                </span>
              )}
              <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{form.email}</span>
            </div>
            <p className={`text-[11px] mt-1.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Nhấn biểu tượng máy ảnh để tải ảnh từ máy. Nhớ bấm "Lưu Thay Đổi".</p>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 space-y-4 ${card}`}>
        {fields.map(f => (
          <div key={f.key}>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${label}`}>{f.label}</label>
            <input type={f.type} value={form[f.key]} placeholder={f.ph} readOnly={f.readOnly}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="pf-input w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all" />
          </div>
        ))}
        <div>
          <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${label}`}>Bio</label>
          <textarea rows={3} value={form.bio} placeholder="Giới thiệu bản thân..."
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            className="pf-input w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none" />
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/20'}`}>
          {saving ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : saved ? <><Trophy size={16} /> Đã lưu!</>
            : <><Save size={16} /> {language === 'vi' ? 'Lưu Thay Đổi' : 'Save Changes'}</>}
        </button>
      </div>
    </div>
  );
};
export default Profile;