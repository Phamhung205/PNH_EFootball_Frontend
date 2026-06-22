import React, { useState, useRef, useMemo } from 'react';
import { BarChart3, Swords, Image, Wallet, Download, Lock, Sparkles, Crown } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const vnd = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0);

function computeStandings(teams, matches) {
  const table = {};
  teams.forEach((t) => {
    table[t.id] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
  });
  matches.forEach((m) => {
    if (m.status !== 'done') return;
    const home = table[m.homeId];
    const away = table[m.awayId];
    if (!home || !away) return;
    const hs = Number(m.homeScore ?? 0);
    const as_ = Number(m.awayScore ?? 0);
    home.played++; away.played++;
    home.gf += hs; home.ga += as_;
    away.gf += as_; away.ga += hs;
    if (hs > as_) { home.won++; home.pts += 3; away.lost++; }
    else if (hs < as_) { away.won++; away.pts += 3; home.lost++; }
    else { home.drawn++; away.drawn++; home.pts++; away.pts++; }
  });
  return Object.values(table).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
}

const EXPORT_TYPES = [
  { id: 'standings', label: 'BXH', icon: BarChart3, color: 'from-teal-500 to-cyan-600', accent: 'teal' },
  { id: 'results', label: 'Kết Quả', icon: Swords, color: 'from-orange-500 to-amber-600', accent: 'orange' },
  { id: 'banner', label: 'Banner', icon: Image, color: 'from-purple-500 to-violet-600', accent: 'purple' },
  { id: 'finance', label: 'Tài Chính', icon: Wallet, color: 'from-emerald-500 to-green-600', accent: 'green' },
];

const QUALITY_OPTIONS = [
  { id: 'standard', label: 'Standard', scale: 1 },
  { id: 'high', label: 'High', scale: 2 },
  { id: 'ultra', label: 'Ultra', scale: 3 },
];

// ─── Type Card ────────────────────────────────────────────────────────────────

function TypeCard({ type, selected, onSelect, darkMode }) {
  const Icon = type.icon;
  return (
    <button
      onClick={() => onSelect(type.id)}
      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
        selected
          ? `bg-gradient-to-br ${type.color} border-transparent shadow-lg`
          : darkMode
          ? 'bg-white/5 border-white/10 hover:bg-white/8'
          : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
      }`}
    >
      <Icon size={22} className={selected ? 'text-white' : darkMode ? 'text-white/60' : 'text-gray-500'} />
      <span className={`text-xs font-bold ${selected ? 'text-white' : darkMode ? 'text-white/60' : 'text-gray-600'}`}>
        {type.label}
      </span>
      {selected && (
        <div className="absolute inset-0 rounded-2xl bg-white/10 pointer-events-none" />
      )}
    </button>
  );
}

// ─── Canvas Drawing ────────────────────────────────────────────────────────────

function drawCanvas(canvas, { tournament, exportType, watermark, scale = 1 }) {
  const W = 800 * scale;
  const H = 560 * scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const s = scale;

  const teams = tournament?.teams || [];
  const matches = tournament?.matches || [];
  const fund = tournament?.fund || {};
  const income = fund.income || [];
  const expenses = fund.expenses || [];

  // ── Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0a0f1a');
  bgGrad.addColorStop(1, '#0d1525');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Grid dots
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x = 0; x < W; x += 40 * s) {
    for (let y = 0; y < H; y += 40 * s) {
      ctx.beginPath();
      ctx.arc(x, y, 1 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Header gradient bar
  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, 'rgba(6,182,212,0.9)');
  headerGrad.addColorStop(1, 'rgba(99,102,241,0.9)');
  ctx.fillStyle = headerGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, 90 * s, [0, 0, 0, 0]);
  ctx.fill();

  // ── Header text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${24 * s}px Inter, system-ui, sans-serif`;
  ctx.fillText(tournament?.name || 'Giải Đấu', 28 * s, 38 * s);
  const typeLabels = { standings: 'Bảng Xếp Hạng', results: 'Kết Quả Thi Đấu', banner: 'Banner', finance: 'Tài Chính' };
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `${13 * s}px Inter, system-ui, sans-serif`;
  ctx.fillText(typeLabels[exportType] || exportType, 28 * s, 58 * s);

  // ── PNH Logo text (right)
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = `bold ${12 * s}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('PNH Football', W - 24 * s, 38 * s);
  ctx.textAlign = 'left';

  const contentY = 108 * s;
  const rowH = 40 * s;
  const pad = 28 * s;

  // ── Content
  if (exportType === 'standings') {
    const standings = computeStandings(teams, matches);
    const cols = ['#', 'Đội', 'Trận', 'T', 'H', 'B', 'HS', 'Điểm'];
    const colW = [(W - pad * 2) * 0.06, (W - pad * 2) * 0.32, (W - pad * 2) * 0.1,
      (W - pad * 2) * 0.08, (W - pad * 2) * 0.08, (W - pad * 2) * 0.08,
      (W - pad * 2) * 0.1, (W - pad * 2) * 0.18];
    let cx = pad;

    // Header row
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(pad, contentY - 6 * s, W - pad * 2, rowH);
    cols.forEach((c, i) => {
      ctx.fillStyle = 'rgba(6,182,212,0.9)';
      ctx.font = `bold ${10 * s}px Inter, system-ui, sans-serif`;
      ctx.fillText(c, cx + 6 * s, contentY + 18 * s);
      cx += colW[i];
    });

    // Data rows
    standings.slice(0, 8).forEach((entry, ri) => {
      const y = contentY + rowH * (ri + 1);
      if (ri % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(pad, y - 6 * s, W - pad * 2, rowH);
      }
      cx = pad;
      const vals = [
        ri + 1,
        entry.team.name,
        entry.played,
        entry.won,
        entry.drawn,
        entry.lost,
        `${entry.gf}-${entry.ga}`,
        entry.pts,
      ];
      vals.forEach((v, i) => {
        ctx.fillStyle = i === 7 ? 'rgba(6,182,212,1)' : i === 0 && ri < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][ri] : 'rgba(255,255,255,0.85)';
        ctx.font = `${i === 7 ? 'bold ' : ''}${11 * s}px Inter, system-ui, sans-serif`;
        ctx.fillText(String(v).slice(0, 22), cx + 6 * s, y + 18 * s);
        cx += colW[i];
      });
    });

  } else if (exportType === 'results') {
    const done = matches.filter((m) => m.status === 'done');
    done.slice(0, 9).forEach((m, ri) => {
      const home = teams.find((t) => t.id === m.homeId);
      const away = teams.find((t) => t.id === m.awayId);
      const y = contentY + rowH * ri;
      if (ri % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(pad, y - 4 * s, W - pad * 2, rowH);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = `${11 * s}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(home?.name || '?', pad + (W - pad * 2) * 0.38, y + 18 * s);
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(6,182,212,1)';
      ctx.font = `bold ${13 * s}px Inter, system-ui, sans-serif`;
      ctx.fillText(`${m.homeScore ?? 0} - ${m.awayScore ?? 0}`, W / 2, y + 18 * s);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = `${11 * s}px Inter, system-ui, sans-serif`;
      ctx.fillText(away?.name || '?', pad + (W - pad * 2) * 0.62, y + 18 * s);
    });
    ctx.textAlign = 'left';

  } else if (exportType === 'banner') {
    // Big tournament name + team logos placeholder
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = `bold ${56 * s}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(tournament?.name || 'Giải Đấu', W / 2, contentY + 120 * s);
    ctx.fillStyle = 'rgba(6,182,212,0.5)';
    ctx.font = `${16 * s}px Inter, system-ui, sans-serif`;
    ctx.fillText(`${teams.length} Đội Tham Dự`, W / 2, contentY + 165 * s);
    ctx.textAlign = 'left';

  } else if (exportType === 'finance') {
    const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpense = expenses.reduce((s, i) => s + Number(i.amount), 0);
    const balance = totalIncome - totalExpense;
    const rows = [
      ['Tổng Thu', vnd(totalIncome), 'rgba(52,211,153,1)'],
      ['Tổng Chi', vnd(totalExpense), 'rgba(248,113,113,1)'],
      ['Số Dư', vnd(balance), balance >= 0 ? 'rgba(34,211,238,1)' : 'rgba(248,113,113,1)'],
    ];
    rows.forEach(([label, val, color], ri) => {
      const y = contentY + rowH * ri * 1.8;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.roundRect(pad, y, W - pad * 2, rowH * 1.4, 12 * s);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = `${12 * s}px Inter, system-ui, sans-serif`;
      ctx.fillText(label, pad + 16 * s, y + 28 * s);
      ctx.fillStyle = color;
      ctx.font = `bold ${16 * s}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(val, W - pad - 16 * s, y + 28 * s);
      ctx.textAlign = 'left';
    });
  }

  // ── Footer
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, H - 36 * s, W, 36 * s);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${10 * s}px Inter, system-ui, sans-serif`;
  ctx.fillText(`Xuất bởi PNH Football · ${new Date().toLocaleDateString('vi-VN')}`, pad, H - 13 * s);

  // ── Watermark
  if (watermark) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${22 * s}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 8);
    for (let i = -2; i <= 2; i++) {
      for (let j = -1; j <= 1; j++) {
        ctx.fillText('PNH Football - Free Plan', i * 260 * s, j * 130 * s);
      }
    }
    ctx.restore();
  }
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ tournament, exportType, watermark, darkMode }) {
  const canvasRef = useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    drawCanvas(canvasRef.current, { tournament, exportType, watermark, scale: 1 });
  }, [tournament, exportType, watermark]);

  return (
    <div className={`rounded-2xl overflow-hidden border ${darkMode ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-gray-50'}`}>
      <div className={`px-4 py-2.5 border-b text-xs font-semibold flex items-center gap-1.5 ${darkMode ? 'border-white/8 text-white/40' : 'border-gray-200 text-gray-500'}`}>
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <span className="ml-2">Preview</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ display: 'block', maxHeight: '320px', objectFit: 'contain' }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExportPage({ tournament, darkMode, language, userPlan }) {
  const [exportType, setExportType] = useState('standings');
  const [format, setFormat] = useState('PNG');
  const [quality, setQuality] = useState('standard');
  const [exporting, setExporting] = useState(false);

  const isPro = userPlan === 'pro' || userPlan === 'ultra';
  const watermark = !isPro;
  const selectedQuality = isPro ? QUALITY_OPTIONS.find((q) => q.id === quality) : QUALITY_OPTIONS[0];

  const canvasRef = useRef(null);

  const handleExport = () => {
    if (!canvasRef.current) return;
    setExporting(true);

    const offscreen = document.createElement('canvas');
    drawCanvas(offscreen, {
      tournament,
      exportType,
      watermark,
      scale: selectedQuality?.scale || 1,
    });

    const mimeType = format === 'JPG' ? 'image/jpeg' : 'image/png';
    const ext = format === 'JPG' ? 'jpg' : 'png';
    const dataUrl = offscreen.toDataURL(mimeType, format === 'JPG' ? 0.92 : undefined);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${tournament?.name || 'export'}_${exportType}_${Date.now()}.${ext}`;
    a.click();

    setTimeout(() => setExporting(false), 1000);
  };

  const bg = darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-gray-100 text-gray-900';
  const cardBg = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const pillBase = `px-3 py-1.5 rounded-xl text-xs font-bold border transition-all`;
  const pillActive = 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent';
  const pillInactive = darkMode ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200';

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-6 space-y-5`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Download size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Xuất Dữ Liệu</h1>
          <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{tournament?.name}</p>
        </div>
        {/* Plan badge */}
        <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
          isPro
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-white/5 border-white/10 text-white/40'
        }`}>
          {isPro ? <Crown size={12} /> : <Lock size={12} />}
          {userPlan ? userPlan.toUpperCase() : 'FREE'}
        </div>
      </div>

      {/* Free plan notice */}
      {!isPro && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/8 border border-amber-500/20">
          <Sparkles size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300 leading-relaxed">
            Gói <strong>Free</strong> sẽ có watermark trên ảnh xuất. Nâng cấp lên <strong>Pro/Ultra</strong> để xuất không watermark và chất lượng cao hơn.
          </p>
        </div>
      )}

      {/* ── Export Type Cards ── */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Loại Xuất</p>
        <div className="grid grid-cols-4 gap-2">
          {EXPORT_TYPES.map((t) => (
            <TypeCard
              key={t.id}
              type={t}
              selected={exportType === t.id}
              onSelect={setExportType}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>

      {/* ── Format + Quality ── */}
      <div className={`rounded-2xl border p-5 ${cardBg} space-y-4`}>
        {/* Format toggle */}
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Định Dạng</p>
          <div className="flex gap-2">
            {['PNG', 'JPG'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`${pillBase} ${format === f ? pillActive : pillInactive}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Quality (pro/ultra only) */}
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-white/40' : 'text-gray-500'} flex items-center gap-1.5`}>
            Chất Lượng
            {!isPro && <Lock size={10} className="text-amber-400" />}
          </p>
          <div className="flex gap-2">
            {QUALITY_OPTIONS.map((q) => (
              <button
                key={q.id}
                disabled={!isPro}
                onClick={() => isPro && setQuality(q.id)}
                className={`${pillBase} ${isPro && quality === q.id ? pillActive : pillInactive} ${!isPro ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Preview ── */}
      <PreviewPanel
        tournament={tournament}
        exportType={exportType}
        watermark={watermark}
        darkMode={darkMode}
      />

      {/* ── Export Button ── */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/25"
      >
        <Download size={18} className={exporting ? 'animate-bounce' : ''} />
        {exporting ? 'Đang Xuất…' : `Xuất ${format}`}
      </button>
    </div>
  );
}
