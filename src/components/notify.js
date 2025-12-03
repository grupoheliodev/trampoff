// Simple notification utilities used by chat pages

export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export async function notify({ title, body, icon, tag, data }) {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    // Prefer service worker to allow notifications even when tab not focused
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title || 'TrampOff', {
          body: body || '',
          icon: icon || '/icons/icon-192.png',
          tag: tag || undefined,
          data: data || undefined,
          badge: '/icons/icon-192.png',
          requireInteraction: false,
        });
        return true;
      }
    }

    // Fallback to page-level notification
    // eslint-disable-next-line no-new
    new Notification(title || 'TrampOff', {
      body: body || '',
      icon: icon || '/icons/icon-192.png',
      tag: tag || undefined,
      data: data || undefined,
    });
    return true;
  } catch (e) {
    console.warn('notify() failed:', e);
    return false;
  }
}
