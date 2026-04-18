import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  return registerSW({
    immediate: true,
    onNeedRefresh() {
      if (window.confirm('New content available. Reload?')) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.info('Purandar Prime Propertys is ready to work offline.');
    },
    onRegistered(registration) {
      if (!registration) return;
      window.setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    },
  });
}

export default registerServiceWorker;
