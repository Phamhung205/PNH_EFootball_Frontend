import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const competitions = [
  ['Premier League', '01_Premier_League_Inspired.png'],
  ['LaLiga', '02_LaLiga_Inspired.png'],
  ['Bundesliga', '03_Bundesliga_Inspired.png'],
  ['Champions League', '04_Champions_League_Inspired.png'],
  ['Europa League', '05_Europa_League_Inspired.png'],
  ['World Cup', '06_World_Cup_Inspired.png'],
  ['Serie A', '07_Serie_A_Inspired.png'],
  ['Ligue 1', '08_Ligue_1_Inspired.png'],
  ['Eredivisie', '09_Eredivisie_Inspired.png'],
  ['Primeira Liga', '10_Primeira_Liga_Inspired.png'],
  ['SPL', '11_SPL_Inspired.png'],
  ['Belgian Pro League', '12_Belgian_Pro_League_Inspired.png'],
  ['Conference League', '13_Conference_League_Inspired.png'],
];

const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export const getCompetitionLogo = (name) => {
  const competition = competitions.find(([label]) => normalize(label) === normalize(name));
  return competition ? `/${competition[1]}` : null;
};

export default function ChampionCompetitions({ darkMode, language, available = [], selected, onSelect }) {
  const english = language === 'en';
  const stripRef = useRef(null);
  const scroll = (direction) => {
    const strip = stripRef.current;
    if (strip) strip.scrollBy({ left: direction * strip.clientWidth * 0.8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const options = [
    { name: english ? 'All' : 'Tất cả', value: 'all' },
    ...competitions.map(([name, file]) => ({
      name, file,
      value: available.find((item) => normalize(item) === normalize(name)) || name,
    })),
    ...available.filter((name) => !competitions.some(([label]) => normalize(label) === normalize(name)))
      .map((name) => ({ name, value: name })),
  ];
  const arrowClass = `flex h-9 w-7 sm:w-8 shrink-0 items-center justify-center rounded-lg border focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${darkMode ? 'border-cyan-900/50 bg-[#06111e] text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`;

  return (
    <section aria-label={english ? 'Select a competition' : 'Chọn giải đấu'} className="min-w-0 mb-5">
      <div className="flex min-w-0 items-start gap-1 sm:gap-2">
        <button type="button" onClick={() => scroll(-1)} aria-controls="champion-competition-strip" aria-label={english ? 'Previous competitions' : 'Các giải phía trước'} className={arrowClass}>
          <ChevronLeft size={16} />
        </button>
        <div id="champion-competition-strip" ref={stripRef}
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto overscroll-x-contain snap-x snap-proximity px-0.5 pb-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: darkMode ? '#164e63 #08111f' : '#94a3b8 #f1f5f9' }}>
          {options.map(({ name, value, file }) => (
            <button key={value} type="button" aria-pressed={selected === value}
              onClick={(event) => {
                onSelect(value);
                event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
              }}
              className={`flex h-9 sm:h-10 shrink-0 snap-start items-center justify-center gap-2 rounded-lg border px-3 sm:px-4 text-xs font-bold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${selected === value
                ? 'border-amber-300 bg-gradient-to-b from-amber-200 to-amber-300 text-slate-950'
                : darkMode ? 'border-cyan-900/50 bg-[#06111e] text-slate-300 hover:border-amber-400/60' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-500'}`}>
              {file && <img src={`/${file}`} alt="" loading="lazy" width="28" height="28" className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 object-contain" />}
              <span>{name}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => scroll(1)} aria-controls="champion-competition-strip" aria-label={english ? 'Next competitions' : 'Các giải phía sau'} className={arrowClass}>
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
