if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const registerSW = () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(registerSW, { timeout: 3000 });
    } else {
      setTimeout(registerSW, 1500);
    }
  });
}
