import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { championHonorApi } from '../services/championHonorApi';
import { getCompetitionLogo } from '../components/ChampionCompetitions';

export default function ChampionProfile({ playerKey, darkMode, language, onBack }) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [competition, setCompetition] = useState('all');
  const [placement, setPlacement] = useState('1');
  const [page, setPage] = useState(1);
  const heading = useRef(null);
  const english = language === 'en';
  const tr = (vi, en) => english ? en : vi;
  useEffect(() => {
    let alive = true;
    heading.current?.focus();
    championHonorApi.ranking('all').then(data => {
      if (alive) setPlayer(data.find(item => item.key === playerKey) || null);
    }).catch(() => { if (alive) setError(english ? 'Unable to load champion details.' : 'Không thể tải thông tin nhà vô địch.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [playerKey, english]);
  const history = player?.history || [];
  const competitions = [...new Set(history.map(item => item.competitionName).filter(Boolean))];
  const filtered = history.filter(item => (competition === 'all' || item.competitionName === competition) && (placement === 'all' || Number(item.placement) === Number(placement)))
    .slice().sort((a, b) => (Date.parse(b.endDate) || 0) - (Date.parse(a.endDate) || 0));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount);
  const panel = darkMode ? 'bg-[#081525] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const dateLabel = value => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString(english ? 'en-GB' : 'vi-VN') : '—';
  return <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-5">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-500/40 px-4 py-2 text-sm font-bold"><ArrowLeft size={17} />{tr('Quay lại BXH', 'Back to rankings')}</button>
    <h1 ref={heading} tabIndex={-1} className="text-xl sm:text-2xl font-black outline-none">{tr('Hồ sơ nhà vô địch', 'Champion profile')}</h1>
    {loading ? <p role="status">{tr('Đang tải...', 'Loading...')}</p> : error ? <p role="alert" className="text-red-500">{error}</p> : !player ? <p>{tr('Không tìm thấy nhà vô địch.', 'Champion not found.')}</p> : <>
      <section className={`rounded-2xl border p-4 sm:p-6 ${panel}`}>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400 bg-slate-800 text-white text-2xl font-black">
            {player.avatarUrl ? <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" /> : player.name?.[0] || '?'}
          </div>
          <div className="min-w-0"><h2 className="text-xl sm:text-2xl font-black break-words">{player.name}</h2><p className="mt-1 text-sm text-amber-500">{tr('Hạng toàn hệ thống', 'Overall rank')}: #{player.rank}</p></div>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[[tr('Vô địch', 'Champion'), player.gold ?? player.championships ?? 0, '🥇'], [tr('Á quân', 'Runner-up'), player.silver ?? 0, '🥈'], [tr('Hạng ba', 'Third place'), player.bronze ?? 0, '🥉'], [tr('Tổng danh hiệu', 'Total honours'), player.totalHonors ?? 0, '🏆']].map(([label, count, icon]) => <div key={label} className="rounded-xl border border-slate-500/20 p-3"><span className="text-xs">{icon} {label}</span><strong className="mt-1 block text-2xl">{count}</strong></div>)}
        </div>
      </section>
      <section className={`rounded-2xl border p-4 sm:p-6 ${panel}`}>
        <h2 className="flex items-center gap-2 text-lg font-black"><Trophy size={20} className="text-amber-500" />{tr('Lịch sử vô địch & thành tích', 'Championship & honours history')}</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <label className="text-xs">{tr('Giải đấu', 'Competition')}<select value={competition} onChange={e => { setCompetition(e.target.value); setPage(1); }} className={`mt-1 w-full rounded-lg border p-2.5 ${panel}`}><option value="all">{tr('Tất cả giải đấu', 'All competitions')}</option>{competitions.map(name => <option key={name}>{name}</option>)}</select></label>
          <label className="text-xs">{tr('Thành tích', 'Placement')}<select value={placement} onChange={e => { setPlacement(e.target.value); setPage(1); }} className={`mt-1 w-full rounded-lg border p-2.5 ${panel}`}><option value="1">{tr('Vô địch', 'Champion')}</option><option value="2">{tr('Á quân', 'Runner-up')}</option><option value="3">{tr('Hạng ba', 'Third place')}</option><option value="all">{tr('Tất cả thành tích', 'All honours')}</option></select></label>
        </div>
        <p className="my-4 text-xs text-slate-500">{filtered.length} {tr('thành tích', 'honours')}</p>
        <ol className="space-y-3">{filtered.slice((currentPage - 1) * 10, currentPage * 10).map((item, index) => <li key={item.id ?? index} className="flex gap-3 rounded-xl border border-slate-500/25 p-3 sm:p-4">
          <div className="w-10 h-10 shrink-0">{getCompetitionLogo(item.competitionName || '') ? <img src={getCompetitionLogo(item.competitionName)} alt="" className="w-full h-full object-contain" /> : <Trophy className="text-amber-500" />}</div>
          <div className="min-w-0 flex-1"><h3 className="font-bold break-words">{item.competitionName}</h3><p className="mt-1 text-xs text-amber-500">{Number(item.placement) === 1 ? tr('🥇 Vô địch', '🥇 Champion') : Number(item.placement) === 2 ? tr('🥈 Á quân', '🥈 Runner-up') : tr('🥉 Hạng ba', '🥉 Third place')} · {tr('Mùa', 'Season')} {item.season || '—'}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">{item.teamLogoUrl && <img src={item.teamLogoUrl} alt="" className="h-6 w-6 object-contain" />}<span className="break-words">{item.teamName || '—'}</span></div>
            <p className="mt-2 text-xs text-slate-500">{tr('Kết thúc', 'Finished')}: {dateLabel(item.endDate)}</p>
          </div>
        </li>)}</ol>
        {!filtered.length && <p className="py-8 text-center text-sm">{tr('Chưa có thành tích phù hợp.', 'No matching honours.')}</p>}
        <nav aria-label={tr('Phân trang lịch sử', 'History pages')} className="mt-5 flex items-center justify-between gap-2 text-xs"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-500/30 px-3 py-2 disabled:opacity-40">{tr('Trước', 'Previous')}</button><span>{currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-500/30 px-3 py-2 disabled:opacity-40">{tr('Tiếp', 'Next')}</button></nav>
      </section>
    </>}
  </div>;
}
