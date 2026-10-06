// ============================================================
// FRONTEND - FILE THÊM MỚI
// src/pages/admin/admin/ChampionManager.jsx
// ============================================================

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Edit3,
  Image as ImageIcon,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import {
  championHonorApi,
} from '../../../services/championHonorApi';

const EMPTY_FORM = {
  competitionName: '',
  season: '',
  championName: '',
  teamName: '',
  teamLogoUrl: '',
  championAvatarUrl: '',
  startDate: '',
  endDate: '',
  placement: 1,
};

const toDateInput = (
  value
) =>
  value
    ? String(value).slice(
        0,
        10
      )
    : '';

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

const awardText = (
  placement,
  tr
) => {
  if (placement === 1) {
    return `🏅 ${tr(
      'Vô địch',
      'Champion'
    )}`;
  }

  if (placement === 2) {
    return `🥈 ${tr(
      'Á quân',
      'Runner-up'
    )}`;
  }

  return `🥉 ${tr(
    'Hạng ba',
    'Third place'
  )}`;
};

export default function ChampionManager({
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
    items,
    setItems,
  ] = useState([]);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    editId,
    setEditId,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    query,
    setQuery,
  ] = useState('');

  const [
    competitionFilter,
    setCompetitionFilter,
  ] = useState('all');

  const card =
    darkMode
      ? 'bg-[#0b1422] border-white/10'
      : 'bg-white border-slate-200 shadow-sm';

  const input = `
    w-full
    rounded-xl
    border
    px-3
    py-2.5
    text-sm
    outline-none
    transition-all

    ${
      darkMode
        ? 'bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10'
        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10'
    }
  `;

  const load =
    async () => {
      setLoading(true);

      try {
        const data =
          await championHonorApi.list(
            'all'
          );

        setItems(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (e) {
        alert(
          e?.message ||
            tr(
              'Không thể tải dữ liệu.',
              'Unable to load data.'
            )
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    load();
  }, []);

  const competitions =
    useMemo(
      () =>
        [
          ...new Set(
            items
              .map(
                (x) =>
                  x.competitionName
              )
              .filter(Boolean)
          ),
        ].sort((a, b) =>
          a.localeCompare(
            b,
            'vi'
          )
        ),
      [items]
    );

  const filtered =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          if (
            competitionFilter !==
              'all' &&
            item.competitionName !==
              competitionFilter
          ) {
            return false;
          }

          if (!q) {
            return true;
          }

          return `
            ${item.competitionName || ''}
            ${item.championName || ''}
            ${item.teamName || ''}
            ${item.season || ''}
          `
            .toLowerCase()
            .includes(q);
        }
      );
    }, [
      items,
      query,
      competitionFilter,
    ]);

  const change = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      [key]: value,
    }));
  };

  const reset = () => {
    setForm(
      EMPTY_FORM
    );

    setEditId(null);
  };

  const handleChampionAvatarFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(tr('Vui lòng chọn ảnh JPG, PNG hoặc WebP.', 'Please select a JPG, PNG or WebP image.'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert(tr('Ảnh tối đa 2MB.', 'Maximum image size is 2MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => change('championAvatarUrl', String(reader.result || ''));
    reader.onerror = () => alert(tr('Không đọc được ảnh. Vui lòng chọn lại.', 'Unable to read image. Please try again.'));
    reader.readAsDataURL(file);
  };

  const handleTeamLogoFile =
    (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          'image/'
        )
      ) {
        alert(
          tr(
            'Vui lòng chọn file ảnh.',
            'Please select an image file.'
          )
        );

        return;
      }

      if (
        file.size >
        2 * 1024 * 1024
      ) {
        alert(
          tr(
            'Ảnh tối đa 2MB.',
            'Maximum image size is 2MB.'
          )
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () =>
        change(
          'teamLogoUrl',
          String(
            reader.result ||
              ''
          )
        );

      reader.readAsDataURL(
        file
      );
    };

  const submit =
    async (event) => {
      event.preventDefault();

      if (saving) {
        return;
      }

      if (
        !form.competitionName.trim()
      ) {
        alert(
          tr(
            'Vui lòng nhập tên giải đấu.',
            'Please enter competition name.'
          )
        );

        return;
      }

      if (
        !form.championName.trim()
      ) {
        alert(
          tr(
            'Vui lòng nhập tên người.',
            'Please enter player name.'
          )
        );

        return;
      }

      if (
        !form.teamName.trim()
      ) {
        alert(
          tr(
            'Vui lòng nhập đội bóng.',
            'Please enter team name.'
          )
        );

        return;
      }

      if (!form.endDate) {
        alert(
          tr(
            'Vui lòng chọn thời gian kết thúc.',
            'Please select end date.'
          )
        );

        return;
      }

      if (
        form.startDate &&
        form.endDate &&
        form.startDate >
          form.endDate
      ) {
        alert(
          tr(
            'Thời gian bắt đầu không được sau thời gian kết thúc.',
            'Start date cannot be after end date.'
          )
        );

        return;
      }

      setSaving(true);

      try {
        const payload = {
          competitionName:
            form.competitionName.trim(),

          season:
            form.season.trim() ||
            null,

          championName:
            form.championName.trim(),

          teamName:
            form.teamName.trim(),

          teamLogoUrl:
            form.teamLogoUrl ||
            null,

          championAvatarUrl:
            form.championAvatarUrl ||
            null,

          startDate:
            form.startDate ||
            null,

          endDate:
            form.endDate,

          placement:
            Number(
              form.placement
            ),
        };

        if (editId) {
          await championHonorApi.update(
            editId,
            payload
          );
        } else {
          await championHonorApi.create(
            payload
          );
        }

        reset();

        await load();
      } catch (e) {
        alert(
          e?.message ||
            tr(
              'Không thể lưu dữ liệu.',
              'Unable to save data.'
            )
        );
      } finally {
        setSaving(false);
      }
    };

  const edit = (
    item
  ) => {
    setEditId(
      item.id
    );

    setForm({
      competitionName:
        item.competitionName ||
        '',

      season:
        item.season || '',

      championName:
        item.championName ||
        '',

      teamName:
        item.teamName || '',

      teamLogoUrl:
        item.teamLogoUrl ||
        '',

      championAvatarUrl:
        item.championAvatarUrl ||
        '',

      startDate:
        toDateInput(
          item.startDate
        ),

      endDate:
        toDateInput(
          item.endDate
        ),

      placement:
        item.placement ||
        1,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const remove =
    async (id) => {
      if (
        !window.confirm(
          tr(
            'Xóa bản ghi thành tích này?',
            'Delete this achievement record?'
          )
        )
      ) {
        return;
      }

      try {
        await championHonorApi.remove(
          id
        );

        if (
          editId === id
        ) {
          reset();
        }

        await load();
      } catch (e) {
        alert(
          e?.message ||
            tr(
              'Không thể xóa dữ liệu.',
              'Unable to delete data.'
            )
        );
      }
    };

  return (
    <div
      className="
        space-y-5
      "
    >
      <div
        className={`
          rounded-2xl
          border
          ${card}
          p-4
          sm:p-5
        `}
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-amber-400/15
              flex
              items-center
              justify-center
            "
          >
            <ShieldCheck
              className="
                text-amber-300
              "
            />
          </div>

          <div>
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <h2
                className="
                  font-black
                  text-lg
                "
              >
                {tr(
                  'Quản lý nhà vô địch',
                  'Champion Management'
                )}
              </h2>

              <span
                className="
                  px-2
                  py-0.5
                  rounded-full
                  border
                  border-red-500/30
                  bg-red-500/10
                  text-[10px]
                  font-black
                  text-red-400
                "
              >
                ADMIN ONLY
              </span>
            </div>

            <p
              className="
                text-xs
                text-slate-400
                mt-0.5
              "
            >
              {tr(
                'Chỉ Admin được thêm, chỉnh sửa hoặc xóa dữ liệu thủ công.',
                'Only Admin can manually add, edit or delete records.'
              )}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        className={`
          rounded-2xl
          border
          ${card}
          p-4
          sm:p-5
          space-y-4
        `}
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <h3
            className="
              font-black
              flex
              items-center
              gap-2
            "
          >
            {editId ? (
              <Edit3
                size={18}
                className="
                  text-cyan-400
                "
              />
            ) : (
              <Plus
                size={18}
                className="
                  text-amber-300
                "
              />
            )}

            {editId
              ? tr(
                  'Chỉnh sửa thành tích',
                  'Edit achievement'
                )
              : tr(
                  'Thêm thành tích thủ công',
                  'Add manual achievement'
                )}
          </h3>

          {editId && (
            <button
              type="button"
              onClick={reset}
              className="
                text-xs
                text-slate-400
                hover:text-white
                flex
                items-center
                gap-1
              "
            >
              <X
                size={14}
              />

              {tr(
                'Hủy sửa',
                'Cancel'
              )}
            </button>
          )}
        </div>

        <div
          className="
            grid
            sm:grid-cols-2
            lg:grid-cols-3
            gap-3
          "
        >
          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Giải đấu *',
              'Competition *'
            )}

            <input
              className={`${input} mt-1`}
              value={
                form.competitionName
              }
              onChange={(e) =>
                change(
                  'competitionName',
                  e.target.value
                )
              }
              placeholder="
                Premier League
              "
            />
          </label>

          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Tên người *',
              'Player name *'
            )}

            <input
              className={`${input} mt-1`}
              value={
                form.championName
              }
              onChange={(e) =>
                change(
                  'championName',
                  e.target.value
                )
              }
              placeholder="HùngIT"
            />
          </label>

          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Đội bóng *',
              'Team *'
            )}

            <input
              className={`${input} mt-1`}
              value={
                form.teamName
              }
              onChange={(e) =>
                change(
                  'teamName',
                  e.target.value
                )
              }
              placeholder="
                Manchester United
              "
            />
          </label>

          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Mùa giải',
              'Season'
            )}

            <input
              className={`${input} mt-1`}
              value={
                form.season
              }
              onChange={(e) =>
                change(
                  'season',
                  e.target.value
                )
              }
              placeholder="
                2025/26
              "
            />
          </label>

          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Thành tích',
              'Placement'
            )}

            <select
              className={`${input} mt-1`}
              value={
                form.placement
              }
              onChange={(e) =>
                change(
                  'placement',
                  Number(
                    e.target.value
                  )
                )
              }
            >
              <option
                value={1}
              >
                🏅{' '}
                {tr(
                  'Vô địch',
                  'Champion'
                )}
              </option>

              <option
                value={2}
              >
                🥈{' '}
                {tr(
                  'Á quân',
                  'Runner-up'
                )}
              </option>

              <option
                value={3}
              >
                🥉{' '}
                {tr(
                  'Hạng ba',
                  'Third place'
                )}
              </option>
            </select>
          </label>

          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'URL logo đội bóng',
              'Team logo URL'
            )}

            <input
              className={`${input} mt-1`}
              value={
                form.teamLogoUrl.startsWith(
                  'data:'
                )
                  ? ''
                  : form.teamLogoUrl
              }
              onChange={(e) =>
                change(
                  'teamLogoUrl',
                  e.target.value
                )
              }
              placeholder="
                https://.../logo.png
              "
            />
          </label>

          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Thời gian bắt đầu',
              'Start date'
            )}

            <input
              type="date"
              className={`${input} mt-1`}
              value={
                form.startDate
              }
              onChange={(e) =>
                change(
                  'startDate',
                  e.target.value
                )
              }
            />
          </label>

          <label
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Thời gian kết thúc *',
              'End date *'
            )}

            <input
              type="date"
              className={`${input} mt-1`}
              value={
                form.endDate
              }
              onChange={(e) =>
                change(
                  'endDate',
                  e.target.value
                )
              }
            />
          </label>

          <div
            className="
              text-xs
              text-slate-400
            "
          >
            {tr(
              'Tải logo đội bóng',
              'Upload team logo'
            )}

            <label
              className={`
                mt-1
                min-h-[42px]
                rounded-xl
                border
                border-dashed
                flex
                items-center
                justify-center
                gap-2
                cursor-pointer

                ${
                  darkMode
                    ? 'border-white/15 bg-black/20 hover:border-amber-400/40'
                    : 'border-slate-300 bg-slate-50 hover:border-amber-500'
                }
              `}
            >
              <Upload
                size={15}
              />

              <span>
                {tr(
                  'Chọn ảnh tối đa 2MB',
                  'Choose image up to 2MB'
                )}
              </span>

              <input
                type="file"
                accept="image/*"
                className="
                  hidden
                "
                onChange={
                  handleTeamLogoFile
                }
              />
            </label>
          </div>
        </div>

        <fieldset disabled={saving} className="mt-4 min-w-0 rounded-xl border border-slate-500/30 p-4">
          <legend className="px-2 text-sm font-bold">{tr('Ảnh người vô địch', 'Champion photo')}</legend>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-500/30 bg-slate-500/10">
              {form.championAvatarUrl
                ? <img key={form.championAvatarUrl} src={form.championAvatarUrl} alt={tr('Ảnh người vô địch', 'Champion photo')} className="h-full w-full object-cover" />
                : <ImageIcon size={28} className="text-slate-400" />}
            </div>
            <div className="w-full min-w-0 flex-1 space-y-3">
              <label className="block text-xs text-slate-400">
                {tr('URL ảnh người vô địch', 'Champion photo URL')}
                <input className={`${input} mt-1`} type="url" placeholder="https://.../avatar.jpg"
                  value={form.championAvatarUrl.startsWith('data:') ? '' : form.championAvatarUrl}
                  onChange={e => change('championAvatarUrl', e.target.value)} />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-bold text-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400">
                  <Upload size={15} />{tr('Tải / đổi ảnh người vô địch', 'Upload / change champion photo')}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleChampionAvatarFile} />
                </label>
                {form.championAvatarUrl && <button type="button" onClick={() => change('championAvatarUrl', '')} className="inline-flex items-center gap-1 text-xs text-red-400"><X size={14} />{tr('Xóa ảnh', 'Remove photo')}</button>}
              </div>
              <p className="text-xs text-slate-500">{tr('JPG, PNG, WebP · Tối đa 2MB. Bấm Lưu để cập nhật ảnh người vô địch.', 'JPG, PNG, WebP · Up to 2MB. Save to update the champion photo.')}</p>
            </div>
          </div>
        </fieldset>
        {form.teamLogoUrl && (
          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-white/10
              bg-black/10
              p-3
              w-fit
              max-w-full
            "
          >
            <div
              className="
                w-14
                h-14
                rounded-xl
                bg-white/5
                flex
                items-center
                justify-center
                overflow-hidden
              "
            >
              <img
                src={
                  form.teamLogoUrl
                }
                alt="
                  Logo preview
                "
                className="
                  w-full
                  h-full
                  object-contain
                  p-1
                "
                onError={(
                  e
                ) => {
                  e.currentTarget.style.display =
                    'none';
                }}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  text-xs
                  font-bold
                "
              >
                {tr(
                  'Logo đội bóng',
                  'Team logo'
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  change(
                    'teamLogoUrl',
                    ''
                  )
                }
                className="
                  mt-1
                  text-[11px]
                  text-red-400
                  hover:text-red-300
                  flex
                  items-center
                  gap-1
                "
              >
                <Trash2
                  size={12}
                />

                {tr(
                  'Xóa logo',
                  'Remove logo'
                )}
              </button>
            </div>
          </div>
        )}

        <div
          className="
            rounded-xl
            border
            border-amber-400/15
            bg-amber-400/[0.04]
            p-3
            text-xs
            text-slate-400
          "
        >
          {tr(
            'Nếu nhập cùng một tên nhiều lần, hệ thống sẽ tự gộp trên BXH. Ví dụ HùngIT có 2 bản ghi vô địch thì BXH sẽ tính HùngIT vô địch 2 lần.',
            'Repeated records with the same player name are automatically grouped in the ranking.'
          )}
        </div>

        <button
          disabled={saving}
          className="
            px-5
            py-2.5
            rounded-xl
            bg-amber-300
            text-slate-950
            font-black
            text-sm
            flex
            items-center
            gap-2
            disabled:opacity-50
          "
        >
          <Save
            size={16}
          />

          {saving
            ? tr(
                'Đang lưu...',
                'Saving...'
              )
            : editId
              ? tr(
                  'Cập nhật',
                  'Update'
                )
              : tr(
                  'Thêm thành tích',
                  'Add achievement'
                )}
        </button>
      </form>

      <div
        className={`
          rounded-2xl
          border
          ${card}
          overflow-hidden
        `}
      >
        <div
          className="
            p-4
            flex
            flex-col
            xl:flex-row
            xl:items-center
            gap-3
            justify-between
          "
        >
          <div>
            <h3
              className="
                font-black
              "
            >
              {tr(
                'Danh sách thành tích',
                'Achievement list'
              )}
            </h3>

            <p
              className="
                text-xs
                text-slate-500
                mt-0.5
              "
            >
              {tr(
                'Auto = hệ thống tự thêm khi giải kết thúc. Manual = Admin nhập thủ công.',
                'Auto = generated when tournament ends. Manual = entered by Admin.'
              )}
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-2
              xl:min-w-[560px]
            "
          >
            <select
              className={`${input} sm:max-w-[220px]`}
              value={
                competitionFilter
              }
              onChange={(e) =>
                setCompetitionFilter(
                  e.target.value
                )
              }
            >
              <option
                value="all"
              >
                {tr(
                  'Tất cả giải đấu',
                  'All competitions'
                )}
              </option>

              {competitions.map(
                (name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                )
              )}
            </select>

            <div
              className="
                relative
                flex-1
              "
            >
              <Search
                size={15}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                className={`${input} pl-9`}
                placeholder={tr(
                  'Tìm tên, đội, giải...',
                  'Search player, team, competition...'
                )}
              />
            </div>
          </div>
        </div>

        <div
          className="
            overflow-x-auto
          "
        >
          <table
            className="
              w-full
              min-w-[900px]
              text-sm
            "
          >
            <thead
              className="
                text-xs
                text-slate-400
                border-y
                border-white/10
              "
            >
              <tr>
                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  #
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {tr(
                    'Giải đấu',
                    'Competition'
                  )}
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {tr(
                    'Người',
                    'Player'
                  )}
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {tr(
                    'Đội bóng',
                    'Team'
                  )}
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {tr(
                    'Thành tích',
                    'Award'
                  )}
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {tr(
                    'Bắt đầu',
                    'Start'
                  )}
                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >
                  {tr(
                    'Kết thúc',
                    'End'
                  )}
                </th>

                <th
                  className="
                    p-3
                    text-right
                  "
                >
                  {tr(
                    'Thao tác',
                    'Actions'
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="
                      p-10
                      text-center
                      text-slate-500
                    "
                  >
                    {tr(
                      'Đang tải dữ liệu...',
                      'Loading data...'
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        item.id
                      }
                      className="
                        border-b
                        border-white/5
                        hover:bg-white/[0.025]
                      "
                    >
                      <td
                        className="
                          p-3
                          text-slate-500
                        "
                      >
                        {index +
                          1}
                      </td>

                      <td
                        className="
                          p-3
                          font-bold
                        "
                      >
                        {
                          item.competitionName
                        }

                        <div
                          className="
                            text-[11px]
                            text-slate-500
                            mt-0.5
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <span>
                            {item.season ||
                              '—'}
                          </span>

                          <span
                            className={`
                              px-1.5
                              py-0.5
                              rounded
                              border

                              ${
                                item.source ===
                                'Auto'
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                  : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                              }
                            `}
                          >
                            {item.source ||
                              'Manual'}
                          </span>
                        </div>
                      </td>

                      <td
                        className="
                          p-3
                          font-semibold
                        "
                      >
                        <div className="flex items-center gap-2">
                          {item.championAvatarUrl && <img src={item.championAvatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full border border-slate-500/30 object-cover" />}
                          <span>{item.championName}</span>
                        </div>
                      </td>

                      <td
                        className="
                          p-3
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          {item.teamLogoUrl ? (
                            <img
                              src={
                                item.teamLogoUrl
                              }
                              alt=""
                              className="
                                w-8
                                h-8
                                rounded-lg
                                object-contain
                                bg-white/5
                                p-0.5
                              "
                              onError={(
                                e
                              ) => {
                                e.currentTarget.style.display =
                                  'none';
                              }}
                            />
                          ) : (
                            <div
                              className="
                                w-8
                                h-8
                                rounded-lg
                                bg-white/5
                                flex
                                items-center
                                justify-center
                              "
                            >
                              <ImageIcon
                                size={
                                  14
                                }
                                className="
                                  text-slate-600
                                "
                              />
                            </div>
                          )}

                          <span
                            className="
                              text-slate-300
                            "
                          >
                            {item.teamName ||
                              '—'}
                          </span>
                        </div>
                      </td>

                      <td
                        className="
                          p-3
                        "
                      >
                        {awardText(
                          item.placement,
                          tr
                        )}
                      </td>

                      <td
                        className="
                          p-3
                          text-slate-400
                        "
                      >
                        {fmt(
                          item.startDate
                        )}
                      </td>

                      <td
                        className="
                          p-3
                          text-slate-400
                        "
                      >
                        {fmt(
                          item.endDate
                        )}
                      </td>

                      <td
                        className="
                          p-3
                        "
                      >
                        <div
                          className="
                            flex
                            justify-end
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              edit(
                                item
                              )
                            }
                            className="
                              p-2
                              rounded-lg
                              bg-cyan-500/10
                              text-cyan-400
                              hover:bg-cyan-500/20
                            "
                          >
                            <Edit3
                              size={
                                15
                              }
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              remove(
                                item.id
                              )
                            }
                            className="
                              p-2
                              rounded-lg
                              bg-red-500/10
                              text-red-400
                              hover:bg-red-500/20
                            "
                          >
                            <Trash2
                              size={
                                15
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}

              {!loading &&
                filtered.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="
                        p-10
                        text-center
                        text-slate-500
                      "
                    >
                      {tr(
                        'Không có dữ liệu phù hợp.',
                        'No matching records.'
                      )}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
