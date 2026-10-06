import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Crown, Medal, Trophy, Users } from 'lucide-react';
import { getCompetitionLogo } from './ChampionCompetitions';
import './ChampionRanking.css';

const medals = player => `🥇 ${player.gold ?? 0}  🥈 ${player.silver ?? 0}  🥉 ${player.bronze ?? 0}`;

function Portrait({ src, name, club = false }) {
  const [failed, setFailed] = useState(false);
  return <span className={club ? 'honor-club-logo' : 'honor-avatar'}>
    {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} />
      : club ? <Trophy size={17} /> : <span>{name?.[0]?.toUpperCase() || '?'}</span>}
  </span>;
}

function historyFor(player, all) {
  return (player.history || []).filter(item => all || Number(item.placement) === 1)
    .slice().sort((a, b) => (Date.parse(b.endDate) || 0) - (Date.parse(a.endDate) || 0));
}

function clubsFor(player, history) {
  const entries = player.teams?.length ? player.teams : history.map(item => ({ name: item.teamName, logoUrl: item.teamLogoUrl }));
  return entries.filter((team, index) => team.name && entries.findIndex(other => other.name === team.name) === index);
}

export default function ChampionRanking({ selected, ranking, loading, error, darkMode, language, onViewPlayer, competitions = [] }) {
  const [pagination, setPagination] = useState({ selected, page: 1 });
  const page = pagination.selected === selected ? pagination.page : 1;
  const setPage = page => setPagination({ selected, page });
  const contentRef = useRef(null);
  const contentHeight = useRef(0);
  // Keep the space already occupied by results while another filter loads.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const preserveHeight = () => {
      contentHeight.current = Math.max(contentHeight.current, content.getBoundingClientRect().height);
      content.style.minHeight = `${contentHeight.current}px`;
    };
    preserveHeight();
    const observer = new ResizeObserver(preserveHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  const pageSize = 10;
  const tr = (vi, en) => language === 'en' ? en : vi;
  const all = selected === 'all';
  const logo = getCompetitionLogo(selected);
  const players = ranking.map((player, index) => ({ ...player, rank: Number(player.rank) || index + 1, rowKey: player.key ?? `player-${index}` }));
  const podium = [2, 1, 3].map(rank => players.find(player => player.rank === rank));
  const pageCount = Math.max(1, Math.ceil(players.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visiblePlayers = players.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const competitionCount = all ? new Set([...competitions, ...players.flatMap(player => (player.history || []).map(item => item.competitionName))].filter(Boolean)).size : 1;
  const totalChampionships = players.reduce((total, player) => total + (Number(player.championships) || 0), 0);
  const message = loading ? tr('Đang tải bảng vinh danh...', 'Loading rankings...') : error || (players.length === 0 ? tr('Chưa có nhà vô địch cho giải đấu này.', 'No champions for this competition yet.') : '');

  return (
    <section className={`honor-board ${darkMode ? '' : 'honor-board-light'}`} aria-label={tr('Bảng vinh danh', 'Hall of champions')}>
      <header className={`honor-heading ${all ? 'honor-heading-overall' : ''}`}>
        {logo ? <img className="honor-league-logo" src={logo} alt="" /> : <Trophy className="honor-league-logo" />}
        <div>
          <h2>{all ? tr('Top nhà vô địch toàn hệ thống', 'Top system champions') : `${tr('Top nhà vô địch', 'Top champions')} ${selected}`}</h2>
          <p>{all ? tr('Những huyền thoại dẫn đầu về số lần vô địch trong tất cả các giải đấu', 'The leading champions across all competitions') : tr(`Vinh danh những huấn luyện viên vô địch ${selected} nhiều nhất trên PNH EFOOTBALL.`, `Celebrating the most successful ${selected} champions on PNH EFOOTBALL.`)}</p>
        </div>
        {logo && <img className="honor-heading-mark" src={logo} alt="" />}
      </header>
      <div ref={contentRef} className="honor-content" aria-busy={loading}>
          <div className={`honor-stage ${players.length === 1 && !message ? 'honor-stage-single' : ''}`}>
            {message ? <p className={`honor-stage-message ${error ? 'honor-error' : ''}`} role={error ? 'alert' : 'status'}>{message}</p> : podium.map((player, index) => player ? (
              <button type="button" key={player.rowKey} className={`honor-podium honor-place-${player.rank}`} onClick={() => onViewPlayer(player)}>
                {player.rank === 1 && <Crown className="honor-crown" />}
                <span className="honor-position">{player.rank}<span>❧</span></span>
                <Portrait key={player.avatarUrl} src={player.avatarUrl} name={player.name} />
                <strong className="honor-podium-name" title={player.name}>{player.name}</strong>
                <span className="honor-count">{tr('Tổng', 'Total')} {player.championships ?? 0} {tr('lần vô địch', 'titles')}</span>
                {all && <span className="honor-podium-medals">{medals(player)}</span>}
                <span className="honor-plinth" aria-hidden="true" />
              </button>
            ) : <div key={`empty-${index}`} />)}
          </div>
          <div className={`honor-table ${all ? 'honor-table-overall' : ''}`}>
            <div className="honor-table-title"><Trophy size={26} /><div><h3>{all ? tr('Bảng xếp hạng nhà vô địch toàn hệ thống', 'System champion rankings') : tr('Bảng xếp hạng nhà vô địch', 'Champion rankings')}</h3><p>{tr('Xếp hạng theo tổng số lần vô địch ở tất cả giải đấu', 'Ranked by total championships across competitions')}</p></div></div>
            <div className="honor-table-scroll" tabIndex={0} role="region" aria-label={tr('Cuộn ngang bảng xếp hạng', 'Scroll ranking horizontally')}>
            <div className="honor-table-grid">
            <div className="honor-columns honor-table-head" aria-hidden="true">
              <span>{tr('Hạng', 'Rank')}</span><span>{tr('Tên người vô địch', 'Champion')}</span><span>{all ? tr('🏆 Tổng số lần vô địch', '🏆 Championships') : tr('Các đội bóng vô địch', 'Winning clubs')}</span>
              <span>{all ? tr('Huy chương', 'Medals') : tr('Số lần vô địch', 'Titles')}</span><span>{all ? tr('Các giải đấu đã vô địch', 'Competitions won') : tr('Thời gian kết thúc', 'Finish dates')}</span><span>{tr('Thao tác', 'Action')}</span>
            </div>
            <div className="honor-table-body">
            {message ? <p className="honor-table-empty">{loading ? tr('Đang tải dữ liệu...', 'Loading data...') : error ? tr('Không thể tải bảng xếp hạng.', 'Unable to load rankings.') : tr('Thành tích sẽ xuất hiện khi giải có nhà vô địch.', 'Results will appear when this competition has a champion.')}</p> : visiblePlayers.map(player => {

              const history = historyFor(player, all);
              const clubs = clubsFor(player, history);
              const wonCompetitions = [...new Set(historyFor(player, false).map(item => item.competitionName).filter(Boolean))];
              const medalItems = <span className="honor-medal-items"><span>🥇 {player.gold ?? 0}</span><span>🥈 {player.silver ?? 0}</span><span>🥉 {player.bronze ?? 0}</span></span>;
              const years = [...new Set(history.map(item => item.endDate && new Date(item.endDate).getFullYear()).filter(year => year && Number.isFinite(year)))];
              return <div key={player.rowKey} className={`honor-player honor-row-place-${player.rank}`}>
                <button type="button" className="honor-columns honor-player-button" aria-label={`${tr('Xem chi tiết', 'View details')}: ${player.name}`} onClick={() => onViewPlayer(player)}>
                  <span className="honor-row-rank">{player.rank}{player.rank === 1 && <Crown size={13} />}</span>
                  <span className="honor-player-name"><Portrait key={player.avatarUrl} src={player.avatarUrl} name={player.name} /><strong>{player.name}</strong></span>
                  {all ? <span className="honor-row-count">🥇 {player.championships ?? 0}</span> : <span className="honor-row-clubs">{clubs.slice(0, 3).map(team => <Portrait key={`${team.name}-${team.logoUrl}`} src={team.logoUrl} name={team.name} club />)}{clubs.length > 3 && <small>+{clubs.length - 3}</small>}</span>}
                  {all ? medalItems : <span className="honor-row-count">{player.championships ?? 0}<span> {tr('lần vô địch', 'titles')}</span></span>}
                  {all ? <span className="honor-row-competitions">{wonCompetitions.map(name => <span key={name} title={name}>{getCompetitionLogo(name) ? <img src={getCompetitionLogo(name)} alt={name} loading="lazy" /> : <Trophy size={18} aria-label={name} />}</span>)}{!wonCompetitions.length && '—'}</span> : <span className="honor-row-years">{years.join(', ') || '—'}</span>}
                  <span className="honor-expand">{tr('Xem chi tiết', 'View details')}<ChevronDown size={13} /></span>
                </button>
              </div>;
            })}
            </div>
            </div>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 text-xs" aria-label={tr('Phân trang BXH', 'Ranking pages')}>
            <span>{tr('Trang', 'Page')} {currentPage}/{pageCount} · {players.length} {tr('người', 'players')}</span>
            <div className="flex gap-2">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-500/40 px-3 py-2 disabled:opacity-40">{tr('Trước', 'Previous')}</button>
              <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-500/40 px-3 py-2 disabled:opacity-40">{tr('Tiếp', 'Next')}</button>
            </div>
          </nav>
          <div className="honor-stats">
            {[[<Users size={34} />, tr('Tổng số nhà vô địch', 'Total champions'), players.filter(player => Number(player.championships) > 0).length], [<Trophy size={34} />, tr('Tổng số giải đấu', 'Total competitions'), competitionCount], [<Medal size={34} />, tr('Tổng số chức vô địch', 'Total championships'), totalChampionships]].map(([icon, label, value]) => <div className="honor-stat" key={label}>{icon}<div><span>{label}</span><strong>{value.toLocaleString(language === 'en' ? 'en-US' : 'vi-VN')}</strong></div></div>)}
          </div>
        </div>
    </section>
  );
}

