import api from './api';

const APPLICATION = 'payflow';
const SOURCE = 'subscription_plans';
const REQUEST_TIMEOUT_MS = 1200;

const storageKey = (planCode) => `subscription_intent_idempotency:${APPLICATION}:${planCode}`;

const createKey = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export function getSubscriptionIntentIdempotencyKey(planCode) {
  const key = storageKey(planCode);
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;

  const created = createKey();
  sessionStorage.setItem(key, created);
  return created;
}

export async function createSubscriptionIntent({ plan, handoff }) {
  const token = localStorage.getItem('petertecnet_token');
  if (!token || !plan?.code) return null;

  const idempotencyKey = getSubscriptionIntentIdempotencyKey(plan.code);

  try {
    const { data } = await api.post(
      `/v1/apps/${APPLICATION}/subscription-intents`,
      {
        plan_code: plan.code,
        source: SOURCE,
        handoff_channel: handoff,
        metadata: {
          client_price_cents: plan.price_cents ?? null,
          page: window.location.pathname
        }
      },
      {
        headers: { 'Idempotency-Key': idempotencyKey },
        timeout: REQUEST_TIMEOUT_MS
      }
    );

    return data?.data || null;
  } catch {
    return null;
  }
}
