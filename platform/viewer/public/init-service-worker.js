const supportsServiceWorker = 'serviceWorker' in navigator;
const supportsCaches = 'caches' in window;

async function unregisterAllServiceWorkers() {
  if (!supportsServiceWorker) {
    return false;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  if (!registrations.length) {
    return false;
  }

  await Promise.all(registrations.map(registration => registration.unregister()));
  return true;
}

async function clearAllBrowserCaches() {
  if (!supportsCaches) {
    return;
  }

  const cacheKeys = await caches.keys();
  await Promise.all(cacheKeys.map(cacheKey => caches.delete(cacheKey)));
}

(async () => {
  try {
    const hadServiceWorkers = await unregisterAllServiceWorkers();
    await clearAllBrowserCaches();

    // Reload once after unregistering so the current tab is detached from old SW control.
    if (hadServiceWorkers) {
      window.location.reload();
    }
  } catch (error) {
    console.warn('Failed to clear service worker state.', error);
  }
})();
