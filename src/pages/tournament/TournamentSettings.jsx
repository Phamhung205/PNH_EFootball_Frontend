import React, { useState } from 'react';
import { Settings, Lock, AlertTriangle, Save, Trash2, CheckCircle, Trophy, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';

const FORMAT_OPTIONS = [
  { value: 'League', label: 'League (Vòng tròn)' },
  { value: 'Knockout', label: 'Knockout (Loại trực tiếp)' },
  { value: 'GroupStage_Knockout', label: 'Vòng bảng + Knockout' },
];

// Status dùng tiếng Việt — khớp backend + Schedule (canEdit check 'Đang diễn ra')
const STATUS_OPTIONS = [
  { value: 'Sắp khởi tranh', label: '🕐 Sắp Khởi Tranh' },
  { value: 'Đang diễn ra', label: '🟢 Đang Diễn Ra' },
  { value: 'Hoàn thành', label: '✅ Hoàn Thành' },
];

function FieldLabel({ children, darkMode }) {
  return (
    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
      {children}
    </label>
  );
}

function StyledInput({ value, onChange, placeholder, disabled, darkMode, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
        ${darkMode
          ? 'bg-slate-950/70 border-slate-700 text-white placeholder-white/20 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'}`} />
  );
}

function StyledSelect({ value, onChange, options, disabled, darkMode }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all appearance-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${darkMode
          ? 'bg-slate-950/70 border-slate-700 text-white focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
          : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value} className={darkMode ? 'bg-gray-900' : 'bg-white'}>{o.label}</option>
      ))}
    </select>
  );
}

function SavedToast({ show }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-2xl animate-bounce">
      <CheckCircle size={16} />Đã lưu thành công!
    </div>
  );
}

export default function TournamentSettings({ tournament, darkMode, language, isAdmin, onUpdate, onDelete }) {
  const [name, setName] = useState(tournament?.name || '');
  const [logo, setLogo] = useState(tournament?.logo || '');
  const [logoTab, setLogoTab] = useState('url');

  const handleLogoFile = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };
  const [format, setFormat] = useState(tournament?.format || 'League');
  const [status, setStatus] = useState(tournament?.status || 'Sắp khởi tranh');
  const [savedToast, setSavedToast] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleSave = async () => {
    if (!onUpdate) return;
    try {
      // CHO backend luu xong (await). Truoc day khong cho -> bao thanh cong gia.
      await onUpdate({ ...tournament, name, logo, format, status });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (e) {
      alert('Lỗi khi lưu: ' + (e.message || 'Thử lại sau'));
    }
  };

  const handleFinish = async () => {
    if (!onUpdate) return;
    setStatus('Hoàn thành');
    try {
      await onUpdate({ ...tournament, status: 'Hoàn thành' });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (e) {
      alert('Lỗi: ' + (e.message || 'Thử lại sau'));
    }
  };

  const handleDelete = () => {
    const a = (deleteConfirm || '').trim().toLowerCase();
    const b = (tournament?.name || '').trim().toLowerCase();
    if (a === b) onDelete?.();
  };

  const bg = darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-gray-100 text-gray-900';
  const cardBg = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const disabled = !isAdmin;

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-6 space-y-5`}>
      <SavedToast show={savedToast} />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
          <Settings size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cài Đặt Giải Đấu</h1>
          <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{tournament?.name}</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Lock size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">Bạn không có quyền chỉnh sửa. Chỉ quản trị viên mới thay đổi được cài đặt.</p>
        </div>
      )}

      <div className={`rounded-2xl border p-5 space-y-5 ${cardBg}`}>
        <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Thông Tin Giải Đấu</h2>

        <div>
          <FieldLabel darkMode={darkMode}>Tên Giải Đấu</FieldLabel>
          <StyledInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên giải đấu..." disabled={disabled} darkMode={darkMode} />
        </div>

        <div>
          <FieldLabel darkMode={darkMode}>Logo Giải Đấu</FieldLabel>
          {/* Tab URL / Upload */}
          <div className={`flex p-1 rounded-xl border mb-2 ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
            <button type="button" onClick={() => setLogoTab('url')} disabled={disabled}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${logoTab === 'url' ? 'bg-emerald-500 text-white shadow' : (darkMode ? 'text-slate-400' : 'text-slate-600')}`}>
              <LinkIcon size={13} /> URL / Emoji
            </button>
            <button type="button" onClick={() => setLogoTab('file')} disabled={disabled}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${logoTab === 'file' ? 'bg-emerald-500 text-white shadow' : (darkMode ? 'text-slate-400' : 'text-slate-600')}`}>
              <Upload size={13} /> Tải Ảnh Lên
            </button>
          </div>
          {logoTab === 'url' ? (
            <StyledInput value={logo.startsWith('data:') ? '' : logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://example.com/logo.png hoặc 🏆" disabled={disabled} darkMode={darkMode} />
          ) : (
            <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${darkMode ? 'border-slate-700 hover:border-emerald-500 text-slate-300' : 'border-slate-300 hover:border-emerald-500 text-slate-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload size={15} className="text-emerald-400" />
              <span className="text-sm font-bold">Chọn ảnh từ máy</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} disabled={disabled} />
            </label>
          )}
          {logo ? (
            <div className="mt-3 flex items-center gap-3">
              <img src={logo} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow-lg" onError={(e) => { e.target.style.display = 'none'; }} />
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Preview</p>
              </div>
            </div>
          ) : (
            <div className={`mt-3 w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
              <ImageIcon size={20} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
            </div>
          )}
        </div>

        <div>
          <FieldLabel darkMode={darkMode}>Thể Thức</FieldLabel>
          <StyledSelect value={format} onChange={(e) => setFormat(e.target.value)} options={FORMAT_OPTIONS} disabled={disabled} darkMode={darkMode} />
        </div>

        <div>
          <FieldLabel darkMode={darkMode}>Trạng Thái</FieldLabel>
          <StyledSelect value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} disabled={disabled} darkMode={darkMode} />
          <p className={`text-xs mt-2 ${darkMode ? 'text-cyan-400/70' : 'text-cyan-600'}`}>
            💡 Phải chọn "Đang diễn ra" mới nhập được tỉ số & tạo lịch.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all active:scale-[0.98]">
            <Save size={16} />Lưu Thay Đổi
          </button>
        )}
      </div>

      {isAdmin && (
        <div className={`rounded-2xl border-2 border-red-500/30 p-5 space-y-4 ${darkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="text-sm font-bold text-red-400">Vùng Nguy Hiểm</h2>
          </div>

          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Kết Thúc Giải Đấu</p>
            <p className={`text-xs mb-3 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Đánh dấu giải đấu đã kết thúc.</p>
            <button onClick={handleFinish} disabled={status === 'Hoàn thành'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/80 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-95">
              <Trophy size={14} />{status === 'Hoàn thành' ? 'Đã Kết Thúc' : 'Kết Thúc Giải Đấu'}
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Xóa Giải Đấu</p>
            <p className={`text-xs mb-3 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Hành động này không thể hoàn tác.</p>

            {!deleteMode ? (
              <button onClick={() => setDeleteMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all active:scale-95">
                <Trash2 size={14} />Xóa Giải Đấu
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-red-400 font-semibold">Nhập tên giải đấu để xác nhận: <span className="font-black">"{tournament?.name}"</span></p>
                <StyledInput value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={tournament?.name} darkMode={darkMode} />
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={(deleteConfirm || '').trim().toLowerCase() !== (tournament?.name || '').trim().toLowerCase()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-95">
                    <Trash2 size={14} />Xác Nhận Xóa
                  </button>
                  <button onClick={() => { setDeleteMode(false); setDeleteConfirm(''); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${darkMode ? 'bg-white/8 text-white hover:bg-white/12' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}