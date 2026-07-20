// ============================================================================
// TIEN ICH XUAT ANH DUNG CHUNG
// Gom logic nhan dien thiet bi + gioi han canvas + luu anh cho MOI trang.
// Truoc day 4 file (Standings, Schedule, KnockoutBracket, QualifiedTeams)
// deu tu viet lai -> moi cho mot kieu, sua cho nay quen cho kia.
// ============================================================================

import { snapdom } from '@zumer/snapdom';

// ─── 1. NHAN DIEN THIET BI ───────────────────────────────────────────────────

/**
 * May co man hinh cam ung khong (dung de doan iPad/iPhone).
 * Tu iPadOS 13 (2019), Safari tren iPad bao User-Agent GIONG HET macOS:
 *   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ... Safari/605.1.15"
 * Nghia la chuoi "iPad" KHONG con xuat hien -> regex /iPad/ luon truot.
 * Cach duy nhat phan biet iPad voi Mac that: Mac KHONG co man hinh cam ung,
 * nen maxTouchPoints > 1 chi dung voi iPad.
 */
export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // iPhone / iPod / iPad cu (iOS 12 tro xuong) van co ten trong UA
  if (/iPhone|iPod|iPad/i.test(ua)) return true;
  // iPad tu iPadOS 13 tro len: UA giong macOS, phai kiem tra cam ung
  const macLike = /Macintosh|Mac OS X/i.test(ua);
  const hasTouch = (navigator.maxTouchPoints || 0) > 1;
  return macLike && hasTouch;
}

/** Android (dien thoai hoac may tinh bang). */
export function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}

/**
 * Thiet bi co CHAN tai file tu dong khong.
 * Safari tren iOS/iPadOS chan thuoc tinh download cua the <a>, nen phai
 * hien anh len de nguoi dung NHAN GIU va chon "Them vao Anh".
 * Android Chrome tai binh thuong nen khong can.
 */
export function needsLongPressSave() {
  return isIOS();
}

/** Man hinh hep (dien thoai dung) — dung de chinh bo cuc, KHONG dung de doan he dieu hanh. */
export function isNarrowScreen() {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

// ─── 2. GIOI HAN CANVAS THEO TUNG DONG MAY ───────────────────────────────────

/**
 * Gioi han kich thuoc canvas cua thiet bi hien tai.
 * Vuot qua -> trinh duyet KHONG bao loi ma lang le tra ve canvas TRANG,
 * toDataURL() cho chuoi rong -> anh hong (hien icon "?").
 *
 * So lieu thuc te:
 *   - iPhone / iPad (Safari): 4096px moi chieu, tong ~16.7 trieu pixel
 *   - Android Chrome:        thuong 8192px, nhung may yeu chi 4096 -> lay 4096 cho an toan
 *   - May tinh:              16384px, tong rat lon -> de thoai mai hon
 */
export function getCanvasLimits() {
  // iOS: gioi han 4096px moi chieu. Ha tong xuong 5 trieu diem anh vi iOS con
  // gioi han DO DAI CHUOI dataURL (~2MB la bat dau that bai tren may cu).
  // 5 trieu diem anh -> JPEG q0.92 khoang 1.2MB -> tao dataURL an toan.
  if (isIOS()) return { maxDim: 4096, maxPixels: 5_000_000 };
  if (isAndroid()) return { maxDim: 4096, maxPixels: 16_000_000 };
  return { maxDim: 8192, maxPixels: 40_000_000 };
}

/**
 * Tinh he so phong to an toan cho phan tu can chup.
 * Tu dong thu nho neu noi dung qua lon (vd lich 120 tran cao 8000px).
 * @param {HTMLElement} el phan tu se chup
 * @param {number} desired he so mong muon (mac dinh 2 cho anh net)
 */
export function computeSafeScale(el, desired = 2) {
  const W = el?.scrollWidth || 1200;
  const H = el?.scrollHeight || 800;
  const { maxDim, maxPixels } = getCanvasLimits();
  let scale = Math.min(
    maxDim / W,
    maxDim / H,
    Math.sqrt(maxPixels / (W * H)),
    desired
  );
  // Cho phep nho hon 1x: noi dung rat cao BUOC phai thu nho,
  // neu dat san 1x thi canvas van vuot gioi han -> anh hong.
  return Math.max(0.4, scale);
}

// ─── 3. CHUAN BI ANH TRUOC KHI CHUP ──────────────────────────────────────────

/**
 * snapdom khong nhung duoc <img src="data:..."> hoac anh khac domain,
 * nen ve truoc len canvas roi thay tam. Tra ve ham hoan tac.
 */
export async function rasterizeImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  const restores = await Promise.all(imgs.map(img => new Promise(resolve => {
    const done = () => resolve(() => {});
    try {
      if (!img.src) return done();
      const draw = (source) => {
        try {
          const w = source.naturalWidth || source.width || img.clientWidth || 32;
          const h = source.naturalHeight || source.height || img.clientHeight || 32;
          if (!w || !h) return done();
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(source, 0, 0, w, h);
          const old = img.src;
          img.src = cv.toDataURL('image/png');
          resolve(() => { img.src = old; });
        } catch { done(); }
      };
      if (img.complete && img.naturalWidth) return draw(img);
      const tmp = new Image();
      tmp.crossOrigin = 'anonymous';
      tmp.onload = () => draw(tmp);
      tmp.onerror = done;
      tmp.src = img.src;
    } catch { done(); }
  })));
  return () => restores.forEach(fn => fn && fn());
}

// ─── 4. HIEN ANH DE NHAN GIU LUU (iOS) ───────────────────────────────────────

/**
 * Phu anh full man hinh de nguoi dung NHAN GIU -> "Them vao Anh".
 * Dung cho iOS/iPadOS vi Safari chan tai file tu dong.
 */
export function showImageOverlay(dataUrl, language = 'vi') {
  const tr = (vi, en) => (language === 'en' ? en : vi);
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);' +
    'display:flex;flex-direction:column;align-items:center;justify-content:flex-start;' +
    'padding:16px;overflow:auto;-webkit-overflow-scrolling:touch';

  const hint = document.createElement('p');
  hint.textContent = tr('Nhấn giữ vào ảnh → chọn "Thêm vào Ảnh" hoặc "Lưu vào Ảnh"',
                        'Press and hold the image → "Add to Photos"');
  hint.style.cssText =
    'color:#fff;font:600 15px/1.4 system-ui,-apple-system,sans-serif;' +
    'text-align:center;margin:4px 0 12px;flex-shrink:0';

  const img = document.createElement('img');
  img.src = dataUrl;
  img.style.cssText =
    'max-width:100%;height:auto;border-radius:12px;display:block;' +
    '-webkit-touch-callout:default;flex-shrink:0';

  const btn = document.createElement('button');
  btn.textContent = tr('Đóng', 'Close');
  btn.style.cssText =
    'margin:16px 0 8px;padding:12px 32px;border:0;border-radius:12px;' +
    'background:#38bdf8;color:#fff;font:700 15px system-ui,sans-serif;flex-shrink:0';
  btn.onclick = () => overlay.remove();

  overlay.append(hint, img, btn);
  document.body.appendChild(overlay);
}

// ─── 5. HAM CHINH: CHUP VA LUU ───────────────────────────────────────────────

/**
 * Chup phan tu va luu anh, tu chon cach phu hop voi tung thiet bi.
 *
 * @param {HTMLElement} el        phan tu can chup
 * @param {object}      opts
 * @param {string}      opts.filename   ten file (khong can duoi .png)
 * @param {string}      opts.background mau nen
 * @param {string}      opts.language   'vi' | 'en'
 * @param {number}      opts.scale      he so mong muon (mac dinh 2)
 * @returns {Promise<boolean>} true neu thanh cong
 */
export async function captureAndSave(el, opts = {}) {
  const {
    filename = 'anh',
    background = '#0a0f1d',
    language = 'vi',
    scale: desiredScale = 2,
  } = opts;

  if (!el) return false;
  const safeName = String(filename).replace(/[^a-zA-Z0-9_-]/g, '_');
  let restore = () => {};

  try {
    restore = await rasterizeImages(el);
    // Cho trinh duyet ve xong anh vua thay
    await new Promise(r => setTimeout(r, 120));

    const scale = computeSafeScale(el, desiredScale);
    const result = await snapdom(el, { scale, backgroundColor: background });

    if (needsLongPressSave()) {
      // ── iOS/iPadOS: Safari chan tai file tu dong ──
      // Cach dang tin nhat: hien anh len de nguoi dung NHAN GIU -> "Thêm vào Ảnh".
      // Nhung iOS gioi han do dai chuoi dataURL: anh PNG vai MB se tao that bai
      // -> truoc day roi xuong download() va iOS coi la "Tep", khong co "Lưu vào Ảnh".
      //
      // Khac phuc: anh lon thi xuat JPEG thay PNG (nhe hon ~5 lan).
      // BXH/lich deu co nen dac nen mat kenh trong suot khong anh huong gi.
      let canvas = null;
      try { canvas = await result.toCanvas(); } catch { canvas = null; }

      if (canvas) {
        const pixels = canvas.width * canvas.height;
        // Tren ~1.2 trieu diem anh thi PNG da nang hon 2MB -> dataURL de that bai.
        // Doi sang JPEG (nhe hon ~5 lan). Anh BXH/lich deu co nen dac nen
        // mat kenh trong suot khong anh huong gi.
        const useJpeg = pixels > 1_200_000;
        const mime = useJpeg ? 'image/jpeg' : 'image/png';
        const quality = useJpeg ? 0.92 : undefined;

        let dataUrl = '';
        try { dataUrl = canvas.toDataURL(mime, quality); } catch { dataUrl = ''; }

        // Van qua nang -> ha chat luong them mot nac
        if ((!dataUrl || dataUrl.length < 1000) && useJpeg) {
          try { dataUrl = canvas.toDataURL('image/jpeg', 0.8); } catch { dataUrl = ''; }
        }

        if (dataUrl && dataUrl.startsWith('data:image/') && dataUrl.length > 1000) {
          showImageOverlay(dataUrl, language);
          return true;
        }

        // Du phong: tai file qua Blob, co duoi ro rang de iOS nhan la anh
        try {
          const blob = await new Promise(res => canvas.toBlob(res, mime, quality));
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeName}.${useJpeg ? 'jpg' : 'png'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
            return true;
          }
        } catch { /* roi xuong duong cuoi */ }
      }

      await result.download({ format: 'png', filename: safeName });
      return true;
    }

    // May tinh / Android: tai file binh thuong
    await result.download({ format: 'png', filename: safeName });
    return true;
  } catch (err) {
    console.error('captureAndSave error:', err);
    return false;
  } finally {
    restore();
  }
}