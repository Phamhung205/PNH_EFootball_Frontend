import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardPaste, Download, Film, Link, Loader2, ShieldCheck } from 'lucide-react';
import { tiktokApi } from '../../../services/api';

export default function TikTokDownloader({ darkMode = true, language = 'vi' }) {
  const tr = (vi, en) => language === 'en' ? en : vi;
  const [url, setUrl] = useState('');
  const [video, setVideo] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const updateUrl = (value) => {
    setUrl(value);
    setVideo(null);
    setError('');
    setMessage('');
  };

  const showError = (err) => {
    if (!mounted.current) return;
    setError(err?.name === 'AbortError'
      ? tr('Xử lý quá lâu. Vui lòng thử lại.', 'The request timed out. Please try again.')
      : err?.message || tr('Không thể tải video. Vui lòng thử lại.', 'Unable to download this video. Please try again.'));
  };

  const paste = async () => {
    try {
      updateUrl(await navigator.clipboard.readText());
    } catch {
      setError(tr('Bạn có thể dán link trực tiếp vào ô bên dưới.', 'Paste the link directly into the field below.'));
    }
  };

  const resolve = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    setMessage('');
    setVideo(null);
    setBusy('resolve');
    try {
      const result = await tiktokApi.resolve(url.trim());
      if (mounted.current) setVideo(result);
    } catch (err) {
      showError(err);
    } finally {
      if (mounted.current) setBusy('');
    }
  };

  const download = async () => {
    if (busy || !video) return;
    setError('');
    setMessage('');
    setBusy('download');
    try {
      const blob = await tiktokApi.download(video.downloadToken);
      if (!mounted.current) return;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = video.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
      setMessage(tr('Đã tải video. Kiểm tra mục tải xuống của trình duyệt.', 'Video downloaded. Check your browser downloads.'));
    } catch (err) {
      showError(err);
    } finally {
      if (mounted.current) setBusy('');
    }
  };

  const panel = darkMode ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white shadow-sm';
  const muted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <section className={`mx-auto w-full max-w-3xl space-y-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
      <header className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-500">
          <Film size={25} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black sm:text-2xl">{tr('Tải video TikTok', 'TikTok video downloader')}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{tr('Dán link video để tải MP4 không có logo TikTok.', 'Paste a video link to download an MP4 without the TikTok watermark.')}</p>
        </div>
      </header>

      <form onSubmit={resolve} className={`space-y-4 rounded-2xl border p-4 sm:p-6 ${panel}`}>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="tiktok-video-url" className="text-sm font-bold">{tr('Link video TikTok', 'TikTok video link')}</label>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-black text-amber-600 dark:text-amber-400"><ShieldCheck size={12} /> ADMIN</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Link size={17} className={`pointer-events-none absolute left-3 top-3.5 ${muted}`} />
            <input id="tiktok-video-url" type="url" inputMode="url" autoComplete="off" required maxLength={2048}
              value={url} onChange={(event) => updateUrl(event.target.value)} disabled={!!busy}
              placeholder="https://www.tiktok.com/@.../video/..."
              className={`w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 ${darkMode ? 'border-slate-700 bg-slate-950 placeholder:text-slate-600' : 'border-slate-300 bg-slate-50 placeholder:text-slate-400'}`} />
          </div>
          <button type="button" onClick={paste} disabled={!!busy}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50 ${darkMode ? 'border-slate-700 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50'}`}>
            <ClipboardPaste size={16} /> {tr('Dán link', 'Paste link')}
          </button>
        </div>
        <p className={`text-xs leading-relaxed ${muted}`}>{tr('Hỗ trợ link video công khai và link chia sẻ vm.tiktok.com, vt.tiktok.com.', 'Supports public video links and vm.tiktok.com / vt.tiktok.com share links.')}</p>
        <button type="submit" disabled={!!busy || !url.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
          {busy === 'resolve' ? <Loader2 size={17} className="animate-spin" /> : <Film size={17} />}
          {busy === 'resolve' ? tr('Đang lấy video...', 'Finding video...') : tr('Lấy video', 'Find video')}
        </button>
      </form>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-500"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
      {message && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><span>{message}</span></div>}

      {video && (
        <article className={`flex flex-col gap-5 rounded-2xl border p-4 sm:flex-row sm:p-6 ${panel}`}>
          <div className={`flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:w-32 ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            {video.coverUrl ? <img src={video.coverUrl} alt={tr('Ảnh bìa video', 'Video cover')} className="h-full w-full object-contain" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <Film size={36} className={muted} />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
            <span className="rounded-md bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">MP4 · {video.quality} · {tr('Không logo TikTok', 'No TikTok watermark')}</span>
            <h2 className="w-full break-words text-lg font-bold">{video.title || tr('Video TikTok', 'TikTok video')}</h2>
            {video.author && <p className={`text-sm ${muted}`}>{video.author}</p>}
            <p className={`text-xs ${muted}`}>
              {video.duration > 0 && `${video.duration} ${tr('giây', 'seconds')}`}
              {video.sizeBytes > 0 && ` · ${(video.sizeBytes / 1024 / 1024).toFixed(1)} MB`}
            </p>
            <button type="button" onClick={download} disabled={!!busy} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
              {busy === 'download' ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
              {busy === 'download' ? tr('Đang tải video...', 'Downloading...') : tr('Tải MP4 không logo', 'Download watermark-free MP4')}
            </button>
            <p className={`text-[11px] ${muted}`}>{tr('Link tải có hiệu lực 15 phút. Nếu hết hạn, bấm “Lấy video” lại.', 'Download is available for 15 minutes. Find the video again if it expires.')}</p>
          </div>
        </article>
      )}
    </section>
  );
}
