// Enterprise Real-Time Pub/Sub Event Pipeline — WebSocket Standard

export const CHANNELS = {
  USER_ACTIVITY: 'channel:user_activity',
  CATALOG_UPDATES: 'channel:catalog_updates',
  ADMIN_AUDIT: 'channel:admin_audit',
  LEDGER_TRANSACTIONS: 'channel:ledger_transactions'
};

const listeners = new Map();

/**
 * Publish event message to a channel
 */
export function publish(channel, data) {
  const eventMessage = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    channel,
    timestamp: new Date().toISOString(),
    data
  };

  // Trigger internal in-memory subscribers
  if (listeners.has(channel)) {
    listeners.get(channel).forEach(cb => {
      try {
        cb(eventMessage);
      } catch (err) {
        console.error(`[EventBus] Callback error on channel ${channel}`, err);
      }
    });
  }

  // Dispatch global window event for cross-component / cross-tab sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('STAGEPASS_EVENT_BUS', { detail: eventMessage }));
    window.dispatchEvent(new CustomEvent('stagepass_db_update', { detail: eventMessage }));
  }

  return eventMessage;
}

/**
 * Subscribe to a channel
 */
export function subscribe(channel, callback) {
  if (!listeners.has(channel)) {
    listeners.set(channel, new Set());
  }
  listeners.get(channel).add(callback);

  // Global window listener wrapper
  const handleWindowEvent = (evt) => {
    if (evt.detail && (evt.detail.channel === channel || channel === '*')) {
      callback(evt.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('STAGEPASS_EVENT_BUS', handleWindowEvent);
  }

  // Return unsubscribe function
  return () => {
    if (listeners.has(channel)) {
      listeners.get(channel).delete(callback);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('STAGEPASS_EVENT_BUS', handleWindowEvent);
    }
  };
}
