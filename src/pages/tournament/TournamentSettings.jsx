import React, { useState } from 'react';
import { Settings, Lock, AlertTriangle, Save, Trash2, CheckCircle, Trophy, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import RegistrationList from './RegistrationList';
import TournamentActions from './TournamentActions';

const FORMAT_OPTIONS = [
  { value: 'League', label: 'League (Vòng tròn)' },
  { value: 'Knockout', label: 'Knockout (Loại trực tiếp)' },
  { value: 'GroupStage_Knockout', label: 'Vòng bảng + Knockout' },
];

// Status dùng tiếng Việt — khớp backend + Schedule (canEdit check 'Đang diễn ra')
const buildStatusOptions = (tr) => [
  // value GIU NGUYEN tieng Viet (backend + Schedule so sanh chuoi nay) — chi dich label
  { value: 'Sắp khởi tranh', label: tr('🕐 Sắp Khởi Tranh','🕐 Upcoming') },
  { value: 'Đang diễn ra', label: tr('🟢 Đang Diễn Ra','🟢 Ongoing') },
  { value: 'Hoàn thành', label: tr('✅ Hoàn Thành','✅ Completed') },
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
      <CheckCircle size={16} />{tr('Đã lưu thành công!','Saved successfully!')}
    </div>
  );
}

export default function TournamentSettings({ tournament, darkMode, language, isAdmin, onUpdate, onDelete }) {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const STATUS_OPTIONS = buildStatusOptions(tr);
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
  // Cho phep nguoi dung dang ky tham du giai hay khong
  const [allowReg, setAllowReg] = useState(tournament?.allowRegistration === true);
  const [chatOn, setChatOn] = useState(tournament?.chatEnabled === true);
  const [savedToast, setSavedToast] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleSave = async () => {
    if (!onUpdate) return;
    try {
      // CHO backend luu xong (await). Truoc day khong cho -> bao thanh cong gia.
      await onUpdate({ ...tournament, name, logo, format, status, allowRegistration: allowReg, chatEnabled: chatOn });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (e) {
      alert(tr('Lỗi khi lưu: ','Error saving: ') + (e.message || tr('Thử lại sau','Please try again later')));
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
      alert(tr('Lỗi: ','Error: ') + (e.message || tr('Thử lại sau','Please try again later')));
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
          <h1 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tr('Cài Đặt Giải Đấu','Tournament Settings')}</h1>
          <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{tournament?.name}</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Lock size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{tr('Bạn không có quyền chỉnh sửa. Chỉ quản trị viên mới thay đổi được cài đặt.','You do not have permission to edit. Only admins can change settings.')}</p>
        </div>
      )}

      <div className={`rounded-2xl border p-5 space-y-5 ${cardBg}`}>
        <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{tr('Thông Tin Giải Đấu','Tournament Information')}</h2>

        <div>
          <FieldLabel darkMode={darkMode}>{tr('Tên Giải Đấu','Tournament Name')}</FieldLabel>
          <StyledInput value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("Nhập tên giải đấu...","Enter tournament name...")} disabled={disabled} darkMode={darkMode} />
        </div>

        <div>
          <FieldLabel darkMode={darkMode}>{tr('Logo Giải Đấu','Tournament Logo')}</FieldLabel>
          {/* Tab URL / Upload */}
          <div className={`flex p-1 rounded-xl border mb-2 ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
            <button type="button" onClick={() => setLogoTab('url')} disabled={disabled}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${logoTab === 'url' ? 'bg-emerald-500 text-white shadow' : (darkMode ? 'text-slate-400' : 'text-slate-600')}`}>
              <LinkIcon size={13} /> URL / Emoji
            </button>
            <button type="button" onClick={() => setLogoTab('file')} disabled={disabled}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${logoTab === 'file' ? 'bg-emerald-500 text-white shadow' : (darkMode ? 'text-slate-400' : 'text-slate-600')}`}>
              <Upload size={13} /> {tr('Tải Ảnh Lên','Upload Image')}
            </button>
          </div>
          {logoTab === 'url' ? (
            <StyledInput value={logo.startsWith('data:') ? '' : logo} onChange={(e) => setLogo(e.target.value)} placeholder={tr("https://example.com/logo.png hoặc 🏆","https://example.com/logo.png or 🏆")} disabled={disabled} darkMode={darkMode} />
          ) : (
            <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${darkMode ? 'border-slate-700 hover:border-emerald-500 text-slate-300' : 'border-slate-300 hover:border-emerald-500 text-slate-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload size={15} className="text-emerald-400" />
              <span className="text-sm font-bold">{tr('Chọn ảnh từ máy','Choose image from device')}</span>
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
          <FieldLabel darkMode={darkMode}>{tr('Thể Thức','Format')}</FieldLabel>
          <StyledSelect value={format} onChange={(e) => setFormat(e.target.value)} options={FORMAT_OPTIONS} disabled={disabled} darkMode={darkMode} />
        </div>

        <div>
          <FieldLabel darkMode={darkMode}>{tr('Trạng Thái','Status')}</FieldLabel>
          <StyledSelect value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} disabled={disabled} darkMode={darkMode} />
          <p className={`text-xs mt-2 ${darkMode ? 'text-cyan-400/70' : 'text-cyan-600'}`}>
            💡 {tr('Phải chọn "Đang diễn ra" mới nhập được tỉ số & tạo lịch.','You must select "Ongoing" before entering scores or creating a schedule.')}
          </p>
        </div>

        {/* O TICH: cho phep dang ky tham du (chi admin thay) */}
        {isAdmin && (
          <div>
            <FieldLabel darkMode={darkMode}>{tr('Đăng Ký Tham Dự','Registration')}</FieldLabel>
            <button
              type="button"
              onClick={() => !disabled && setAllowReg(v => !v)}
              disabled={disabled}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${allowReg
                ? (darkMode ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50')
                : (darkMode ? 'border-slate-700 bg-slate-800/40' : 'border-slate-300 bg-slate-50')}`}
            >
              <span className={`text-sm font-bold ${allowReg ? 'text-emerald-400' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                {allowReg ? '✅ Đang mở đăng ký' : '⛔ Đang đóng đăng ký'}
              </span>
              {/* Cong tac bat/tat */}
              <span className={`relative inline-block w-11 h-6 rounded-full transition-colors ${allowReg ? 'bg-emerald-500' : (darkMode ? 'bg-slate-600' : 'bg-slate-300')}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${allowReg ? 'translate-x-5' : ''}`} />
              </span>
            </button>
            <p className={`text-xs mt-2 ${darkMode ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
              💡 {tr('Bật để người dùng thấy nút "Đăng ký tham dự" ở trang giải.','Turn on so users see the "Register" button on the tournament page.')}
            </p>
          </div>
        )}

        {/* Cong tac MO BOX CHAT (admin bat -> user da dang ky thay box chat) */}
        {isAdmin && (
          <div>
            <FieldLabel darkMode={darkMode}>{tr('Box Chat Giải Đấu','Tournament Chat Box')}</FieldLabel>
            <button
              type="button"
              onClick={() => !disabled && setChatOn(v => !v)}
              disabled={disabled}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${chatOn
                ? (darkMode ? 'border-violet-500/50 bg-violet-500/10' : 'border-violet-400 bg-violet-50')
                : (darkMode ? 'border-slate-700 bg-slate-800/40' : 'border-slate-300 bg-slate-50')}`}
            >
              <span className={`text-sm font-bold ${chatOn ? 'text-violet-400' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                {chatOn ? tr('💬 Đã mở box chat','💬 Chat box opened') : '🔒 Box chat đang đóng'}
              </span>
              <span className={`relative inline-block w-11 h-6 rounded-full transition-colors ${chatOn ? 'bg-violet-500' : (darkMode ? 'bg-slate-600' : 'bg-slate-300')}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${chatOn ? 'translate-x-5' : ''}`} />
              </span>
            </button>
            <p className={`text-xs mt-2 ${darkMode ? 'text-violet-400/70' : 'text-violet-600'}`}>
              💡 {tr('Bật để mở box chat lên web. Tất cả người đã đăng ký giải sẽ thấy nút "Vào Box Chat".','Turn on to enable the chat box. Everyone registered will see the "Enter Chat Box" button.')}
            </p>
          </div>
        )}

        {isAdmin && (
          <button onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all active:scale-[0.98]">
            <Save size={16} />{tr('Lưu Thay Đổi','Save Changes')}
          </button>
        )}
      </div>

      {/* DANH SACH NGUOI DANG KY (chi admin, hien khi giai co ID) */}
      {isAdmin && (tournament?.id || tournament?.tournamentId) && (
        <RegistrationList
          tournamentId={tournament.id ?? tournament.tournamentId}
          darkMode={darkMode}
        />
      )}

      {/* Danh gia sao + Chia se + Sao luu (danh gia & chia se cho moi nguoi, sao luu chi admin) */}
      {(tournament?.id || tournament?.tournamentId) && (
        <TournamentActions
          tournament={tournament}
          darkMode={darkMode}
          isAdmin={isAdmin}
          fullData={tournament}
          language={language}
        />
      )}

      {isAdmin && (
        <div className={`rounded-2xl border-2 border-red-500/30 p-5 space-y-4 ${darkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="text-sm font-bold text-red-400">{tr('Vùng Nguy Hiểm','Danger Zone')}</h2>
          </div>

          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{tr('Kết Thúc Giải Đấu','End Tournament')}</p>
            <p className={`text-xs mb-3 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{tr('Đánh dấu giải đấu đã kết thúc.','Mark this tournament as finished.')}</p>
            <button onClick={handleFinish} disabled={status === 'Hoàn thành'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/80 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-95">
              <Trophy size={14} />{status === 'Hoàn thành' ? tr('Đã Kết Thúc','Finished') : tr('Kết Thúc Giải Đấu','End Tournament')}
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{tr('Xóa Giải Đấu','Delete Tournament')}</p>
            <p className={`text-xs mb-3 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{tr('Hành động này không thể hoàn tác.','This action cannot be undone.')}</p>

            {!deleteMode ? (
              <button onClick={() => setDeleteMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all active:scale-95">
                <Trash2 size={14} />{tr('Xóa Giải Đấu','Delete Tournament')}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-red-400 font-semibold">{tr('Nhập tên giải đấu để xác nhận: ','Type the tournament name to confirm: ')}<span className="font-black">"{tournament?.name}"</span></p>
                <StyledInput value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={tournament?.name} darkMode={darkMode} />
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={(deleteConfirm || '').trim().toLowerCase() !== (tournament?.name || '').trim().toLowerCase()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-95">
                    <Trash2 size={14} />{tr('Xác Nhận Xóa','Confirm Delete')}
                  </button>
                  <button onClick={() => { setDeleteMode(false); setDeleteConfirm(''); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${darkMode ? 'bg-white/8 text-white hover:bg-white/12' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    {tr('Hủy','Cancel')}
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