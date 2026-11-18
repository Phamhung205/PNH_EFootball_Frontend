// src/utils/logoUpload.js
// Anh nen (banner) hien tren the giai dau o trang danh sach giai.
// Bat buoc dung TI LE 3:1 de hien dep, khong bi cat/keo gian.
//
//  - File > MAX_FILE_BYTES            -> bao loi dung luong
//  - Sai ti le (khac 3:1 qua 5%)      -> bao loi + yeu cau ti le / kich thuoc
//  - Qua nho (< MIN_W x MIN_H)        -> bao loi
//  - Dat yeu cau -> thu ve OUT_W x OUT_H va nen lai
//  - Nen xong van > MAX_RESULT_BYTES  -> bao loi

export const RATIO_W = 3;
export const RATIO_H = 1;
export const REC_W = 1200;            // kich thuoc de nghi
export const REC_H = 400;
export const MIN_W = 600;
export const MIN_H = 200;
export const OUT_W = 960;             // kich thuoc luu (du net tren man hinh 2x)
export const OUT_H = 320;
export const RATIO_TOLERANCE = 0.05;  // cho phep lech 5%
export const MAX_FILE_BYTES = 2 * 1024 * 1024;   // 2 MB: file chon tu may
export const MAX_RESULT_BYTES = 250 * 1024;      // 250 KB: anh luu vao DB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export const LOGO_HINT_VI =
  `Ảnh nền giải đấu: tỉ lệ ${RATIO_W}:${RATIO_H} (khuyên dùng ${REC_W} × ${REC_H} px), JPG/PNG/WebP, tối đa 2 MB.`;
export const LOGO_HINT_EN =
  `Tournament cover: ${RATIO_W}:${RATIO_H} ratio (recommended ${REC_W} × ${REC_H} px), JPG/PNG/WebP, max 2 MB.`;

const fmt = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
const dataUrlBytes = (u) => Math.floor(((u.split(',')[1] || '').length * 3) / 4);

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(new Error('Không đọc được ảnh. Vui lòng chọn ảnh khác.'));
    r.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Tệp không phải ảnh hợp lệ.'));
    img.src = src;
  });

/**
 * Nhan 1 File, tra ve data URL da nen (OUT_W x OUT_H).
 * Nem Error (message tieng Viet) neu khong dat -> noi goi hien canh bao.
 */
export async function prepareLogo(file) {
  if (!file) throw new Error('Chưa chọn ảnh.');

  if (!ALLOWED.includes(file.type)) {
    throw new Error('Chỉ nhận ảnh JPG, PNG hoặc WebP.');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `Ảnh quá nặng (${fmt(file.size)}). Tối đa ${fmt(MAX_FILE_BYTES)}. Vui lòng chọn ảnh nhỏ hơn.`
    );
  }

  const img = await loadImage(await readFile(file));
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  // Kiem tra ti le
  const target = RATIO_W / RATIO_H;
  const actual = w / h;
  if (Math.abs(actual - target) / target > RATIO_TOLERANCE) {
    throw new Error(
      `Ảnh có kích thước ${w} × ${h} px (tỉ lệ ${actual.toFixed(2)}:1) không đúng yêu cầu. ` +
      `Vui lòng dùng ảnh tỉ lệ ${RATIO_W}:${RATIO_H} (ngang gấp ${RATIO_W} lần cao), ` +
      `ví dụ ${REC_W} × ${REC_H} px hoặc ${MIN_W} × ${MIN_H} px.`
    );
  }

  // Kiem tra do phan giai toi thieu
  if (w < MIN_W || h < MIN_H) {
    throw new Error(
      `Ảnh quá nhỏ (${w} × ${h} px). Tối thiểu ${MIN_W} × ${MIN_H} px, khuyên dùng ${REC_W} × ${REC_H} px (tỉ lệ ${RATIO_W}:${RATIO_H}).`
    );
  }

  // Thu ve kich thuoc luu chuan
  const canvas = document.createElement('canvas');
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  canvas.getContext('2d').drawImage(img, 0, 0, OUT_W, OUT_H);

  let out = '';
  for (const q of [0.85, 0.75, 0.65, 0.5]) {
    out = canvas.toDataURL('image/webp', q);
    if (!out.startsWith('data:image/webp')) break;      // trinh duyet khong ho tro WebP
    if (dataUrlBytes(out) <= MAX_RESULT_BYTES) return out;
  }
  if (!out.startsWith('data:image/webp')) {
    for (const q of [0.85, 0.7, 0.55]) {
      out = canvas.toDataURL('image/jpeg', q);
      if (dataUrlBytes(out) <= MAX_RESULT_BYTES) return out;
    }
  }

  throw new Error(
    `Ảnh vẫn quá nặng sau khi nén (${fmt(dataUrlBytes(out))}, tối đa ${fmt(MAX_RESULT_BYTES)}). ` +
    `Vui lòng chọn ảnh đơn giản hơn (ít chi tiết/màu) với tỉ lệ ${RATIO_W}:${RATIO_H}.`
  );
}