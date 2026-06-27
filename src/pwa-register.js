// PWA service worker registration (safe for Vercel + Vite)

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Register only in secure contexts
  if (location.protocol !== "https:" && location.hostname !== "localhost")
    return;

  window.addEventListener("load", () => {
    const swUrl = "/service-worker.js";

    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        // eslint-disable-next-line no-console
        console.log("[PWA] Service worker registered:", reg);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[PWA] Service worker registration failed:", err);
      });
  });
}
