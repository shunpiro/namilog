// ===== サービスワーカー：アプリの画面をスマホに保存して、すばやく・電波が弱くても開けるようにする =====
// アプリを更新したら、下の VERSION の数字を1つ上げてください（古い画面が残らないように）。
const VERSION = 'namilog-v2';
const SHELL = ['./', './index.html', './app.js', './config.js', './seed.js', './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// 自分のサイトのファイル：まずネットから最新を取り、ダメならスマホに保存した分を使う
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Supabaseの道具（cdn.jsdelivr.net）は一度取ったらスマホに保存して使い回す
  if (e.request.method === 'GET' && url.host === 'cdn.jsdelivr.net') {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
    })));
    return;
  }
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Supabase・Geminiへの通信は触らない
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
