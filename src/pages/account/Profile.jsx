import React, { useState, useEffect, useRef } from 'react';
import { User, Save, Camera, Trophy, Crown, X, Shield } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5215';

const Profile = ({ darkMode, language }) => {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const dm = darkMode;

  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '', website: '' });
  const [avatar, setAvatar] = useState('');           // anh dai dien (base64 hoac URL)
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);                        // de mo hop thoai chon file

  const roleRaw = (currentUser?.role || '').toLowerCase();
  const isAdmin = roleRaw === 'admin';
  const isBtc = roleRaw === 'btc';

  // Khi nguoi dung chon anh tu may -> THU NHO + NEN roi luu base64 vao DB.
  // Nen anh nho (256px, JPEG) -> base64 gon (~15-40KB) -> luu DB nhanh, khong bi cat, khong mat.
  const handlePickAvatar = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', msg: 'Vui lòng chọn file ảnh.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    // Chap nhan anh goc toi 8MB (se tu nen nho lai), khong bat buoc < 1MB nua
    if (file.size > 8 * 1024 * 1024) {
      setToast({ type: 'error', msg: 'Ảnh quá lớn (>8MB). Chọn ảnh nhẹ hơn nhé.' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Thu nho ve toi da 128px (giu ti le) roi ve len canvas.
        // Avatar chi hien trong vong tron nho (~40-90px) nen 128px la du net,
        // ke ca tren man hinh Retina. Truoc day 256px q0.85 -> base64 ~27KB,
        // ma chuoi nay di kem MOI request /api/Auth/me -> tai trang cham.
        // 128px q0.7 -> chi con ~6KB, nhe hon ~4 lan.
        const MAX = 128;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // Xuat JPEG chat luong 0.7 -> base64 gon hon nhieu, mat net khong dang ke
        // o kich thuoc hien thi nho.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setAvatar(dataUrl);
      };
      img.onerror = () => {
        setToast({ type: 'error', msg: 'Không đọc được ảnh này.' });
        setTimeout(() => setToast(null), 3000);
      };
      img.src = reader.result;
    };
    reader.onerror = () => {
      setToast({ type: 'error', msg: 'Không đọc được file.' });
      setTimeout(() => setToast(null), 3000);
    };
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
          // GIU avatar cu neu server khong tra ve truong nay.
          // LOI CU: server tra avatarUrl rong -> 'if (u.avatarUrl)' khong chay nen
          // man hinh van thay anh, NHUNG localStorage lai bi ghi de bang chuoi rong
          // -> F5 lan sau mat anh. Day la ly do "luc mat luc khong".
          const avatarMoi = (u.avatarUrl !== undefined && u.avatarUrl !== null)
            ? u.avatarUrl
            : (avatar || '');

          const merged = {
            ...(currentUser || {}),
            id: u.id,
            email: u.email || '',
            name: u.fullName || '',
            role: u.role || 'User',
            avatar: avatarMoi,
          };
          setCurrentUser(merged);
          setForm(p => ({
            ...p,
            name: u.fullName || '',
            email: u.email || '',
            phone: u.phoneNumber || '',
          }));
          setAvatar(avatarMoi);
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
      if (!res.ok) throw new Error(data.message || tr('Lưu thất bại','Save failed'));

      const u = data.data ?? data;
      const merged = { ...(currentUser || {}), name: u.fullName, email: u.email, role: u.role, avatar: u.avatarUrl || '' };
      setCurrentUser(merged);
      localStorage.setItem('user', JSON.stringify(merged));

      setSaving(false); setSaved(true);
      setToast({ type: 'success', msg: tr('Đã lưu hồ sơ!','Profile saved!') });
      setTimeout(() => { setSaved(false); setToast(null); }, 2000);
    } catch (err) {
      setSaving(false);
      setToast({ type: 'error', msg: err.message || tr('Lỗi lưu hồ sơ','Error saving profile') });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const initial = (form.name || form.email || '?').trim().charAt(0).toUpperCase();

  const fields = [
    { key: 'name', label: tr('Họ và tên','Full name'), type: 'text', ph: tr('Nhập tên...','Enter your name...') },
    { key: 'email', label: 'Email', type: 'email', ph: 'email@example.com', readOnly: true },
    { key: 'phone', label: tr('Số điện thoại','Phone number'), type: 'tel', ph: '09xxxxxxxx' },
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
              ) : isBtc ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Shield size={9} /> {tr('BAN TỔ CHỨC','ORGANIZER')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <User size={9} /> {tr('THÀNH VIÊN','MEMBER')}
                </span>
              )}
              <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{form.email}</span>
            </div>
            <p className={`text-[11px] mt-1.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{tr('Nhấn biểu tượng máy ảnh để tải ảnh từ máy. Nhớ bấm "Lưu Thay Đổi".','Tap the camera icon to upload a photo. Remember to press "Save Changes".')}</p>
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
          <textarea rows={3} value={form.bio} placeholder={tr("Giới thiệu bản thân...","Tell us about yourself...")}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            className="pf-input w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none" />
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/20'}`}>
          {saving ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : saved ? <><Trophy size={16} /> {tr('Đã lưu!','Saved!')}</>
            : <><Save size={16} /> {language === 'vi' ? tr('Lưu Thay Đổi','Save Changes') : 'Save Changes'}</>}
        </button>
      </div>
    </div>
  );
};
export default Profile;