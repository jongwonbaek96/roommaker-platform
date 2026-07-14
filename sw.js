const CACHE = 'roommaker-v3';
const CORE = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png'];
const FRESH = ['registry.json', 'config.js', 'index.html'];
// 접속 게이트(/play/*)와 게임 본문(*.html)은 캐시하지 않는다.
// 캐시되면 무효화된 토큰·만료된 세션으로도 오프라인 사본이 열려 게이트가 뚫린다.
const NO_CACHE = (p) => p.startsWith('/play/') || (p.startsWith('/games/') && p.endsWith('.html'));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (NO_CACHE(url.pathname)) return; // 서비스워커가 손대지 않고 네트워크로 그대로 보낸다
  if (FRESH.some(f => url.pathname.endsWith(f))) {
    e.respondWith(fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
