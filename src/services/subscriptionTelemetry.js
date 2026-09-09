const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.petertecnet.com.br/api';
const SESSION_STORAGE_KEY = 'petertecnet_telemetry_session_id';

const makeId = (prefix) => {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${random}`;
};

export const getTelemetrySessionId = () => {
  try {
    const current = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (current) return current;

    const created = makeId('payflow');
    sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return makeId('payflow');
  }
};

export const buildSubscriptionHandoffEvent = ({ plan, handoff }) => ({
  id: makeId('subscription-handoff'),
  type: 'subscription_sales_handoff_started',
  timestamp: new Date().toISOString(),
  page: window.location.pathname,
  label: plan.code,
  target: handoff,
  metadata: {
    application: 'payflow',
    plan_code: plan.code,
    plan_name: plan.name,
    price_cents: Number(plan.price_cents ?? Math.round(Number(plan.price || 0) * 100)),
    currency: plan.currency || 'BRL',
    source: 'subscription_plans',
    handoff
  }
});

export const trackSubscriptionHandoff = ({ plan, handoff }) => {
  try {
    const token = localStorage.getItem('petertecnet_token');
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Peter-App': 'payflow'
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/interactions/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: getTelemetrySessionId(),
        events: [buildSubscriptionHandoffEvent({ plan, handoff })]
      }),
      keepalive: true,
      credentials: 'omit'
    }).catch(() => {});
  } catch {
    // Revenue telemetry must never block or alter the sales handoff.
  }
};
