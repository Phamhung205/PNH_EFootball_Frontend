import React, { useState } from 'react';
import { Trophy, Crown } from 'lucide-react';

/*
  KnockoutBracket — Sơ đồ loại trực tiếp 2 nhánh đối xứng (kiểu "Road to Final").
  Hỗ trợ 4 / 8 / 16 đội. Đội chia 2 nửa dồn vào giữa, vòng trong cùng là Chung Kết.
  Có ô nhập tỉ số; nhập xong đội thắng tự đẩy sang vòng kế. Có đường nối giữa các vòng.

  PROPS:
    teams          : [{ id, name, logo }] — danh sách đội (lấy top N)
    tournamentName : tên giải hiển thị
    isAdmin        : cho nhập tỉ số hay không
    onSaveMatch    : (match) => void — lưu 1 trận (nối backend sau)
*/

const pow2Floor = (n) => { let p = 1; while (p * 2 <= n) p *= 2; return p; };

// Nhãn vòng theo số đội tham gia vòng đó (trước khi đá)
const roundName = (teamsInRound) => {
  if (teamsInRound === 2) return 'Chung Kết';
  if (teamsInRound === 4) return 'Bán Kết';
  if (teamsInRound === 8) return 'Tứ Kết';
  if (teamsInRound === 16) return 'Vòng 1/8';
  if (teamsInRound === 32) return 'Vòng 1/16';
  return `Vòng 1/${teamsInRound / 2}`;
};

export default function KnockoutBracket({
  teams = DEMO_TEAMS,
  tournamentName = 'UEFA CHAMPIONS LEAGUE 26',
  isAdmin = true,
  onSaveMatch,
}) {
  const size = Math.max(2, pow2Floor(teams.length || 16));
  const bracketTeams = teams.slice(0, size);
  const [rounds, setRounds] = useState(() => buildRounds(bracketTeams, size));

  const handleScore = (rIdx, mIdx, slot, val) => {
    setRounds(prev => {
      const next = prev.map(r => r.map(m => ({ ...m })));
      const m = next[rIdx][mIdx];
      if (slot === 'home') m.homeScore = val; else m.awayScore = val;

      const decided = m.homeScore != null && m.awayScore != null && m.homeScore !== m.awayScore;
      const winner = decided ? (m.homeScore > m.awayScore ? m.home : m.away) : null;

      // Đẩy đội thắng sang vòng sau (vị trí = mIdx/2, slot theo chẵn/lẻ)
      if (next[rIdx + 1]) {
        const nIdx = Math.floor(mIdx / 2);
        if (mIdx % 2 === 0) next[rIdx + 1][nIdx].home = winner;
        else next[rIdx + 1][nIdx].away = winner;
        // Nếu đổi kết quả làm mất đội đã đẩy, xoá kết quả vòng sau (tránh sai lệch)
        next[rIdx + 1][nIdx].homeScore = next[rIdx + 1][nIdx].homeScore;
      }
      if (onSaveMatch) onSaveMatch(m);
      return next;
    });
  };

  const numRounds = rounds.length;
  const finalMatch = rounds[numRounds - 1][0];
  const champion = winnerOf(finalMatch);

  // Vòng để bày 2 bên (tất cả trừ chung kết)
  const sideRounds = rounds.slice(0, numRounds - 1);

  // Mỗi vòng chia đôi: nửa đầu -> nhánh trái, nửa sau -> nhánh phải
  const leftOf = (matches) => matches.slice(0, Math.ceil(matches.length / 2));
  const rightOf = (matches) => matches.slice(Math.ceil(matches.length / 2));

  return (
    <div
      id="knockout-bracket"
      className="rounded-3xl p-5 md:p-8 relative overflow-x-auto"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #16285f 0%, #0a1530 72%)' }}
    >
      {/* Tiêu đề */}
      <div className="text-center mb-7 relative z-10">
        <div className="text-[11px] md:text-[12px] tracking-[7px] text-blue-300/70 font-semibold">ROAD TO FINAL</div>
        <div className="text-xl md:text-3xl font-black text-white tracking-wide mt-1"
          style={{ textShadow: '0 2px 20px rgba(125,162,232,.5)' }}>
          {tournamentName}
        </div>
      </div>

      {/* Bracket */}
      <div className="flex items-stretch justify-center gap-2 md:gap-4 min-w-[920px] relative z-10">
        {/* NHÁNH TRÁI: vòng đầu -> trong */}
        {sideRounds.map((matches, rIdx) => (
          <div key={`L${rIdx}`} className="flex flex-col flex-1 min-w-[150px]">
            <div className="text-center text-[10px] font-black tracking-widest text-blue-300/60 mb-2">
              {roundName(matches.length * 2)}
            </div>
            <div className="flex flex-col justify-around flex-1 gap-2">
              {leftOf(matches).map((m, i) => (
                <Pair key={m.id} match={m} side="left" isAdmin={isAdmin} hasNext={rIdx < sideRounds.length}
                  onScore={(slot, v) => handleScore(rIdx, i, slot, v)} />
              ))}
            </div>
          </div>
        ))}

        {/* GIỮA: Chung kết + cúp */}
        <div className="flex flex-col items-center justify-center gap-3 px-2 min-w-[160px]">
          <div className="text-[11px] font-black tracking-[2px] text-amber-300/90">CHUNG KẾT</div>
          <div className="w-full"><Pair match={finalMatch} side="left" isAdmin={isAdmin} hasNext={false} isFinal
            onScore={(slot, v) => handleScore(numRounds - 1, 0, slot, v)} /></div>
          <Trophy size={58} className="text-amber-300 mt-1"
            style={{ filter: 'drop-shadow(0 4px 24px rgba(251,191,36,.5))' }} />
          <div className="w-[100px] h-[60px] rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgba(56,189,248,.4)] px-1"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0e7490)' }}>
            {champion
              ? <span className="text-[12px] font-black text-white text-center leading-tight">{champion.name}</span>
              : <Crown size={26} className="text-white/90" />}
          </div>
          <div className="text-[10px] text-blue-300/60 font-bold tracking-wide">NHÀ VÔ ĐỊCH</div>
        </div>

        {/* NHÁNH PHẢI: vòng trong -> đầu (đảo) */}
        {[...sideRounds].reverse().map((matches, revIdx) => {
          const rIdx = sideRounds.length - 1 - revIdx;
          const startIdx = Math.ceil(matches.length / 2);
          return (
            <div key={`R${rIdx}`} className="flex flex-col flex-1 min-w-[150px]">
              <div className="text-center text-[10px] font-black tracking-widest text-blue-300/60 mb-2">
                {roundName(matches.length * 2)}
              </div>
              <div className="flex flex-col justify-around flex-1 gap-2">
                {rightOf(matches).map((m, i) => (
                  <Pair key={m.id} match={m} side="right" isAdmin={isAdmin} hasNext={rIdx < sideRounds.length}
                    onScore={(slot, v) => handleScore(rIdx, startIdx + i, slot, v)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-6 text-[11px] tracking-[3px] text-blue-400/50 font-bold relative z-10">
        SƠ ĐỒ LOẠI TRỰC TIẾP · PNH FOOTBALL
      </div>
    </div>
  );
}

// ─── 1 cặp đấu: 2 đội + ô tỉ số, kèm đường nối ───
function Pair({ match, side, isAdmin, onScore, hasNext, isFinal }) {
  const homeWin = winnerOf(match) && winnerOf(match).id === match.home?.id;
  const awayWin = winnerOf(match) && winnerOf(match).id === match.away?.id;
  const canEdit = isAdmin && match.home && match.away;

  return (
    <div className={`relative flex flex-col gap-1 ${side === 'left' ? 'pr-4' : 'pl-4'} ${!isFinal ? 'connector-' + side : ''}`}>
      <Row team={match.home} side={side} win={homeWin} score={match.homeScore} canEdit={canEdit}
        onScore={(v) => onScore('home', v)} />
      <Row team={match.away} side={side} win={awayWin} score={match.awayScore} canEdit={canEdit}
        onScore={(v) => onScore('away', v)} />
    </div>
  );
}

// 1 hàng = 1 đội + ô điểm
function Row({ team, side, win, score, canEdit, onScore }) {
  const empty = !team;
  const card = (
    <div className={[
      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border min-h-[38px] flex-1 transition-all',
      side === 'right' ? 'flex-row-reverse text-right' : '',
      empty ? 'border-dashed border-blue-400/20 bg-blue-950/30'
            : win ? 'border-cyan-400/70 bg-gradient-to-r from-cyan-600/40 to-blue-900/40 shadow-[0_0_12px_rgba(56,189,248,.3)]'
                  : 'border-blue-400/25 bg-gradient-to-r from-blue-800/50 to-blue-950/50',
    ].join(' ')}>
      <div className="w-5 h-5 rounded-full bg-blue-800 flex items-center justify-center shrink-0 overflow-hidden text-[11px]">
        {empty ? '' : (team.logo && (team.logo.startsWith('http') || team.logo.startsWith('data:'))
          ? <img src={team.logo} alt="" className="w-full h-full object-cover" />
          : (team.logo || team.name?.[0] || '?'))}
      </div>
      <span className={`text-[12px] font-bold truncate ${empty ? 'text-blue-400/40' : 'text-blue-50'}`}>
        {empty ? '—' : team.name}
      </span>
    </div>
  );
  const box = canEdit ? (
    <input type="number" min="0" max="99" value={score != null ? score : ''}
      onChange={(e) => onScore(e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0))}
      className="w-7 h-[38px] shrink-0 rounded-md bg-blue-950/80 border border-cyan-400/40 text-center text-[13px] font-black text-cyan-200 outline-none focus:border-cyan-400" />
  ) : (
    <div className="w-7 h-[38px] shrink-0 rounded-md bg-blue-950/60 border border-blue-400/20 flex items-center justify-center text-[13px] font-black text-cyan-300">
      {score != null ? score : '·'}
    </div>
  );

  return (
    <div className={`flex items-center gap-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      {card}{box}
    </div>
  );
}

// Xác định đội thắng 1 trận (hoặc null)
function winnerOf(m) {
  if (!m || m.homeScore == null || m.awayScore == null || m.homeScore === m.awayScore) return null;
  return m.homeScore > m.awayScore ? m.home : m.away;
}

// Dựng cây bracket rỗng từ danh sách đội
function buildRounds(teams, size) {
  const rounds = [];
  const first = [];
  for (let i = 0; i < size; i += 2) {
    first.push({ id: `r0-m${i / 2}`, home: teams[i] || null, away: teams[i + 1] || null, homeScore: null, awayScore: null });
  }
  rounds.push(first);
  let count = first.length, r = 1;
  while (count > 1) {
    count = Math.floor(count / 2);
    const round = [];
    for (let i = 0; i < count; i++) round.push({ id: `r${r}-m${i}`, home: null, away: null, homeScore: null, awayScore: null });
    rounds.push(round); r++;
  }
  return rounds;
}

// Dữ liệu mẫu 16 đội (giống ảnh Champions League)
const DEMO_TEAMS = [
  { id: 1, name: 'Paris SG', logo: '🔴' }, { id: 2, name: 'Chelsea', logo: '🔵' },
  { id: 3, name: 'Galatasaray', logo: '🟠' }, { id: 4, name: 'Liverpool', logo: '🔴' },
  { id: 5, name: 'Real Madrid', logo: '⚪' }, { id: 6, name: 'Man City', logo: '🔵' },
  { id: 7, name: 'Atalanta', logo: '🔵' }, { id: 8, name: 'Bayern', logo: '🔴' },
  { id: 9, name: 'Newcastle', logo: '⚫' }, { id: 10, name: 'Barcelona', logo: '🔵' },
  { id: 11, name: 'Atletico', logo: '🔴' }, { id: 12, name: 'Tottenham', logo: '⚪' },
  { id: 13, name: 'Bodo/Glimt', logo: '🟡' }, { id: 14, name: 'Sporting', logo: '🟢' },
  { id: 15, name: 'Leverkusen', logo: '🔴' }, { id: 16, name: 'Arsenal', logo: '🔴' },
];