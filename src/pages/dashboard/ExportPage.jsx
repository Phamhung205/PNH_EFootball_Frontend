import React, { useState, useRef } from 'react';
import { Image, Download, BarChart3, Swords, Trophy, CheckCircle2 } from 'lucide-react';

const ExportPage = ({ darkMode, language, teams = [], matches = [], groups = {}, activeTournament }) => {
  const dm = darkMode;
  const [selected, setSelected] = useState('standings');
  const [format, setFormat]     = useState('png');
  const [exporting, setExporting] = useState(false);
  const [exported,  setExported]  = useState(false);
  const previewRef = useRef(null);

  const card = dm ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const dim  = dm ? 'text-slate-400' : 'text-slate-500';

  const EXPORT_TYPES = [
    { id: 'standings', icon: BarChart3, label: 'Bảng Xếp Hạng', color: 'from-teal-500 to-cyan-500', glow: 'shadow-teal-500/20' },
    { id: 'results',   icon: Swords,   label: 'Kết Quả Trận',   color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/20' },
    { id: 'banner',    icon: Image,    label: 'Banner Giải',     color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/20' },
  ];

  const getTeam = id => teams.find(t => t.id === id);

  const handleExport = async () => {
    setExporting(true);
    // Use the browser's built-in print/screenshot via canvas
    try {
      const el = previewRef.current;
      if (!el) { setExporting(false); return; }

      // Pure canvas export — no external dependency
      const doExport = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 900; canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#0a0f1a';
        ctx.fillRect(0, 0, 900, 600);

        // Header bar
        const grad = ctx.createLinearGradient(0, 0, 900, 0);
        grad.addColorStop(0, '#065f46'); grad.addColorStop(1, '#0e7490');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 900, 80);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🏆 ' + (activeTournament?.name || 'PNH Football'), 30, 50);

        // Sub label
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.fillText(EXPORT_TYPES.find(t=>t.id===selected)?.label || '', 30, 70);

        // Content
        ctx.textAlign = 'left';
        if (selected === 'standings') {
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 12px Inter, Arial, sans-serif';
          ctx.fillText('#   Đội                       Tr   Th   H    Tu   Điểm', 30, 115);
          ctx.fillStyle = '#334155';
          ctx.fillRect(30, 120, 840, 1);
          teams.slice(0, 8).forEach((team, i) => {
            const y = 145 + i * 44;
            ctx.fillStyle = i % 2 === 0 ? '#111827' : '#0d1424';
            ctx.fillRect(30, y - 20, 840, 40);
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${i < 3 ? 16 : 14}px Inter, Arial, sans-serif`;
            ctx.fillText(`${i+1}   ${team.name}`, 50, y + 5);
            ctx.fillStyle = '#2dd4bf';
            ctx.font = 'bold 16px Inter, Arial, sans-serif';
            ctx.fillText(String(Math.max(0, 9 - i * 2)), 820, y + 5);
          });
        } else if (selected === 'results') {
          const done = matches.filter(m => m.status === 'done').slice(-8).reverse();
          done.forEach((m, i) => {
            const home = getTeam(m.homeId); const away = getTeam(m.awayId);
            const y = 130 + i * 52;
            ctx.fillStyle = i % 2 === 0 ? '#111827' : '#0d1424';
            ctx.fillRect(30, y - 20, 840, 48);
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '15px Inter, Arial, sans-serif';
            ctx.textAlign = 'left';  ctx.fillText(home?.name || '?', 50, y + 8);
            ctx.textAlign = 'right'; ctx.fillText(away?.name || '?', 850, y + 8);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px Inter, Arial, sans-serif';
            ctx.textAlign = 'center'; ctx.fillText(`${m.homeScore}  –  ${m.awayScore}`, 450, y + 10);
          });
          ctx.textAlign = 'left';
        } else {
          ctx.fillStyle = '#10b981'; ctx.font = 'bold 48px Inter, Arial, sans-serif';
          ctx.textAlign = 'center'; ctx.fillText('🏆', 450, 280);
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px Inter, Arial, sans-serif';
          ctx.fillText(activeTournament?.name || 'PNH Football', 450, 340);
          ctx.fillStyle = '#94a3b8'; ctx.font = '18px Inter, Arial, sans-serif';
          ctx.fillText(activeTournament?.format || 'Giải Đấu Bóng Đá', 450, 380);
          ctx.textAlign = 'left';
        }

        // Footer
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 560, 900, 40);
        ctx.fillStyle = '#64748b'; ctx.font = '12px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Xuất bởi PNH Football Manager · ' + new Date().toLocaleDateString('vi-VN'), 450, 585);
        ctx.textAlign = 'left';

        const link = document.createElement('a');
        link.download = `pnh-football-${selected}.${format}`;
        link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
        link.click();
      };

      await doExport();
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch (err) { console.error(err); }
    setExporting(false);
  };

  const doneMatches = matches.filter(m => m.status === 'done');

  return (
    <div className="p-6 space-y-5" style={{ animation: 'fadeUp .25s ease-out both' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
          <Image size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Xuất Ảnh</h1>
          <p className={`text-sm ${dim}`}>Tải xuống hình ảnh chất lượng cao</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: options */}
        <div className="space-y-4">
          {/* Export type */}
          <div className={`rounded-2xl border p-4 space-y-2 ${card}`}>
            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${dim}`}>Loại Xuất</p>
            {EXPORT_TYPES.map(type => {
              const Icon = type.icon;
              const isSel = selected === type.id;
              return (
                <button key={type.id} type="button" onClick={() => setSelected(type.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isSel
                    ? `bg-gradient-to-r ${type.color} text-white shadow-lg ${type.glow}`
                    : dm ? 'bg-white/5 border border-white/8 text-slate-300 hover:bg-white/10' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  <Icon size={18} />
                  <span>{type.label}</span>
                  {isSel && <CheckCircle2 size={15} className="ml-auto" />}
                </button>
              );
            })}
          </div>

          {/* Format */}
          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${dim}`}>Định Dạng</p>
            <div className="flex gap-2">
              {['png', 'jpg'].map(f => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase transition-all ${format === f
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : dm ? 'bg-white/8 text-slate-400 hover:text-white hover:bg-white/12' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  .{f}
                </button>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button onClick={handleExport} disabled={exporting}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${exported
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-pink-500/20 disabled:opacity-60'}`}>
            {exporting
              ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Đang Xuất...</>
              : exported
                ? <><CheckCircle2 size={16} /> Đã Tải Xuống!</>
                : <><Download size={16} /> Tải Xuống .{format.toUpperCase()}</>}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2">
          <div ref={previewRef}
            className="rounded-2xl overflow-hidden border shadow-2xl"
            style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.08)' }}>
            {/* Preview header */}
            <div className="bg-gradient-to-r from-emerald-700 to-cyan-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Trophy size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-lg font-black text-white">{activeTournament?.name || 'PNH Football'}</p>
                  <p className="text-xs text-emerald-200">Xuất bởi PNH Football Manager</p>
                </div>
              </div>
            </div>

            {/* Preview content */}
            <div className="p-5">
              {selected === 'standings' && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Bảng Xếp Hạng</p>
                  {teams.length === 0
                    ? <p className="text-slate-500 text-sm text-center py-8">Chưa có dữ liệu</p>
                    : <div className="space-y-2">
                        {teams.slice(0, 5).map((team, i) => (
                          <div key={team.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
                            <span className="text-sm font-black text-slate-400 w-5">{i + 1}</span>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: `${team.color || '#10b981'}33` }}>
                              {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-contain rounded-lg" onError={e=>e.target.style.display='none'} /> : '⚽'}
                            </div>
                            <span className="flex-1 text-sm font-bold text-white">{team.name}</span>
                            <span className="text-sm font-black text-teal-400">{i === 0 ? 9 : i === 1 ? 7 : i === 2 ? 5 : i === 3 ? 3 : 1} đ</span>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              )}
              {selected === 'results' && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Kết Quả Gần Đây</p>
                  {doneMatches.length === 0
                    ? <p className="text-slate-500 text-sm text-center py-8">Chưa có kết quả</p>
                    : <div className="space-y-2">
                        {doneMatches.slice(-4).reverse().map(m => {
                          const home = getTeam(m.homeId); const away = getTeam(m.awayId);
                          return (
                            <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-sm">
                              <span className="font-bold text-white truncate flex-1">{home?.name || '?'}</span>
                              <span className="font-black text-white mx-3 shrink-0">{m.homeScore} – {m.awayScore}</span>
                              <span className="font-bold text-white truncate flex-1 text-right">{away?.name || '?'}</span>
                            </div>
                          );
                        })}
                      </div>
                  }
                </div>
              )}
              {selected === 'banner' && (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🏆</div>
                  <p className="text-2xl font-black text-white mb-1">{activeTournament?.name || 'PNH Football'}</p>
                  <p className="text-sm text-slate-400">{activeTournament?.format || 'Giải Đấu Bóng Đá'}</p>
                  <p className="text-xs text-slate-600 mt-4">{new Date().getFullYear()} · PNH Football Manager</p>
                </div>
              )}
            </div>
          </div>
          <p className={`text-xs text-center mt-2 ${dim}`}>Đây là xem trước. Ảnh thực tế có thể khác.</p>
        </div>
      </div>
    </div>
  );
};
export default ExportPage;
