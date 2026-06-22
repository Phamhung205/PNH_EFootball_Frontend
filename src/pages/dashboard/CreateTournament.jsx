import React, { useState } from 'react';
import { Trophy, Calendar, Swords, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

const FORMAT_OPTIONS = [
  { id: 'group-stage', label: 'Đấu Bảng', desc: 'Chia thành nhiều bảng, top đội vào vòng tiếp', icon: Layers },
  { id: 'knockout', label: 'Loại Trực Tiếp', desc: 'Thua là bị loại ngay', icon: Swords },
  { id: 'league', label: 'Giải Đường Dài', desc: 'Tất cả đấu với nhau theo lượt', icon: Calendar },
  { id: 'hybrid', label: 'Hỗn Hợp', desc: 'Bảng rồi đấu loại trực tiếp', icon: Trophy },
];

// map format UI -> chuẩn backend
const FORMAT_MAP = { 'group-stage': 'GroupStage_Knockout', knockout: 'Knockout', league: 'League', hybrid: 'GroupStage_Knockout' };

const CreateTournament = ({ darkMode, language, onCreated }) => {
  const [logo, setLogo] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const card = darkMode
    ? 'bg-white/5 border border-white/10 text-white'
    : 'bg-white border border-slate-200 shadow-xl text-slate-800';

  const inputBase = `w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
    darkMode
      ? 'bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/40'
      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-emerald-400/40'
  }`;

  const labelBase = `block text-sm font-semibold mb-1.5 ${darkMode ? 'text-white/70' : 'text-slate-600'}`;

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Vui lòng nhập tên giải đấu';
    if (!format) e.format = 'Vui lòng chọn thể thức';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // FIX LỖI 3: gọi API THẬT qua onCreated (await + try/catch).
  // Trước đây dùng setTimeout + id giả Date.now() -> báo thành công ảo dù backend trả 403.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      logo: logoError ? '' : logo.trim(),
      description: description.trim(),
      format: FORMAT_MAP[format] || 'League',
      status: 'Sắp khởi tranh',
    };

    try {
      await onCreated(payload); // App.jsx gọi tournamentApi.create thật
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName(''); setLogo(''); setDescription(''); setFormat('');
        setErrors({}); setLogoError(false);
      }, 2000);
    } catch (err) {
      // Bắt lỗi 403 (không phải Admin) và các lỗi khác
      const msg = err?.message || '';
      if (msg.includes('403') || msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('quyền')) {
        setApiError('Bạn không có quyền tạo giải đấu. Chỉ tài khoản Admin mới được tạo.');
      } else if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        setApiError('Bạn cần đăng nhập (Admin) để tạo giải đấu.');
      } else {
        setApiError('Tạo giải thất bại: ' + (msg || 'lỗi không xác định'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-full p-4 md:p-8 flex items-start justify-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      <div className={`w-full max-w-2xl rounded-2xl ${card} p-6 md:p-8 flex flex-col gap-6`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tạo Giải Đấu Mới</h1>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-slate-400'}`}>Điền thông tin để khởi tạo giải đấu</p>
          </div>
        </div>

        {/* Thông báo lỗi API (vd 403) */}
        {apiError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div>
            <label className={labelBase}>URL Logo</label>
            <div className="flex items-center gap-4">
              <div className={`w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center border ${
                darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'
              }`}>
                {logo && !logoError ? (
                  <img src={logo} alt="Logo preview" className="w-full h-full object-cover"
                    onError={() => setLogoError(true)} onLoad={() => setLogoError(false)} />
                ) : (
                  <Trophy className={`w-10 h-10 ${darkMode ? 'text-white/20' : 'text-slate-300'}`} />
                )}
              </div>
              <input type="url" value={logo}
                onChange={(e) => { setLogo(e.target.value); setLogoError(false); }}
                placeholder="https://example.com/logo.png" className={`${inputBase} flex-1`} />
            </div>
          </div>

          <div>
            <label className={labelBase}>Tên Giải Đấu <span className="text-red-400">*</span></label>
            <input type="text" value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }}
              placeholder="VD: Giải Bóng Đá PNH 2025"
              className={`${inputBase} ${errors.name ? 'ring-2 ring-red-400/60' : ''}`} />
            {errors.name && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className={labelBase}>Mô Tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về giải đấu..." rows={3} className={`${inputBase} resize-none`} />
          </div>

          <div>
            <label className={labelBase}>Thể Thức <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = format === opt.id;
                return (
                  <button type="button" key={opt.id}
                    onClick={() => { setFormat(opt.id); if (errors.format) setErrors((p) => ({ ...p, format: '' })); }}
                    className={`flex flex-col items-start gap-1.5 rounded-xl p-3.5 border text-left transition-all duration-150 ${
                      selected ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                        : darkMode ? 'border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selected ? 'bg-emerald-500' : darkMode ? 'bg-white/10' : 'bg-slate-200'
                    }`}>
                      <Icon className={`w-4 h-4 ${selected ? 'text-white' : darkMode ? 'text-white/60' : 'text-slate-500'}`} />
                    </div>
                    <span className={`text-sm font-semibold ${selected ? 'text-emerald-400' : ''}`}>{opt.label}</span>
                    <span className={`text-xs leading-snug ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
            {errors.format && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> {errors.format}
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting || success}
            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              success ? 'bg-emerald-500'
                : submitting ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-70 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 active:scale-[0.99] shadow-lg shadow-emerald-500/20'
            }`}>
            {success ? (<><CheckCircle2 className="w-5 h-5" /> Tạo Thành Công!</>)
              : submitting ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg> Đang tạo...</>
              ) : (<><Trophy className="w-4 h-4" /> Tạo Giải Đấu</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;