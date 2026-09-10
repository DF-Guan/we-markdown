/**
 * WeMarkdown 原生 PWA Service Worker (sw.js)
 * 采用 Cache-First + Stale-While-Revalidate 离线策略，实现毫秒级秒开与全功能离线写作
 */

const CACHE_NAME = "wemarkdown-sw-v1.3.0";

// 预缓存核心应用壳静态资源
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./favicon.ico",
  "./logo-128.png",
  "./logo-192.png",
  "./logo-512.png",
];

// 安装阶段：预缓存核心骨架并立即激活
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn("[WeMarkdown SW] 预缓存部分资源失败，继续保持运行:", err);
      }),
  );
});

// 激活阶段：立即接管页面并自动清理旧版本缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// 拦截请求并执行离线回退策略
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // 仅缓存 GET 请求
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // 排除外部大模型接口与分析埋点
  if (
    url.hostname.includes("deepseek.com") ||
    url.hostname.includes("siliconflow.cn") ||
    url.hostname.includes("openai.com") ||
    url.hostname.includes("anthropic.com") ||
    url.hostname.includes("googletagmanager.com") ||
    url.hostname.includes("google-analytics.com")
  ) {
    return;
  }

  // 1. 针对主页面导航请求：采用 Network-First，离线时回退到缓存的 index.html
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match("./index.html").then((cached) => {
            return (
              cached ||
              caches.match("./") ||
              new Response("WeMarkdown 离线脱机模式已就绪", {
                headers: { "Content-Type": "text/html; charset=utf-8" },
              })
            );
          });
        }),
    );
    return;
  }

  // 2. 针对静态资源（JS, CSS, 图片, 字体等）：采用 Stale-While-Revalidate / Cache-First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 离线无网状态下，静默返回已缓存内容
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    }),
  );
});
