import React, { useState } from 'react';
import { Trophy, Layers, Swords, Calendar, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

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
  const [logoOk, setLogoOk] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

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
    setLoading(true);

    // Map format chữ thường sang chuẩn backend
    const formatMap = { group: 'GroupStage_Knockout', knockout: 'Knockout', league: 'League', hybrid: 'GroupStage_Knockout' };

    // Gọi onCreated — App.jsx sẽ tạo giải qua API và trả ID số thật.
    // KHÔNG sinh id giả ở đây nữa.
    const payload = {
      name: name.trim(),
      logo: logo.trim(),
      format: formatMap[format] || 'League',
      description: desc,
      status: 'Sắp khởi tranh',
    };

    try {
      await onCreated(payload); // App.jsx xử lý gọi API + chuyển trang
      setDone(true);
    } catch (err) {
      setErrors({ name: 'Lỗi tạo giải: ' + (err.message || 'không xác định') });
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

      <div className={`rounded-2xl border p-5 ${card}`}>
        <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${lbl}`}>Logo Giải Đấu</label>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {logo && logoOk
              ? <img src={logo} alt="logo" className="w-full h-full object-contain" onError={() => setLogoOk(false)} onLoad={() => setLogoOk(true)} />
              : <Trophy size={36} className={dim} />}
          </div>
          <div className="flex-1">
            <input value={logo} onChange={e => { setLogo(e.target.value); setLogoOk(true); }}
              placeholder="https://example.com/logo.png"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input}`} />
            <p className={`text-xs mt-1.5 ${dim}`}>Nhập URL ảnh PNG, JPG, SVG. Xem preview realtime.</p>
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