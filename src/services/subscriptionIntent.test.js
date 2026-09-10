import api from './api';
import { createSubscriptionIntent, getSubscriptionIntentIdempotencyKey } from './subscriptionIntent';

jest.mock('./api', () => ({
  __esModule: true,
  default: { post: jest.fn() }
}));

describe('subscription intent persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    api.post.mockReset();
    window.history.pushState({}, '', '/planos');
  });

  test('does not call the authenticated endpoint for anonymous visitors', async () => {
    const result = await createSubscriptionIntent({
      plan: { code: 'pro', price_cents: 7990 },
      handoff: 'whatsapp'
    });

    expect(result).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
  });

  test('persists authenticated high-intent plan selection with server-side pricing context', async () => {
    localStorage.setItem('petertecnet_token', 'token');
    sessionStorage.setItem('subscription_intent_idempotency:payflow:pro', 'intent-key-1');
    api.post.mockResolvedValue({
      data: {
        data: {
          id: '8f737c4c-a0fd-43ce-9b65-41697fe1a6c8',
          plan_code: 'pro',
          price_cents: 7990,
          currency: 'BRL',
          status: 'created'
        }
      }
    });

    const result = await createSubscriptionIntent({
      plan: { code: 'pro', price_cents: 1 },
      handoff: 'whatsapp'
    });

    expect(api.post).toHaveBeenCalledWith(
      '/v1/apps/payflow/subscription-intents',
      {
        plan_code: 'pro',
        source: 'subscription_plans',
        handoff_channel: 'whatsapp',
        metadata: {
          client_price_cents: 1,
          page: '/planos'
        }
      },
      {
        headers: { 'Idempotency-Key': 'intent-key-1' },
        timeout: 1200
      }
    );
    expect(result.price_cents).toBe(7990);
  });

  test('reuses one idempotency key per plan within the browser session', () => {
    const first = getSubscriptionIntentIdempotencyKey('starter');
    const second = getSubscriptionIntentIdempotencyKey('starter');

    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });

  test('fails open so analytics persistence cannot block a sale', async () => {
    localStorage.setItem('petertecnet_token', 'token');
    sessionStorage.setItem('subscription_intent_idempotency:payflow:business', 'intent-key-2');
    api.post.mockRejectedValue(new Error('network'));

    await expect(createSubscriptionIntent({
      plan: { code: 'business', price_cents: 14990 },
      handoff: 'whatsapp'
    })).resolves.toBeNull();
  });
});
