// src/services/themeStore.js
// Noi tap trung doc/ghi va AP DUNG cai dat giao dien (mau, font, logo, sang/toi).
// Luu trong localStorage -> F5 van nho. Khong can backend o giai doan nay.

const STORAGE_KEY = 'pnh_ui_settings';

// Gia tri mac dinh khi chua tung luu
export const DEFAULT_UI = {
  accentPrimary: '#10b981',   // mau nhan chinh (Emerald)
  accentSecondary: '#06b6d4', // mau nhan phu (Cyan)
  font: 'inter',              // inter | roboto | outfit
  darkMode: true,             // true = toi, false = sang
  logoUrl: '',                // anh logo (dataURL base64) - rong neu chua co
  bannerUrl: '',              // anh banner (dataURL base64)
};

// Doc cai dat da luu (gop voi mac dinh de luon du field)
export function loadUiSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_UI };
    const saved = JSON.parse(raw);
    return { ...DEFAULT_UI, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_UI };
  }
}

// Ghi cai dat xuong localStorage
export function saveUiSettings(settings) {
  try {
    const merged = { ...DEFAULT_UI, ...(settings || {}) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return true;
  } catch {
    return false;
  }
}

// AP DUNG cai dat ra giao dien that:
//  - Mau nhan -> ghi vao bien CSS :root (--accent-primary/secondary)
//  - Font -> gan lop .font-xxx vao the <body>
// Goi ham nay moi khi doi cai dat hoac khi tai trang.
export function applyUiSettings(settings) {
  const s = { ...DEFAULT_UI, ...(settings || {}) };

  // 1) Mau nhan -> bien CSS toan trang
  const root = document.documentElement;
  root.style.setProperty('--accent-primary', s.accentPrimary || DEFAULT_UI.accentPrimary);
  root.style.setProperty('--accent-secondary', s.accentSecondary || DEFAULT_UI.accentSecondary);

  // 2) Font -> doi lop tren body (xoa lop font cu truoc)
  const body = document.body;
  body.classList.remove('font-inter', 'font-roboto', 'font-outfit');
  const fontClass = 'font-' + (s.font || 'inter');
  body.classList.add(fontClass);
}