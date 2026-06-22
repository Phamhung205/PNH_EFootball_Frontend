import { useState, useRef } from "react";
 
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap');`;
 
const css = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       #0a0e1a;
    --surface:  #111827;
    --surface2: #1a2236;
    --border:   #1f2d45;
    --lime:     #c6f135;
    --lime2:    #9ecc1e;
    --text:     #e8edf5;
    --muted:    #6b7a99;
    --red:      #ff4d5e;
    --gold:     #f5c518;
  }
  html, body { background: var(--bg); color: var(--text); font-family: 'Barlow', sans-serif; }
 
  .app {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 40% at 50% -10%, rgba(198,241,53,0.08) 0%, transparent 70%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(31,45,69,0.4) 39px, rgba(31,45,69,0.4) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(31,45,69,0.2) 39px, rgba(31,45,69,0.2) 40px);
  }
 
  /* HEADER */
  .header {
    border-bottom: 2px solid var(--border);
    padding: 0 32px;
    background: rgba(10,14,26,0.95);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
    height: 64px;
  }
  .header-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; letter-spacing: 2px; color: var(--lime);
    user-select: none;
  }
  .header-logo .icon { font-size: 28px; }
  .header-badge {
    background: var(--lime); color: var(--bg);
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 11px; letter-spacing: 1.5px;
    padding: 3px 10px; border-radius: 2px; text-transform: uppercase;
  }
  .season-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; color: var(--muted); letter-spacing: 1px;
  }
 
  /* NAV TABS */
  .nav {
    display: flex; gap: 4px;
    padding: 0 32px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted);
    padding: 14px 20px;
    border-bottom: 3px solid transparent;
    margin-bottom: -1px;
    transition: color .2s, border-color .2s;
    display: flex; align-items: center; gap: 8px;
  }
  .nav-btn:hover { color: var(--text); }
  .nav-btn.active { color: var(--lime); border-bottom-color: var(--lime); }
  .nav-count {
    background: var(--border); color: var(--muted);
    font-size: 11px; padding: 1px 7px; border-radius: 10px;
  }
  .nav-btn.active .nav-count { background: rgba(198,241,53,0.15); color: var(--lime); }
 
  /* MAIN */
  .main { max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; }
 
  /* SECTION TITLE */
  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px; letter-spacing: 3px; color: var(--text);
    display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
  }
  .section-title span { color: var(--lime); }
  .title-line { flex: 1; height: 1px; background: linear-gradient(90deg, var(--border), transparent); }
 
  /* FORM CARD */
  .form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-top: 3px solid var(--lime);
    border-radius: 0 0 8px 8px;
    padding: 36px;
    display: grid; grid-template-columns: auto 1fr; gap: 40px;
    align-items: start;
  }
  @media (max-width: 600px) { .form-card { grid-template-columns: 1fr; } }
 
  /* LOGO UPLOAD */
  .logo-upload-area {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .logo-preview {
    width: 120px; height: 120px; border-radius: 8px;
    border: 2px dashed var(--border);
    background: var(--surface2);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; overflow: hidden;
    transition: border-color .2s, background .2s;
    position: relative;
  }
  .logo-preview:hover { border-color: var(--lime); background: rgba(198,241,53,0.05); }
  .logo-preview img { width: 100%; height: 100%; object-fit: contain; }
  .logo-preview .placeholder { font-size: 38px; color: var(--muted); }
  .logo-preview .overlay {
    position: absolute; inset: 0; background: rgba(10,14,26,0.7);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .2s;
    font-size: 11px; color: var(--lime); letter-spacing: 1px;
    font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  }
  .logo-preview:hover .overlay { opacity: 1; }
  .logo-hint { font-size: 11px; color: var(--muted); text-align: center; line-height: 1.5; }
 
  /* FORM FIELDS */
  .form-fields { display: flex; flex-direction: column; gap: 20px; }
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
  }
  .field-input {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); font-family: 'Barlow', sans-serif; font-size: 15px;
    padding: 11px 16px; border-radius: 6px; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .field-input:focus { border-color: var(--lime); box-shadow: 0 0 0 3px rgba(198,241,53,0.1); }
  .field-input::placeholder { color: var(--muted); }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
 
  .btn-submit {
    background: var(--lime); color: var(--bg);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: 2px;
    border: none; cursor: pointer;
    padding: 13px 36px; border-radius: 6px;
    transition: background .2s, transform .1s, box-shadow .2s;
    align-self: flex-start;
    box-shadow: 0 4px 20px rgba(198,241,53,0.25);
  }
  .btn-submit:hover { background: var(--lime2); box-shadow: 0 6px 28px rgba(198,241,53,0.4); }
  .btn-submit:active { transform: scale(0.98); }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
 
  /* TOAST */
  .toast {
    position: fixed; bottom: 32px; right: 32px; z-index: 9999;
    background: var(--lime); color: var(--bg);
    font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
    font-size: 15px; letter-spacing: 0.5px;
    padding: 14px 24px; border-radius: 6px;
    box-shadow: 0 8px 32px rgba(198,241,53,0.4);
    animation: slideUp .3s ease;
    display: flex; align-items: center; gap: 10px;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
 
  /* TEAMS GRID */
  .teams-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
    margin-top: 32px;
  }
  .team-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 20px 16px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    transition: border-color .2s, transform .2s;
    animation: fadeIn .4s ease;
  }
  .team-card:hover { border-color: rgba(198,241,53,0.4); transform: translateY(-2px); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .team-card-logo {
    width: 60px; height: 60px; border-radius: 50%;
    background: var(--surface2); border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; overflow: hidden;
  }
  .team-card-logo img { width: 100%; height: 100%; object-fit: contain; }
  .team-card-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 700; color: var(--text);
  }
  .team-card-city { font-size: 12px; color: var(--muted); }
  .btn-remove {
    background: none; border: 1px solid var(--border); border-radius: 4px;
    color: var(--muted); font-size: 11px; font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 4px 12px; cursor: pointer; transition: all .2s;
    margin-top: 4px;
  }
  .btn-remove:hover { border-color: var(--red); color: var(--red); }
 
  /* MATCHES */
  .matches-filters {
    display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .filter-btn {
    background: var(--surface); border: 1px solid var(--border);
    color: var(--muted); font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 7px 16px; border-radius: 4px; cursor: pointer; transition: all .2s;
  }
  .filter-btn:hover { color: var(--text); border-color: var(--text); }
  .filter-btn.active { background: var(--lime); color: var(--bg); border-color: var(--lime); }
 
  .match-day-group { margin-bottom: 32px; }
  .match-day-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 2px; color: var(--muted);
    text-transform: uppercase; margin-bottom: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .match-day-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
 
  .match-row {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 0 20px;
    display: grid; grid-template-columns: 1fr auto 1fr;
    align-items: center; gap: 16px; margin-bottom: 10px;
    min-height: 72px; transition: border-color .2s;
  }
  .match-row:hover { border-color: var(--border); }
  .match-row.live { border-left: 3px solid var(--lime); }
  .match-row.finished { opacity: 0.8; }
 
  .match-team { display: flex; align-items: center; gap: 12px; }
  .match-team.away { flex-direction: row-reverse; }
  .match-team-logo {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--surface2); display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0; overflow: hidden;
    border: 1px solid var(--border);
  }
  .match-team-logo img { width: 100%; height: 100%; object-fit: contain; }
  .match-team-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 700; color: var(--text);
  }
  .match-team.away .match-team-name { text-align: right; }
 
  .match-center { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .match-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; letter-spacing: 4px; color: var(--text);
  }
  .match-time {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--muted);
  }
  .match-status-badge {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 2px 8px; border-radius: 2px;
  }
  .badge-live { background: rgba(198,241,53,0.15); color: var(--lime); }
  .badge-finished { background: rgba(107,122,153,0.2); color: var(--muted); }
  .badge-upcoming { background: rgba(245,197,24,0.15); color: var(--gold); }
 
  .empty-state {
    text-align: center; padding: 60px 20px;
    color: var(--muted); font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; letter-spacing: 0.5px;
  }
  .empty-state .icon { font-size: 48px; display: block; margin-bottom: 12px; }
 
  /* STANDINGS TABLE */
  .standings-table { width: 100%; border-collapse: collapse; }
  .standings-table thead tr {
    background: var(--surface2);
    border-bottom: 2px solid var(--lime);
  }
  .standings-table th {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted); padding: 12px 16px; text-align: center;
  }
  .standings-table th:nth-child(2) { text-align: left; }
  .standings-table td { padding: 14px 16px; text-align: center; border-bottom: 1px solid var(--border); }
  .standings-table tbody tr { transition: background .15s; }
  .standings-table tbody tr:hover { background: rgba(255,255,255,0.02); }
  .standings-table tbody tr.top3 { background: rgba(198,241,53,0.03); }
  .standings-table tbody tr:last-child td { border-bottom: none; }
 
  .rank-num {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px;
    width: 28px; display: inline-block; text-align: center;
  }
  .rank-1 { color: var(--gold); }
  .rank-2 { color: #c0c8d8; }
  .rank-3 { color: #cd7f32; }
  .rank-other { color: var(--muted); font-size: 14px; }
 
  .std-team { display: flex; align-items: center; gap: 12px; text-align: left; }
  .std-team-logo {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--surface2); display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0; overflow: hidden; border: 1px solid var(--border);
  }
  .std-team-logo img { width: 100%; height: 100%; object-fit: contain; }
  .std-team-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 700; color: var(--text);
  }
  .std-pts {
    font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--lime);
  }
  .std-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px; font-weight: 600; color: var(--text);
  }
  .std-num.muted { color: var(--muted); }
  .std-gd { font-weight: 700; }
  .std-gd.pos { color: var(--lime); }
  .std-gd.neg { color: var(--red); }
 
  .form-dots { display: flex; gap: 3px; justify-content: center; }
  .form-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .dot-W { background: var(--lime); }
  .dot-D { background: var(--gold); }
  .dot-L { background: var(--red); }
 
  .table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; overflow: hidden;
  }
  .table-header {
    padding: 16px 20px; background: var(--surface2);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .table-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted);
  }
  .table-season { font-size: 13px; color: var(--lime); font-family: 'Barlow Condensed', sans-serif; font-weight: 700; }
 
  /* ADD MATCH MODAL */
  .add-match-btn {
    background: none; border: 2px dashed var(--border);
    color: var(--muted); font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: 1px;
    padding: 12px 24px; border-radius: 6px; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: all .2s; margin-bottom: 28px;
  }
  .add-match-btn:hover { border-color: var(--lime); color: var(--lime); }
 
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,14,26,0.85); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border);
    border-top: 3px solid var(--lime);
    border-radius: 0 0 8px 8px;
    padding: 32px; width: 100%; max-width: 520px;
    animation: fadeIn .25s ease;
  }
  .modal-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; letter-spacing: 2px; margin-bottom: 24px;
  }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
  .btn-cancel {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--muted); font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 1.5px;
    padding: 11px 24px; border-radius: 6px; cursor: pointer;
    transition: all .2s; flex: 1;
  }
  .btn-cancel:hover { color: var(--text); border-color: var(--text); }
  .btn-confirm { flex: 2; }
 
  select.field-input { appearance: none; }
`;
 
// ── Sample data ──────────────────────────────────────────────
const INITIAL_TEAMS = [
  { id: 1, name: "Hà Nội FC",   city: "Hà Nội",    logo: null, emoji: "🔵" },
  { id: 2, name: "Viettel FC",  city: "Hà Nội",    logo: null, emoji: "🔴" },
  { id: 3, name: "HAGL",        city: "Gia Lai",   logo: null, emoji: "🟡" },
  { id: 4, name: "Hải Phòng",   city: "Hải Phòng", logo: null, emoji: "🟢" },
  { id: 5, name: "Bình Dương",  city: "Bình Dương",logo: null, emoji: "🟠" },
  { id: 6, name: "Nam Định",    city: "Nam Định",  logo: null, emoji: "⚪" },
];
 
const INITIAL_MATCHES = [
  { id: 1, home: 1, away: 2, homeScore: 2, awayScore: 1, date: "2025-03-08", time: "19:00", status: "finished", round: 1 },
  { id: 2, home: 3, away: 4, homeScore: 0, awayScore: 0, date: "2025-03-08", time: "19:15", status: "finished", round: 1 },
  { id: 3, home: 5, away: 6, homeScore: 3, awayScore: 2, date: "2025-03-09", time: "17:00", status: "finished", round: 1 },
  { id: 4, home: 2, away: 3, homeScore: 1, awayScore: 1, date: "2025-03-15", time: "19:00", status: "finished", round: 2 },
  { id: 5, home: 4, away: 5, homeScore: 2, awayScore: 0, date: "2025-03-15", time: "19:15", status: "finished", round: 2 },
  { id: 6, home: 6, away: 1, homeScore: 0, awayScore: 2, date: "2025-03-16", time: "17:00", status: "finished", round: 2 },
  { id: 7, home: 1, away: 3, homeScore: null, awayScore: null, date: "2025-03-22", time: "19:00", status: "upcoming", round: 3 },
  { id: 8, home: 2, away: 4, homeScore: null, awayScore: null, date: "2025-03-22", time: "19:15", status: "upcoming", round: 3 },
  { id: 9, home: 5, away: 1, homeScore: null, awayScore: null, date: "2025-03-23", time: "17:00", status: "upcoming", round: 3 },
];
 
function calcStandings(teams, matches) {
  const map = {};
  teams.forEach(t => {
    map[t.id] = { teamId: t.id, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0, form: [] };
  });
  matches.filter(m => m.status === "finished").forEach(m => {
    if (!map[m.home] || !map[m.away]) return;
    const h = map[m.home], a = map[m.away];
    h.P++; a.P++;
    h.GF += m.homeScore; h.GA += m.awayScore;
    a.GF += m.awayScore; a.GA += m.homeScore;
    if (m.homeScore > m.awayScore) {
      h.W++; h.Pts += 3; a.L++;
      h.form.push("W"); a.form.push("L");
    } else if (m.homeScore === m.awayScore) {
      h.D++; h.Pts++; a.D++; a.Pts++;
      h.form.push("D"); a.form.push("D");
    } else {
      a.W++; a.Pts += 3; h.L++;
      a.form.push("W"); h.form.push("L");
    }
  });
  return Object.values(map).sort((a, b) =>
    b.Pts - a.Pts || (b.GF - b.GA) - (a.GF - a.GA) || b.GF - a.GF
  );
}
 
const groupByDate = (matches) => {
  const g = {};
  matches.forEach(m => {
    if (!g[m.date]) g[m.date] = [];
    g[m.date].push(m);
  });
  return g;
};
 
const fmtDate = (d) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
};
 
export default function App() {
  const [tab, setTab] = useState("teams");
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all");
 
  // Team form
  const [teamName, setTeamName] = useState("");
  const [teamCity, setTeamCity] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileRef = useRef();
 
  // Match modal
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [mHome, setMHome] = useState("");
  const [mAway, setMAway] = useState("");
  const [mDate, setMDate] = useState("");
  const [mTime, setMTime] = useState("19:00");
  const [mHomeScore, setMHomeScore] = useState("");
  const [mAwayScore, setMAwaySCore] = useState("");
  const [mStatus, setMStatus] = useState("upcoming");
 
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };
 
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
 
  const handleAddTeam = () => {
    if (!teamName.trim()) return;
    const emojis = ["🔵","🔴","🟡","🟢","🟠","⚪","🟣","🟤","🏆","⚽"];
    const newTeam = {
      id: Date.now(),
      name: teamName.trim(),
      city: teamCity.trim() || "—",
      logo: logoPreview,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    };
    setTeams(prev => [...prev, newTeam]);
    setTeamName(""); setTeamCity(""); setLogoPreview(null); setLogoFile(null);
    showToast(`✅ Đã thêm đội ${newTeam.name}`);
  };
 
  const handleRemoveTeam = (id) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    setMatches(prev => prev.filter(m => m.home !== id && m.away !== id));
    showToast("🗑️ Đã xóa đội bóng");
  };
 
  const handleAddMatch = () => {
    if (!mHome || !mAway || !mDate || mHome === mAway) return;
    const newMatch = {
      id: Date.now(),
      home: parseInt(mHome),
      away: parseInt(mAway),
      homeScore: mStatus !== "upcoming" ? parseInt(mHomeScore) || 0 : null,
      awayScore: mStatus !== "upcoming" ? parseInt(mAwayScore) || 0 : null,
      date: mDate, time: mTime, status: mStatus,
      round: Math.max(...matches.map(m => m.round || 0), 0) + 1,
    };
    setMatches(prev => [...prev, newMatch]);
    setShowMatchModal(false);
    setMHome(""); setMAway(""); setMDate(""); setMTime("19:00");
    setMHomeScore(""); setMAwaySCore(""); setMStatus("upcoming");
    showToast("⚽ Đã thêm trận đấu mới");
  };
 
  const getTeam = (id) => teams.find(t => t.id === id);
  const standings = calcStandings(teams, matches);
 
  const filteredMatches = filter === "all" ? matches
    : matches.filter(m => m.status === filter);
  const grouped = groupByDate(filteredMatches);
  const sortedDates = Object.keys(grouped).sort();
 
  const TeamLogo = ({ team, size = 38 }) => (
    <div className="match-team-logo" style={{ width: size, height: size }}>
      {team?.logo
        ? <img src={team.logo} alt={team.name} />
        : <span style={{ fontSize: size * 0.55 }}>{team?.emoji || "⚽"}</span>
      }
    </div>
  );
 
  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* HEADER */}
        <header className="header">
          <div className="header-logo">
            <span className="icon">⚽</span>
            <span>LEAGUE <span style={{ color: "#fff" }}>MANAGER</span></span>
          </div>
          <span className="header-badge">V.League 2025</span>
          <span className="season-label">Mùa giải 2024–2025</span>
        </header>
 
        {/* NAV */}
        <nav className="nav">
          {[
            { id: "teams",    label: "Đội Bóng",      icon: "🛡️", count: teams.length },
            { id: "matches",  label: "Lịch Thi Đấu",  icon: "📅", count: matches.length },
            { id: "standing", label: "Bảng Xếp Hạng", icon: "🏆", count: null },
          ].map(n => (
            <button key={n.id} className={`nav-btn${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
              {n.icon} {n.label}
              {n.count !== null && <span className="nav-count">{n.count}</span>}
            </button>
          ))}
        </nav>
 
        <main className="main">
 
          {/* ── TAB: TEAMS ──────────────────────────── */}
          {tab === "teams" && (
            <>
              <div className="section-title">
                <span>THÊM</span> ĐỘI BÓNG <div className="title-line" />
              </div>
 
              <div className="form-card">
                {/* Logo */}
                <div className="logo-upload-area">
                  <div className="logo-preview" onClick={() => fileRef.current.click()}>
                    {logoPreview
                      ? <img src={logoPreview} alt="logo" />
                      : <span className="placeholder">🏟️</span>
                    }
                    <div className="overlay">📷<br />ĐỔI LOGO</div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                  <p className="logo-hint">PNG / JPG / SVG<br />Tối đa 2MB</p>
                </div>
 
                {/* Fields */}
                <div className="form-fields">
                  <div className="field-group">
                    <label className="field-label">Tên đội bóng *</label>
                    <input
                      className="field-input"
                      placeholder="VD: Hoàng Anh Gia Lai"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddTeam()}
                    />
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label className="field-label">Thành phố</label>
                      <input
                        className="field-input"
                        placeholder="VD: Gia Lai"
                        value={teamCity}
                        onChange={e => setTeamCity(e.target.value)}
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Mùa giải</label>
                      <input className="field-input" value="2024–2025" readOnly style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                  <button
                    className="btn-submit"
                    onClick={handleAddTeam}
                    disabled={!teamName.trim()}
                  >
                    + THÊM ĐỘI
                  </button>
                </div>
              </div>
 
              {/* Teams grid */}
              {teams.length > 0 && (
                <>
                  <div style={{ marginTop: 40, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase" }}>
                      {teams.length} đội tham dự
                    </span>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>
                  <div className="teams-grid">
                    {teams.map(t => (
                      <div key={t.id} className="team-card">
                        <div className="team-card-logo">
                          {t.logo ? <img src={t.logo} alt={t.name} /> : <span>{t.emoji}</span>}
                        </div>
                        <div className="team-card-name">{t.name}</div>
                        <div className="team-card-city">📍 {t.city}</div>
                        <button className="btn-remove" onClick={() => handleRemoveTeam(t.id)}>Xóa</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
 
          {/* ── TAB: MATCHES ────────────────────────── */}
          {tab === "matches" && (
            <>
              <div className="section-title">
                <span>LỊCH</span> THI ĐẤU <div className="title-line" />
              </div>
 
              <button className="add-match-btn" onClick={() => setShowMatchModal(true)}>
                ＋ Thêm trận đấu mới
              </button>
 
              {/* Filters */}
              <div className="matches-filters">
                {[["all","Tất cả"],["upcoming","Sắp diễn ra"],["live","Đang diễn ra"],["finished","Đã kết thúc"]].map(([v,l]) => (
                  <button key={v} className={`filter-btn${filter === v ? " active" : ""}`} onClick={() => setFilter(v)}>{l}</button>
                ))}
              </div>
 
              {sortedDates.length === 0
                ? <div className="empty-state"><span className="icon">📅</span>Chưa có trận đấu nào</div>
                : sortedDates.map(date => (
                  <div key={date} className="match-day-group">
                    <div className="match-day-label">
                      {fmtDate(date)}
                    </div>
                    {grouped[date].map(m => {
                      const home = getTeam(m.home);
                      const away = getTeam(m.away);
                      if (!home || !away) return null;
                      return (
                        <div key={m.id} className={`match-row ${m.status}`}>
                          <div className="match-team">
                            <TeamLogo team={home} />
                            <span className="match-team-name">{home.name}</span>
                          </div>
                          <div className="match-center">
                            {m.status === "finished"
                              ? <div className="match-score">{m.homeScore} – {m.awayScore}</div>
                              : m.status === "live"
                              ? <div className="match-score" style={{ color: "var(--lime)" }}>LIVE</div>
                              : <div className="match-score" style={{ color: "var(--muted)", fontSize: 20 }}>{m.time}</div>
                            }
                            <span className={`match-status-badge badge-${m.status}`}>
                              {m.status === "finished" ? "KT" : m.status === "live" ? "● LIVE" : "Vòng " + m.round}
                            </span>
                          </div>
                          <div className="match-team away">
                            <TeamLogo team={away} />
                            <span className="match-team-name">{away.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              }
            </>
          )}
 
          {/* ── TAB: STANDINGS ──────────────────────── */}
          {tab === "standing" && (
            <>
              <div className="section-title">
                <span>BẢNG</span> XẾP HẠNG <div className="title-line" />
              </div>
 
              <div className="table-wrap">
                <div className="table-header">
                  <span className="table-title">V.League 1 · Mùa 2024–2025</span>
                  <span className="table-season">{standings.filter(s => s.P > 0).length} / {teams.length} đội đã thi đấu</span>
                </div>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>#</th>
                      <th>Đội bóng</th>
                      <th>ST</th>
                      <th>T</th>
                      <th>H</th>
                      <th>B</th>
                      <th>BT</th>
                      <th>BB</th>
                      <th>HS</th>
                      <th>Điểm</th>
                      <th>Phong độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => {
                      const team = getTeam(s.teamId);
                      if (!team) return null;
                      const gd = s.GF - s.GA;
                      const rank = i + 1;
                      const recentForm = s.form.slice(-5);
                      return (
                        <tr key={s.teamId} className={rank <= 3 ? "top3" : ""}>
                          <td>
                            <span className={`rank-num ${rank <= 3 ? `rank-${rank}` : "rank-other"}`}>
                              {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank}
                            </span>
                          </td>
                          <td>
                            <div className="std-team">
                              <div className="std-team-logo">
                                {team.logo ? <img src={team.logo} alt={team.name} /> : <span style={{ fontSize: 18 }}>{team.emoji}</span>}
                              </div>
                              <span className="std-team-name">{team.name}</span>
                            </div>
                          </td>
                          <td><span className="std-num muted">{s.P}</span></td>
                          <td><span className="std-num" style={{ color: "var(--lime)" }}>{s.W}</span></td>
                          <td><span className="std-num" style={{ color: "var(--gold)" }}>{s.D}</span></td>
                          <td><span className="std-num" style={{ color: "var(--red)" }}>{s.L}</span></td>
                          <td><span className="std-num">{s.GF}</span></td>
                          <td><span className="std-num">{s.GA}</span></td>
                          <td>
                            <span className={`std-num std-gd ${gd > 0 ? "pos" : gd < 0 ? "neg" : ""}`}>
                              {gd > 0 ? `+${gd}` : gd}
                            </span>
                          </td>
                          <td><span className="std-pts">{s.Pts}</span></td>
                          <td>
                            <div className="form-dots">
                              {recentForm.length === 0
                                ? <span style={{ color: "var(--muted)", fontSize: 11 }}>—</span>
                                : recentForm.map((r, j) => (
                                  <span key={j} className={`form-dot dot-${r}`} title={r === "W" ? "Thắng" : r === "D" ? "Hòa" : "Thua"} />
                                ))
                              }
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
 
                {/* Legend */}
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { color: "var(--lime)", label: "Thắng" },
                    { color: "var(--gold)", label: "Hòa" },
                    { color: "var(--red)",  label: "Thua" },
                  ].map(f => (
                    <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="form-dot" style={{ background: f.color, width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />
                      <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Barlow Condensed'", letterSpacing: 0.5 }}>{f.label}</span>
                    </div>
                  ))}
                  <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Barlow Condensed'", marginLeft: "auto" }}>
                    ST=Số trận · T=Thắng · H=Hòa · B=Thua · BT=Bàn thắng · BB=Bàn bại · HS=Hiệu số
                  </span>
                </div>
              </div>
            </>
          )}
        </main>
 
        {/* ADD MATCH MODAL */}
        {showMatchModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMatchModal(false)}>
            <div className="modal">
              <div className="modal-title">⚽ THÊM TRẬN ĐẤU</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Đội nhà *</label>
                    <select className="field-input" value={mHome} onChange={e => setMHome(e.target.value)}>
                      <option value="">-- Chọn đội --</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Đội khách *</label>
                    <select className="field-input" value={mAway} onChange={e => setMAway(e.target.value)}>
                      <option value="">-- Chọn đội --</option>
                      {teams.filter(t => t.id !== parseInt(mHome)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Ngày thi đấu *</label>
                    <input type="date" className="field-input" value={mDate} onChange={e => setMDate(e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Giờ thi đấu</label>
                    <input type="time" className="field-input" value={mTime} onChange={e => setMTime(e.target.value)} />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Trạng thái</label>
                  <select className="field-input" value={mStatus} onChange={e => setMStatus(e.target.value)}>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="finished">Đã kết thúc</option>
                    <option value="live">Đang diễn ra</option>
                  </select>
                </div>
                {mStatus !== "upcoming" && (
                  <div className="field-row">
                    <div className="field-group">
                      <label className="field-label">Tỷ số đội nhà</label>
                      <input type="number" min="0" className="field-input" placeholder="0" value={mHomeScore} onChange={e => setMHomeScore(e.target.value)} />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Tỷ số đội khách</label>
                      <input type="number" min="0" className="field-input" placeholder="0" value={mAwayScore} onChange={e => setMAwaySCore(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowMatchModal(false)}>HỦY</button>
                <button
                  className="btn-submit btn-confirm"
                  onClick={handleAddMatch}
                  disabled={!mHome || !mAway || !mDate || mHome === mAway}
                >
                  XÁC NHẬN
                </button>
              </div>
            </div>
          </div>
        )}
 
        {/* TOAST */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}