import { buildSubscriptionHandoffEvent } from './subscriptionTelemetry';

describe('subscription handoff telemetry', () => {
  test('records the economic context required to measure plan conversion', () => {
    window.history.pushState({}, '', '/planos');

    const event = buildSubscriptionHandoffEvent({
      plan: {
        code: 'growth',
        name: 'Growth',
        price_cents: 9900,
        currency: 'BRL'
      },
      handoff: 'whatsapp'
    });

    expect(event.type).toBe('subscription_sales_handoff_started');
    expect(event.page).toBe('/planos');
    expect(event.label).toBe('growth');
    expect(event.target).toBe('whatsapp');
    expect(event.metadata).toEqual({
      application: 'payflow',
      plan_code: 'growth',
      plan_name: 'Growth',
      price_cents: 9900,
      currency: 'BRL',
      source: 'subscription_plans',
      handoff: 'whatsapp'
    });
  });

  test('normalizes decimal plan prices when cents are not supplied', () => {
    const event = buildSubscriptionHandoffEvent({
      plan: { code: 'starter', name: 'Starter', price: 49.9 },
      handoff: 'app'
    });

    expect(event.metadata.price_cents).toBe(4990);
    expect(event.metadata.currency).toBe('BRL');
  });
});
