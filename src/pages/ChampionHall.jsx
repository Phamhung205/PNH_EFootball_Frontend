// ============================================================
// FRONTEND - FILE THÊM MỚI
// src/pages/ChampionHall.jsx
// ============================================================

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Award,
  ChevronDown,
  ChevronUp,
  Crown,
  Medal,
  Trophy,
} from 'lucide-react';

import {
  championHonorApi,
} from '../services/championHonorApi';

const fmt = (value) => {
  if (!value) {
    return '—';
  }

  const d =
    new Date(value);

  return Number.isNaN(
    d.getTime()
  )
    ? '—'
    : d.toLocaleDateString(
        'vi-VN'
      );
};

const medal = (
  placement
) => {
  if (placement === 1) {
    return '🏅';
  }

  if (placement === 2) {
    return '🥈';
  }

  return '🥉';
};

const rankTextClass = (
  rank
) => {
  if (rank === 1) {
    return 'text-amber-300';
  }

  if (rank === 2) {
    return 'text-slate-300';
  }

  if (rank === 3) {
    return 'text-orange-400';
  }

  return 'text-slate-500';
};

const podiumClass = (
  rank
) => {
  if (rank === 1) {
    return 'border-amber-400/60 from-amber-300/25 via-amber-400/10 to-transparent shadow-[0_0_45px_rgba(245,158,11,.13)]';
  }

  if (rank === 2) {
    return 'border-slate-300/30 from-slate-300/18 via-slate-400/5 to-transparent';
  }

  return 'border-orange-400/35 from-orange-400/20 via-orange-500/5 to-transparent';
};

function Avatar({
  src,
  name,
  size = 'w-11 h-11',
}) {
  const [
    bad,
    setBad,
  ] = useState(false);

  return (
    <div
      className={`
        ${size}
        shrink-0
        overflow-hidden
        rounded-full
        border
        border-white/20
        bg-slate-800
        flex
        items-center
        justify-center
        font-black
        text-white
      `}
    >
      {src && !bad ? (
        <img
          src={src}
          alt={
            name ||
            'Avatar'
          }
          className="
            w-full
            h-full
            object-cover
          "
          onError={() =>
            setBad(true)
          }
        />
      ) : (
        <span>
          {(
            name?.[0] ||
            '?'
          ).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function TeamLogo({
  src,
  name,
}) {
  const [
    bad,
    setBad,
  ] = useState(false);

  return (
    <div
      className="
        w-8
        h-8
        shrink-0
        rounded-lg
        bg-white/5
        border
        border-white/10
        overflow-hidden
        flex
        items-center
        justify-center
      "
    >
      {src && !bad ? (
        <img
          src={src}
          alt={
            name ||
            'Logo đội'
          }
          className="
            w-full
            h-full
            object-contain
            p-0.5
          "
          onError={() =>
            setBad(true)
          }
        />
      ) : (
        <Trophy
          size={14}
          className="
            text-amber-300/70
          "
        />
      )}
    </div>
  );
}

export default function ChampionHall({
  darkMode = true,
  language = 'vi',
}) {
  const tr = (
    vi,
    en
  ) =>
    language === 'en'
      ? en
      : vi;

  const [
    competitions,
    setCompetitions,
  ] = useState([]);

  const [
    selected,
    setSelected,
  ] = useState('all');

  const [
    ranking,
    setRanking,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    expanded,
    setExpanded,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState('');

  const allMode =
    selected === 'all';

  useEffect(() => {
    let alive = true;

    championHonorApi
      .competitions()
      .then((data) => {
        if (!alive) {
          return;
        }

        setCompetitions(
          Array.isArray(data)
            ? data
            : []
        );
      })
      .catch(() => {
        if (!alive) {
          return;
        }

        setCompetitions(
          []
        );
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    setLoading(true);

    setError('');

    setExpanded(null);

    championHonorApi
      .ranking(selected)
      .then((data) => {
        if (!alive) {
          return;
        }

        setRanking(
          Array.isArray(data)
            ? data
            : []
        );
      })
      .catch((e) => {
        if (!alive) {
          return;
        }

        setRanking([]);

        setError(
          e?.message ||
            tr(
              'Không thể tải bảng vinh danh.',
              'Unable to load rankings.'
            )
        );
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [selected]);

  const top3 =
    useMemo(
      () =>
        ranking.slice(
          0,
          3
        ),
      [ranking]
    );

  const podium =
    useMemo(() => {
      const first =
        top3.find(
          (x) =>
            x.rank === 1
        );

      const second =
        top3.find(
          (x) =>
            x.rank === 2
        );

      const third =
        top3.find(
          (x) =>
            x.rank === 3
        );

      return [
        second,
        first,
        third,
      ].filter(Boolean);
    }, [top3]);

  const pageBg =
    darkMode
      ? 'bg-[#050914] text-white'
      : 'bg-slate-100 text-slate-950';

  const panel =
    darkMode
      ? 'bg-[#08111f]/90 border-white/10'
      : 'bg-white border-slate-200 shadow-sm';

  const muted =
    darkMode
      ? 'text-slate-400'
      : 'text-slate-500';

  return (
    <div
      className={`
        min-h-screen
        ${pageBg}
      `}
    >
      <section
        className="
          relative
          overflow-hidden
          border-b
          border-amber-400/20
          bg-[radial-gradient(circle_at_72%_28%,rgba(245,158,11,.28),transparent_30%),linear-gradient(135deg,#07111f,#101827_55%,#050914)]
          text-white
        "
      >
        <div
          className="
            absolute
            right-[-100px]
            top-[-120px]
            w-[390px]
            h-[390px]
            sm:w-[650px]
            sm:h-[650px]
            rounded-full
            bg-amber-400/10
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            inset-y-0
            right-[8%]
            hidden
            lg:flex
            items-center
            opacity-20
          "
        >
          <Trophy
            size={280}
            strokeWidth={
              0.75
            }
            className="
              text-amber-300
            "
          />
        </div>

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            py-10
            sm:py-14
            relative
            z-10
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-amber-300
              text-[11px]
              sm:text-xs
              font-black
              tracking-[.22em]
              uppercase
              mb-3
            "
          >
            <Crown
              size={18}
            />

            PNH EFOOTBALL
          </div>

          <h1
            className="
              text-3xl
              sm:text-5xl
              font-black
              leading-tight
              tracking-tight
            "
          >
            {tr(
              'BẢNG VINH DANH',
              'HALL OF CHAMPIONS'
            )}

            <br />

            <span
              className="
                text-amber-300
              "
            >
              {tr(
                'NHÀ VÔ ĐỊCH HỆ THỐNG',
                'SYSTEM CHAMPIONS'
              )}
            </span>
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              text-sm
              sm:text-base
              text-slate-300
            "
          >
            {tr(
              'Tổng hợp thành tích vô địch, á quân và hạng ba của các giải đấu đã diễn ra trên PNH EFOOTBALL.',
              'A complete record of champion, runner-up and third-place achievements across PNH EFOOTBALL.'
            )}
          </p>
        </div>
      </section>

      <div
        className="
          max-w-7xl
          mx-auto
          px-3
          sm:px-6
          py-5
          sm:py-7
        "
      >
        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-2
          "
        >
          <button
            type="button"
            onClick={() =>
              setSelected(
                'all'
              )
            }
            className={`
              shrink-0
              px-5
              py-2.5
              rounded-xl
              border
              text-sm
              font-black
              transition-all

              ${
                allMode
                  ? 'bg-amber-300 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/10'
                  : darkMode
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:border-amber-400/40'
                    : 'bg-white border-slate-200 text-slate-600'
              }
            `}
          >
            🌐{' '}
            {tr(
              'Tất cả',
              'All'
            )}
          </button>

          {competitions.map(
            (name) => (
              <button
                type="button"
                key={name}
                onClick={() =>
                  setSelected(
                    name
                  )
                }
                className={`
                  shrink-0
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  text-sm
                  font-bold
                  transition-all

                  ${
                    selected ===
                    name
                      ? 'bg-amber-300 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/10'
                      : darkMode
                        ? 'bg-white/5 border-white/10 text-slate-300 hover:border-amber-400/40'
                        : 'bg-white border-slate-200 text-slate-600'
                  }
                `}
              >
                {name}
              </button>
            )
          )}
        </div>

        <div
          className="
            mt-6
            text-center
          "
        >
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <Award
              className="
                text-amber-300
              "
              size={24}
            />

            <h2
              className="
                text-lg
                sm:text-2xl
                font-black
              "
            >
              {allMode
                ? tr(
                    'TOP NHÀ VÔ ĐỊCH TOÀN HỆ THỐNG',
                    'TOP SYSTEM CHAMPIONS'
                  )
                : `${tr(
                    'TOP NHÀ VÔ ĐỊCH',
                    'TOP CHAMPIONS'
                  )} ${selected}`}
            </h2>
          </div>

          <p
            className={`
              mt-1
              text-xs
              sm:text-sm
              ${muted}
            `}
          >
            {allMode
              ? tr(
                  'Top được xếp theo số lần vô địch. 🏅 = Vô địch, 🥈 = Á quân, 🥉 = Hạng ba. Tổng danh hiệu = tổng cả 3 loại.',
                  'Ranking is ordered by championships. Medals show champion, runner-up, third place and total honours.'
                )
              : tr(
                  'Chọn một người để xem các đội bóng họ từng vô địch cùng mùa giải và thời gian kết thúc.',
                  'Open a player to see winning clubs, seasons and finishing dates.'
                )}
          </p>
        </div>

        {loading ? (
          <div
            className={`
              py-24
              text-center
              ${muted}
            `}
          >
            {tr(
              'Đang tải bảng vinh danh...',
              'Loading hall of champions...'
            )}
          </div>
        ) : error ? (
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/10
              p-5
              text-center
              text-sm
              text-red-300
            "
          >
            {error}
          </div>
        ) : (
          <>
            {podium.length >
              0 && (
              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                  sm:gap-5
                  mt-8
                  items-end
                "
              >
                {podium.map(
                  (
                    player
                  ) => {
                    const isFirst =
                      player.rank ===
                      1;

                    return (
                      <button
                        type="button"
                        key={
                          player.key
                        }
                        onClick={() =>
                          setExpanded(
                            expanded ===
                              player.key
                              ? null
                              : player.key
                          )
                        }
                        className={`
                          relative
                          rounded-2xl
                          sm:rounded-3xl
                          border
                          bg-gradient-to-b
                          ${podiumClass(
                            player.rank
                          )}

                          ${
                            isFirst
                              ? 'py-6 sm:py-8 scale-[1.02]'
                              : 'py-4 sm:py-6'
                          }

                          px-2
                          sm:px-5
                          text-center
                          transition-transform
                          hover:-translate-y-1
                        `}
                      >
                        {isFirst && (
                          <Crown
                            className="
                              absolute
                              -top-5
                              left-1/2
                              -translate-x-1/2
                              text-amber-300
                              fill-amber-300/15
                            "
                            size={36}
                          />
                        )}

                        <div
                          className={`
                            text-3xl
                            sm:text-6xl
                            font-black
                            ${rankTextClass(
                              player.rank
                            )}
                          `}
                        >
                          {
                            player.rank
                          }
                        </div>

                        <div
                          className="
                            mx-auto
                            mt-1
                            w-fit
                          "
                        >
                          <Avatar
                            src={
                              player.avatarUrl
                            }
                            name={
                              player.name
                            }
                            size="
                              w-10
                              h-10
                              sm:w-16
                              sm:h-16
                            "
                          />
                        </div>

                        <div
                          className="
                            mt-2
                            truncate
                            text-xs
                            sm:text-lg
                            font-black
                          "
                        >
                          {
                            player.name
                          }
                        </div>

                        <div
                          className="
                            text-[10px]
                            sm:text-sm
                            font-black
                            text-amber-300
                          "
                        >
                          {
                            player.championships
                          }{' '}
                          {tr(
                            'lần vô địch',
                            'championships'
                          )}
                        </div>

                        {allMode && (
                          <>
                            <div
                              className="
                                mt-2
                                flex
                                justify-center
                                gap-1.5
                                sm:gap-3
                                text-[9px]
                                sm:text-xs
                              "
                            >
                              <span>
                                🏅{' '}
                                {
                                  player.gold
                                }
                              </span>

                              <span>
                                🥈{' '}
                                {
                                  player.silver
                                }
                              </span>

                              <span>
                                🥉{' '}
                                {
                                  player.bronze
                                }
                              </span>
                            </div>

                            <div
                              className="
                                mt-1
                                text-[9px]
                                sm:text-[11px]
                                font-bold
                                text-slate-300
                              "
                            >
                              {tr(
                                'Tổng danh hiệu',
                                'Total honours'
                              )}
                              :{' '}
                              {
                                player.totalHonors
                              }
                            </div>
                          </>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}

            <div
              className={`
                mt-7
                rounded-2xl
                border
                overflow-hidden
                ${panel}
              `}
            >
              <div
                className="
                  px-4
                  sm:px-5
                  py-4
                  border-b
                  border-white/10
                  flex
                  items-center
                  gap-2
                "
              >
                <Trophy
                  size={18}
                  className="
                    text-amber-300
                  "
                />

                <h3
                  className="
                    font-black
                  "
                >
                  {allMode
                    ? tr(
                        'BẢNG XẾP HẠNG NHÀ VÔ ĐỊCH',
                        'CHAMPIONS RANKING'
                      )
                    : `${tr(
                        'BẢNG XẾP HẠNG',
                        'RANKING'
                      )} ${selected}`}
                </h3>
              </div>

              <div
                className={`
                  hidden
                  sm:grid
                  items-center
                  gap-3
                  px-5
                  py-3
                  border-b
                  text-[11px]
                  uppercase
                  tracking-wide
                  font-bold
                  ${muted}

                  ${
                    allMode
                      ? 'grid-cols-[60px_1.45fr_.7fr_1.15fr_.8fr_44px]'
                      : 'grid-cols-[60px_1.35fr_.75fr_1.5fr_1fr_44px]'
                  }
                `}
              >
                <span>
                  {tr(
                    'Hạng',
                    'Rank'
                  )}
                </span>

                <span>
                  {tr(
                    'Người vô địch',
                    'Champion'
                  )}
                </span>

                <span>
                  {tr(
                    'Vô địch',
                    'Titles'
                  )}
                </span>

                {allMode ? (
                  <>
                    <span>
                      {tr(
                        'Huy chương',
                        'Medals'
                      )}
                    </span>

                    <span>
                      {tr(
                        'Tổng danh hiệu',
                        'Total honours'
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {tr(
                        'Các đội bóng vô địch',
                        'Winning clubs'
                      )}
                    </span>

                    <span>
                      {tr(
                        'Kết thúc gần nhất',
                        'Latest finish'
                      )}
                    </span>
                  </>
                )}

                <span />
              </div>

              <div
                className="
                  divide-y
                  divide-white/[0.07]
                "
              >
                {ranking.map(
                  (
                    player
                  ) => {
                    const open =
                      expanded ===
                      player.key;

                    const championHistory =
                      (
                        player.history ||
                        []
                      ).filter(
                        (x) =>
                          x.placement ===
                          1
                      );

                    const latestChampion =
                      championHistory[0];

                    return (
                      <div
                        key={
                          player.key
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(
                              open
                                ? null
                                : player.key
                            )
                          }
                          className={`
                            w-full
                            text-left
                            hover:bg-white/[0.035]
                            transition-colors
                            px-3
                            sm:px-5
                            py-3.5
                            grid
                            items-center
                            gap-2
                            sm:gap-3

                            ${
                              allMode
                                ? 'grid-cols-[42px_1fr_auto] sm:grid-cols-[60px_1.45fr_.7fr_1.15fr_.8fr_44px]'
                                : 'grid-cols-[42px_1fr_auto] sm:grid-cols-[60px_1.35fr_.75fr_1.5fr_1fr_44px]'
                            }
                          `}
                        >
                          <span
                            className={`
                              text-xl
                              font-black
                              ${rankTextClass(
                                player.rank
                              )}
                            `}
                          >
                            {
                              player.rank
                            }
                          </span>

                          <span
                            className="
                              flex
                              items-center
                              gap-3
                              min-w-0
                            "
                          >
                            <Avatar
                              src={
                                player.avatarUrl
                              }
                              name={
                                player.name
                              }
                              size="
                                w-9
                                h-9
                              "
                            />

                            <span
                              className="
                                min-w-0
                              "
                            >
                              <b
                                className="
                                  block
                                  truncate
                                "
                              >
                                {
                                  player.name
                                }
                              </b>

                              <span
                                className="
                                  sm:hidden
                                  block
                                  text-[11px]
                                  text-amber-300
                                "
                              >
                                {
                                  player.championships
                                }{' '}
                                {tr(
                                  'lần vô địch',
                                  'championships'
                                )}
                              </span>

                              {allMode && (
                                <span
                                  className="
                                    sm:hidden
                                    block
                                    mt-0.5
                                    text-[10px]
                                    text-slate-400
                                  "
                                >
                                  🏅{' '}
                                  {
                                    player.gold
                                  }{' '}
                                  · 🥈{' '}
                                  {
                                    player.silver
                                  }{' '}
                                  · 🥉{' '}
                                  {
                                    player.bronze
                                  }{' '}
                                  ·{' '}
                                  {tr(
                                    'Tổng',
                                    'Total'
                                  )}{' '}
                                  {
                                    player.totalHonors
                                  }
                                </span>
                              )}
                            </span>
                          </span>

                          <span
                            className="
                              hidden
                              sm:block
                              font-black
                              text-amber-300
                            "
                          >
                            {
                              player.championships
                            }
                          </span>

                          {allMode ? (
                            <>
                              <span
                                className="
                                  hidden
                                  sm:flex
                                  flex-wrap
                                  gap-x-3
                                  gap-y-1
                                  text-sm
                                "
                              >
                                <span>
                                  🏅{' '}
                                  {
                                    player.gold
                                  }
                                </span>

                                <span>
                                  🥈{' '}
                                  {
                                    player.silver
                                  }
                                </span>

                                <span>
                                  🥉{' '}
                                  {
                                    player.bronze
                                  }
                                </span>
                              </span>

                              <span
                                className="
                                  hidden
                                  sm:block
                                  font-black
                                  text-amber-200
                                "
                              >
                                {
                                  player.totalHonors
                                }
                              </span>
                            </>
                          ) : (
                            <>
                              <span
                                className="
                                  hidden
                                  sm:flex
                                  flex-wrap
                                  gap-1.5
                                  min-w-0
                                "
                              >
                                {(player.teams ||
                                  [])
                                  .length >
                                0 ? (
                                  player.teams.map(
                                    (
                                      team
                                    ) => (
                                      <span
                                        key={`${player.key}-${team.name}`}
                                        className="
                                          inline-flex
                                          items-center
                                          gap-1.5
                                          rounded-lg
                                          border
                                          border-white/10
                                          bg-white/[0.035]
                                          px-2
                                          py-1
                                          text-xs
                                        "
                                      >
                                        <TeamLogo
                                          src={
                                            team.logoUrl
                                          }
                                          name={
                                            team.name
                                          }
                                        />

                                        <span
                                          className="
                                            max-w-[150px]
                                            truncate
                                          "
                                        >
                                          {
                                            team.name
                                          }
                                        </span>
                                      </span>
                                    )
                                  )
                                ) : (
                                  <span
                                    className={
                                      muted
                                    }
                                  >
                                    —
                                  </span>
                                )}
                              </span>

                              <span
                                className={`
                                  hidden
                                  sm:block
                                  text-sm
                                  ${muted}
                                `}
                              >
                                {fmt(
                                  latestChampion?.endDate
                                )}
                              </span>
                            </>
                          )}

                          <span
                            className="
                              justify-self-end
                              text-slate-400
                            "
                          >
                            {open ? (
                              <ChevronUp
                                size={
                                  18
                                }
                              />
                            ) : (
                              <ChevronDown
                                size={
                                  18
                                }
                              />
                            )}
                          </span>
                        </button>

                        {open && (
                          <div
                            className="
                              px-3
                              sm:px-16
                              pb-5
                              bg-black/10
                            "
                          >
                            <div
                              className="
                                rounded-xl
                                border
                                border-amber-400/20
                                bg-amber-400/[0.04]
                                p-3
                                sm:p-4
                              "
                            >
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  justify-between
                                  gap-2
                                  mb-3
                                "
                              >
                                <b
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                  "
                                >
                                  <Medal
                                    size={
                                      16
                                    }
                                    className="
                                      text-amber-300
                                    "
                                  />

                                  {allMode
                                    ? tr(
                                        'Chi tiết thành tích',
                                        'Achievement details'
                                      )
                                    : tr(
                                        'Các mùa vô địch',
                                        'Championship seasons'
                                      )}
                                </b>

                                {allMode && (
                                  <span
                                    className={`
                                      text-xs
                                      ${muted}
                                    `}
                                  >
                                    🏅{' '}
                                    {
                                      player.gold
                                    }{' '}
                                    · 🥈{' '}
                                    {
                                      player.silver
                                    }{' '}
                                    · 🥉{' '}
                                    {
                                      player.bronze
                                    }{' '}
                                    ·{' '}
                                    {tr(
                                      'Tổng',
                                      'Total'
                                    )}{' '}
                                    {
                                      player.totalHonors
                                    }
                                  </span>
                                )}
                              </div>

                              <div
                                className="
                                  space-y-2
                                "
                              >
                                {(allMode
                                  ? player.history ||
                                    []
                                  : championHistory
                                ).map(
                                  (
                                    item
                                  ) => (
                                    <div
                                      key={
                                        item.id
                                      }
                                      className="
                                        rounded-xl
                                        border
                                        border-white/[0.06]
                                        bg-white/[0.035]
                                        p-3
                                      "
                                    >
                                      <div
                                        className="
                                          grid
                                          grid-cols-[28px_1fr]
                                          sm:grid-cols-[28px_1.2fr_1.1fr_.8fr_1fr]
                                          items-center
                                          gap-2
                                          sm:gap-3
                                          text-xs
                                          sm:text-sm
                                        "
                                      >
                                        <span
                                          className="
                                            text-base
                                          "
                                        >
                                          {medal(
                                            item.placement
                                          )}
                                        </span>

                                        <div
                                          className="
                                            min-w-0
                                          "
                                        >
                                          <b
                                            className="
                                              block
                                              truncate
                                            "
                                          >
                                            {
                                              item.competitionName
                                            }
                                          </b>

                                          <span
                                            className={`
                                              sm:hidden
                                              text-[11px]
                                              ${muted}
                                            `}
                                          >
                                            {item.teamName ||
                                              '—'}
                                          </span>
                                        </div>

                                        <span
                                          className="
                                            hidden
                                            sm:flex
                                            items-center
                                            gap-2
                                            min-w-0
                                          "
                                        >
                                          <TeamLogo
                                            src={
                                              item.teamLogoUrl
                                            }
                                            name={
                                              item.teamName
                                            }
                                          />

                                          <span
                                            className="
                                              truncate
                                            "
                                          >
                                            {item.teamName ||
                                              '—'}
                                          </span>
                                        </span>

                                        <span
                                          className={`
                                            hidden
                                            sm:block
                                            ${muted}
                                          `}
                                        >
                                          {item.season ||
                                            '—'}
                                        </span>

                                        <span
                                          className={`
                                            hidden
                                            sm:block
                                            ${muted}
                                          `}
                                        >
                                          {fmt(
                                            item.endDate
                                          )}
                                        </span>
                                      </div>

                                      <div
                                        className={`
                                          sm:hidden
                                          mt-2
                                          pl-7
                                          text-[11px]
                                          ${muted}
                                        `}
                                      >
                                        {tr(
                                          'Mùa',
                                          'Season'
                                        )}
                                        :{' '}
                                        {item.season ||
                                          '—'}{' '}
                                        ·{' '}
                                        {tr(
                                          'Bắt đầu',
                                          'Start'
                                        )}
                                        :{' '}
                                        {fmt(
                                          item.startDate
                                        )}{' '}
                                        ·{' '}
                                        {tr(
                                          'Kết thúc',
                                          'End'
                                        )}
                                        :{' '}
                                        {fmt(
                                          item.endDate
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}

                                {(allMode
                                  ? player.history ||
                                    []
                                  : championHistory
                                ).length ===
                                  0 && (
                                  <div
                                    className={`
                                      py-6
                                      text-center
                                      text-sm
                                      ${muted}
                                    `}
                                  >
                                    {tr(
                                      'Chưa có lịch sử.',
                                      'No history.'
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                {ranking.length ===
                  0 && (
                  <div
                    className={`
                      py-16
                      text-center
                      ${muted}
                    `}
                  >
                    {tr(
                      'Chưa có dữ liệu nhà vô địch.',
                      'No champion data yet.'
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}