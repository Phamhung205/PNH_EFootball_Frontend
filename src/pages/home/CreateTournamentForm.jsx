import React, { useState } from 'react';
import { Trophy, Layers, Swords, Calendar, CheckCircle2, AlertCircle, ArrowRight, Upload, Link as LinkIcon } from 'lucide-react';

const FORMATS = [
  { id: 'group',    icon: Layers,   label: 'Đấu Bảng',       desc: 'Chia thành nhiều bảng, top đội vào vòng tiếp.' },
  { id: 'knockout', icon: Swords,   label: 'Loại Trực Tiếp', desc: 'Thua là bị loại ngay lập tức.' },
  { id: 'league',   icon: Calendar, label: 'Giải Đường Dài', desc: 'Tất cả đội đấu vòng tròn với nhau.' },
  { id: 'hybrid',   icon: Trophy,   label: 'Hỗn Hợp',        desc: 'Đấu bảng rồi vào vòng loại trực tiếp.' },
];

const CreateTournamentForm = ({ darkMode, language, onCreated, onCancel, userPlan }) => {
  const dm = darkMode;
  const [name, setName]     = useState('');
  const [logo, setLogo]     = useState('');
  const [format, setFormat] = useState('');
  const [desc, setDesc]     = useState('');
  const [season, setSeason] = useState(''); // #9 mua giai
  const [logoOk, setLogoOk] = useState(true);
  const [logoTab, setLogoTab] = useState('url'); // 'url' hoac 'file'

  // Upload anh tu may -> chuyen base64 luu vao logo
  const handleLogoFile = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setLogo(reader.result); setLogoOk(true); };
    reader.readAsDataURL(file);
  };
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [apiError, setApiError] = useState('');

  const card  = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const input = dm ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500';
  const lbl   = dm ? 'text-slate-400' : 'text-slate-600';
  const dim   = dm ? 'text-slate-500' : 'text-slate-400';

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Vui lòng nhập tên giải đấu';
    if (!format)      e.format = 'Vui lòng chọn thể thức thi đấu';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError('');
    setLoading(true);

    const formatMap = { group: 'GroupStage_Knockout', knockout: 'Knockout', league: 'League', hybrid: 'GroupStage_Knockout' };
    const payload = {
      name: name.trim(),
      logo: logo.trim(),
      format: formatMap[format] || 'League',
      description: desc,
      season: season.trim() || null,
      status: 'Sắp khởi tranh',
    };

    try {
      await onCreated(payload);
      setDone(true);
    } catch (err) {
      // FIX LỖI 3: bắt riêng 403 (không phải Admin) để báo rõ ràng
      const msg = err?.message || '';
      if (msg.includes('403') || msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('quyền')) {
        setApiError('Bạn không có quyền tạo giải đấu. Chỉ tài khoản Admin mới được tạo.');
      } else if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        setApiError('Bạn cần đăng nhập (Admin) để tạo giải đấu.');
      } else {
        setApiError('Lỗi tạo giải: ' + (msg || 'không xác định'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center" style={{ animation: 'scaleIn .3s ease-out both' }}>
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 relative">
          <CheckCircle2 size={40} className="text-emerald-400" />
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
        </div>
        <h2 className={`text-2xl font-black mb-2 ${dm ? 'text-white' : 'text-slate-900'}`}>Tạo Giải Thành Công!</h2>
        <p className={`text-sm ${dim}`}>Đang chuyển vào giải đấu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" style={{ animation: 'fadeUp .25s ease-out both' }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Trophy size={22} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Tạo Giải Đấu Mới</h1>
          <p className={`text-sm ${dim}`}>Điền thông tin để khởi tạo giải đấu</p>
        </div>
      </div>

      {/* Thông báo lỗi API (vd 403 không phải Admin) */}
      {apiError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div className={`rounded-2xl border p-5 ${card}`}>
        <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${lbl}`}>Logo Giải Đấu</label>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {logo && logoOk
              ? <img src={logo} alt="logo" className="w-full h-full object-contain" onError={() => setLogoOk(false)} onLoad={() => setLogoOk(true)} />
              : <Trophy size={36} className={dim} />}
          </div>
          <div className="flex-1 space-y-2">
            {/* Tab chon URL hoac Upload file */}
            <div className={`flex p-1 rounded-xl border ${dm ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
              <button type="button" onClick={() => setLogoTab('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${logoTab === 'url' ? 'bg-emerald-500 text-white shadow' : (dm ? 'text-slate-400 hover:text-white' : 'text-slate-600')}`}>
                <LinkIcon size={13} /> URL / Emoji
              </button>
              <button type="button" onClick={() => setLogoTab('file')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${logoTab === 'file' ? 'bg-emerald-500 text-white shadow' : (dm ? 'text-slate-400 hover:text-white' : 'text-slate-600')}`}>
                <Upload size={13} /> Tải Ảnh Lên
              </button>
            </div>
            {logoTab === 'url' ? (
              <>
                <input value={logo.startsWith('data:') ? '' : logo} onChange={e => { setLogo(e.target.value); setLogoOk(true); }}
                  placeholder="https://example.com/logo.png hoặc 🏆"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input}`} />
                <p className={`text-xs ${dim}`}>Nhập URL ảnh (PNG, JPG, SVG) hoặc emoji. Xem preview realtime.</p>
              </>
            ) : (
              <>
                <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dm ? 'border-slate-700 hover:border-emerald-500 text-slate-300 hover:bg-slate-900' : 'border-slate-300 hover:border-emerald-500 text-slate-600 hover:bg-slate-50'}`}>
                  <Upload size={15} className="text-emerald-400" />
                  <span className="text-sm font-bold">Chọn ảnh từ máy</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                </label>
                <p className={`text-xs ${dim}`}>Chọn ảnh PNG, JPG từ máy. Ảnh sẽ lưu cùng giải đấu.</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
        <div>
          <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${lbl}`}>Tên Giải Đấu *</label>
          <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            placeholder="VD: Premier League 2026, Giải Vô Địch Bóng Đá..."
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input} ${errors.name ? 'border-red-500/50' : ''}`} />
          {errors.name && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
        </div>
        <div>
          <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${lbl}`}>Mùa Giải</label>
          <input value={season} onChange={e => setSeason(e.target.value)}
            placeholder="VD: Mùa 2026, Mùa 1... (không bắt buộc)"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input}`} />
        </div>
        <div>
          <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${lbl}`}>Mô Tả</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
            placeholder="Mô tả ngắn về giải đấu (không bắt buộc)..."
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${input}`} />
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${card}`}>
        <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${lbl}`}>Thể Thức Thi Đấu *</label>
        {errors.format && <p className="text-xs text-red-400 mb-3 flex items-center gap-1"><AlertCircle size={11} />{errors.format}</p>}
        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map(f => {
            const Icon = f.icon;
            const isSel = format === f.id;
            return (
              <button key={f.id} type="button" onClick={() => { setFormat(f.id); setErrors(p => ({ ...p, format: '' })); }}
                className={`p-4 rounded-xl border text-left transition-all ${isSel
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/15 to-cyan-500/5 shadow-lg shadow-emerald-500/10'
                  : (dm ? 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8' : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50')
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={isSel ? 'text-emerald-400' : (dm ? 'text-slate-400' : 'text-slate-500')} />
                  <span className={`text-sm font-black ${isSel ? 'text-emerald-400' : (dm ? 'text-white' : 'text-slate-900')}`}>{f.label}</span>
                  {isSel && <CheckCircle2 size={14} className="ml-auto text-emerald-400" />}
                </div>
                <p className={`text-xs leading-relaxed ${dim}`}>{f.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-colors ${dm ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            Hủy
          </button>
        )}
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60">
          {loading
            ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : <><Trophy size={16} /> Tạo Giải Đấu <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
};

export default CreateTournamentForm;