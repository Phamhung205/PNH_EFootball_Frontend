import { useEffect, useState } from 'react';
import { championHonorApi } from '../services/championHonorApi';
import ChampionCompetitions from '../components/ChampionCompetitions';
import ChampionRanking from '../components/ChampionRanking';
import ChampionProfile from './ChampionProfile';

export default function ChampionHall({ darkMode = true, language = 'vi' }) {
  const [competitions, setCompetitions] = useState([]);
  const [selected, setSelected] = useState('all');
  const [rankingResult, setRankingResult] = useState(null);
  const [profileKey, setProfileKey] = useState(null);
  const english = language === 'en';
  const loading = rankingResult?.selected !== selected || rankingResult?.language !== language;
  const ranking = loading ? [] : rankingResult.ranking;
  const error = loading ? '' : rankingResult.error;

  useEffect(() => {
    let alive = true;
    championHonorApi.competitions()
      .then(data => { if (alive) setCompetitions(Array.isArray(data) ? data : []); })
      .catch(() => { if (alive) setCompetitions([]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    championHonorApi.ranking(selected)
      .then(data => { if (alive) setRankingResult({ selected, language, ranking: Array.isArray(data) ? data : [], error: '' }); })
      .catch(e => {
        if (alive) {
          setRankingResult({ selected, language, ranking: [], error: e?.message || (english ? 'Unable to load rankings.' : 'Không thể tải bảng vinh danh.') });
        }
      });
    return () => { alive = false; };
  }, [selected, english, language]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#050914] text-white' : 'bg-slate-100 text-slate-950'}`}>
      {profileKey && <ChampionProfile key={profileKey} playerKey={profileKey} darkMode={darkMode} language={language} onBack={() => setProfileKey(null)} />}
      <div hidden={Boolean(profileKey)}>
      <section className="overflow-hidden border-b border-amber-400/20 bg-[#050914]">
        <img src="/BXH.png" alt={english ? 'PNH EFOOTBALL Hall of Champions' : 'Bảng vinh danh nhà vô địch hệ thống PNH EFOOTBALL'} className="block w-full h-auto object-contain" />
      </section>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-7">
        <ChampionCompetitions darkMode={darkMode} language={language} available={competitions} selected={selected} onSelect={setSelected} />
        <ChampionRanking selected={selected} ranking={ranking} competitions={competitions} loading={loading} error={error} darkMode={darkMode} language={language} onViewPlayer={player => setProfileKey(player.key)} />
      </div>
      </div>
    </div>
  );
}
