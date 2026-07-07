// =====================================================
// MAXX FORGE STUDIO™ — Real-time Cross-tab Sync Layer
// Uses BroadcastChannel API for instant same-origin
// tab-to-tab delivery plus storage events as fallback.
// =====================================================

const CHANNEL_NAME = 'mfs_realtime';

let _channel = null;

function getChannel() {
  if (!_channel && typeof BroadcastChannel !== 'undefined') {
    _channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return _channel;
}

/**
 * Publish a real-time event to all other tabs on the same origin.
 * @param {string} event  - event name e.g. 'form_submitted', 'chat_sent', 'live_mode_changed'
 * @param {object} data   - arbitrary payload
 */
export function publish(event, data = {}) {
  const payload = { event, data, ts: Date.now() };

  // BroadcastChannel — instant, same-origin
  try {
    const ch = getChannel();
    if (ch) ch.postMessage(payload);
  } catch (e) {}

  // storage event as cross-tab fallback (also triggers on other tabs)
  try {
    localStorage.setItem('mfs_rt_last_event', JSON.stringify(payload));
  } catch (e) {}
}

/**
 * Subscribe to real-time events.
 * @param {string|string[]} events  - event name(s) to listen for, or '*' for all
 * @param {function} cb             - callback(event, data)
 * @returns {function}              - unsubscribe function
 */
export function subscribe(events, cb) {
  const eventSet = events === '*' ? null : new Set(Array.isArray(events) ? events : [events]);
  const matches = (e) => !eventSet || eventSet.has(e);

  const handleMsg = (msg) => {
    const payload = msg.data || msg; // BroadcastChannel gives msg.data
    if (payload && payload.event && matches(payload.event)) {
      cb(payload.event, payload.data);
    }
  };

  // BroadcastChannel listener
  const ch = getChannel();
  if (ch) ch.addEventListener('message', handleMsg);

  // storage event listener (fires in OTHER tabs when localStorage changes)
  const handleStorage = (e) => {
    if (e.key === 'mfs_rt_last_event' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload && payload.event && matches(payload.event)) {
          cb(payload.event, payload.data);
        }
      } catch (_) {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // Return cleanup
  return () => {
    if (ch) ch.removeEventListener('message', handleMsg);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Close the shared channel (call on app unmount if needed).
 */
export function closeChannel() {
  if (_channel) {
    _channel.close();
    _channel = null;
  }
}
