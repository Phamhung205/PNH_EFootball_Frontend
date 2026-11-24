// src/utils/facebookSdk.js
// Facebook JS SDK: nap script + dang nhap lay accessToken.
// Can bien moi truong: VITE_FACEBOOK_APP_ID (App ID cong khai, KHONG phai App Secret).

export const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

let sdkPromise = null;

/** Nap SDK 1 lan; resolve khi window.FB san sang. */
export function loadFacebookSdk() {
  if (!FACEBOOK_APP_ID) return Promise.reject(new Error('FB_NOT_CONFIGURED'));
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const init = () => {
      window.FB.init({ appId: FACEBOOK_APP_ID, cookie: false, xfbml: false, version: 'v21.0' });
      resolve(window.FB);
    };
    if (window.FB) { init(); return; }

    window.fbAsyncInit = init;
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    s.async = true;
    s.defer = true;
    s.crossOrigin = 'anonymous';
    s.onerror = () => { sdkPromise = null; reject(new Error('Không tải được Facebook SDK (có thể bị trình chặn quảng cáo chặn).')); };
    document.body.appendChild(s);
  });
  return sdkPromise;
}

/**
 * Mo cua so dang nhap Facebook. PHAI goi truc tiep trong su kien click
 * (da nap SDK truoc bang loadFacebookSdk) de trinh duyet khong chan popup.
 * callback(err, accessToken)
 */
export function facebookLogin(callback) {
  if (!window.FB) { callback(new Error('SDK_NOT_READY')); return; }
  // callback cua FB.login phai la ham thuong (khong async)
  window.FB.login(function (response) {
    const token = response?.authResponse?.accessToken;
    if (token) callback(null, token);
    else callback(new Error('CANCELLED'));
  }, { scope: 'public_profile,email', return_scopes: true });
}