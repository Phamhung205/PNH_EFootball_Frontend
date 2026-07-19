import React, { useState } from 'react';
import { Trophy, Layers, Swords, Calendar, CheckCircle2, AlertCircle, ArrowRight, Upload, Link as LinkIcon, Lock, CreditCard } from 'lucide-react';

const buildFormats = (tr) => [
  { id: 'group',    icon: Layers,   label: tr('Đấu Bảng','Group Stage'),        desc: tr('Chia thành nhiều bảng, top đội vào vòng tiếp.','Split into groups, top teams advance.') },
  { id: 'knockout', icon: Swords,   label: tr('Loại Trực Tiếp','Knockout'),     desc: tr('Thua là bị loại ngay lập tức.','Lose once and you are out.') },
  { id: 'league',   icon: Calendar, label: tr('Giải Đường Dài','League'),       desc: tr('Tất cả đội đấu vòng tròn với nhau.','Every team plays each other.') },
  { id: 'hybrid',   icon: Trophy,   label: tr('Hỗn Hợp','Hybrid'),              desc: tr('Đấu bảng rồi vào vòng loại trực tiếp.','Group stage then knockout rounds.') },
];

const CreateTournamentForm = ({ darkMode, language, onCreated, onCancel, userPlan }) => {
  const dm = darkMode;
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const FORMATS = buildFormats(tr);
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
  const [limitInfo, setLimitInfo] = useState(null);   // het han muc goi (dung thu)

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
    setLimitInfo(null);
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
      const msg = err?.message || '';
      // Het han muc goi (het luot dung thu) -> bao rieng, kem loi moi dang ky goi
      if (err?.code === 'PLAN_LIMIT_TOURNAMENTS') {
        setLimitInfo({
          message: msg,
          used: err?.data?.used,
          limit: err?.data?.limit,
          plan: err?.data?.plan || 'free',
        });
      } else if (msg.includes('403') || msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('quyền')) {
        setApiError(tr('Bạn không có quyền tạo giải đấu. Chỉ tài khoản Admin mới được tạo.',
                       'You do not have permission to create tournaments. Admin only.'));
      } else if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        setApiError(tr('Bạn cần đăng nhập (Admin) để tạo giải đấu.',
                       'You need to sign in (Admin) to create a tournament.'));
      } else {
        setApiError(tr('Lỗi tạo giải: ','Error creating tournament: ') + (msg || tr('không xác định','unknown')));
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
        <h2 className={`text-2xl font-black mb-2 ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('Tạo Giải Thành Công!','Tournament Created!')}</h2>
        <p className={`text-sm ${dim}`}>{tr('Đang chuyển vào giải đấu...','Opening the tournament...')}</p>
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
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{tr('Tạo Giải Đấu Mới','Create New Tournament')}</h1>
          <p className={`text-sm ${dim}`}>{tr('Điền thông tin để khởi tạo giải đấu','Fill in the details to start a tournament')}</p>
        </div>
      </div>

      {/* ── HET LUOT DUNG THU: bao ro + moi dang ky goi ── */}
      {limitInfo && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lock size={18} className="text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-amber-400">
                {tr('Đã Hết Lượt Dùng Thử','Free Trial Limit Reached')}
              </h3>
              <p className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{limitInfo.message}</p>
            </div>
          </div>

          {typeof limitInfo.used === 'number' && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                {tr('Đã dùng','Used')}: {limitInfo.used}/{limitInfo.limit} {tr('giải','tournaments')}
              </span>
              <span className={`px-2.5 py-1 rounded-lg ${dm ? 'bg-white/5 border border-white/10 text-slate-300' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>
                {tr('Gói hiện tại','Current plan')}: {String(limitInfo.plan).toUpperCase()}
              </span>
            </div>
          )}

          <p className={`text-xs ${dim}`}>
            {tr('Đăng ký gói để tạo thêm giải đấu và mở giới hạn số đội. Vào mục Gói Đăng Ký trong menu tài khoản.',
                'Subscribe to create more tournaments and raise the team limit. Open Subscription in your account menu.')}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <CreditCard size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400">
              {tr('Tài khoản → Gói Đăng Ký','Account → Subscription')}
            </span>
          </div>
        </div>
      )}

      {/* Thông báo lỗi API (vd 403 không phải Admin) */}
      {apiError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div className={`rounded-2xl border p-5 ${card}`}>
        <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${lbl}`}>{tr('Logo Giải Đấu','Tournament Logo')}</label>
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
                <Upload size={13} /> {tr('Tải Ảnh Lên','Upload Image')}
              </button>
            </div>
            {logoTab === 'url' ? (
              <>
                <input value={logo.startsWith('data:') ? '' : logo} onChange={e => { setLogo(e.target.value); setLogoOk(true); }}
                  placeholder={tr("https://example.com/logo.png hoặc 🏆","https://example.com/logo.png or 🏆")}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input}`} />
                <p className={`text-xs ${dim}`}>{tr('Nhập URL ảnh (PNG, JPG, SVG) hoặc emoji. Xem preview realtime.','Enter an image URL (PNG, JPG, SVG) or an emoji. Preview updates live.')}</p>
              </>
            ) : (
              <>
                <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dm ? 'border-slate-700 hover:border-emerald-500 text-slate-300 hover:bg-slate-900' : 'border-slate-300 hover:border-emerald-500 text-slate-600 hover:bg-slate-50'}`}>
                  <Upload size={15} className="text-emerald-400" />
                  <span className="text-sm font-bold">{tr('Chọn ảnh từ máy','Choose image from device')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                </label>
                <p className={`text-xs ${dim}`}>{tr('Chọn ảnh PNG, JPG từ máy. Ảnh sẽ lưu cùng giải đấu.','Pick a PNG or JPG from your device. It is saved with the tournament.')}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
        <div>
          <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${lbl}`}>{tr('Tên Giải Đấu *','Tournament Name *')}</label>
          <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            placeholder={tr("VD: Giải Vô Địch Bóng Đá 2026...","e.g. Football Championship 2026...")}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input} ${errors.name ? 'border-red-500/50' : ''}`} />
          {errors.name && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
        </div>
        <div>
          <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${lbl}`}>{tr('Mùa Giải','Season')}</label>
          <input value={season} onChange={e => setSeason(e.target.value)}
            placeholder={tr("VD: Mùa 2026, Mùa 1... (không bắt buộc)","e.g. Season 2026, Season 1... (optional)")}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${input}`} />
        </div>
        <div>
          <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${lbl}`}>{tr('Mô Tả','Description')}</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
            placeholder={tr("Mô tả ngắn về giải đấu (không bắt buộc)...","Short description of the tournament (optional)...")}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${input}`} />
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${card}`}>
        <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${lbl}`}>{tr('Thể Thức Thi Đấu *','Tournament Format *')}</label>
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
            {tr('Hủy','Cancel')}
          </button>
        )}
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60">
          {loading
            ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : <><Trophy size={16} /> {tr('Tạo Giải Đấu','Create Tournament')} <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
};

export default CreateTournamentForm;