// ISA 포트폴리오 앱 서비스워커
// 목적: GitHub Pages 배포본을 "홈 화면에 추가"했을 때 오프라인에서도 앱이 열리도록 최소한의 캐싱만 수행합니다.
// 실제 보유종목 데이터는 여기서 다루지 않습니다 (그건 localStorage + 비공개 저장소 holdings.json 몫).

const CACHE_NAME = 'isa-portfolio-v1';
const ASSET_PATHS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_PATHS)).catch(() => {
      // 캐시 대상 중 일부가 없어도 설치 자체는 계속 진행
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 네트워크 우선, 실패 시 캐시로 폴백 (오프라인 대비)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
