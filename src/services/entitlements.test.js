import { hasFeatureAccess, normalizeEntitlement, resolvePlanFeatures } from './entitlements';

describe('entitlements', () => {
  const now = Date.parse('2026-09-17T12:00:00Z');

  test('accepts active entitlement before its validity end', () => {
    expect(normalizeEntitlement({ status: 'active', feature_code: 'pipeline', valid_until: '2026-10-01T00:00:00Z' }, now)).toMatchObject({ active: true, feature: 'pipeline' });
  });

  test('denies expired trial and unknown status', () => {
    expect(normalizeEntitlement({ status: 'trialing', feature: 'reports', trial_ends_at: '2026-09-17T11:59:59Z' }, now).active).toBe(false);
    expect(normalizeEntitlement({ status: 'settled', feature: 'reports' }, now).active).toBe(false);
  });

  test('requires an active entitlement for premium feature access', () => {
    expect(hasFeatureAccess({
      entitlements: [
        { status: 'active', feature: 'pipeline' },
        { status: 'canceled', feature: 'reports' }
      ],
      feature: 'pipeline',
      now
    })).toBe(true);
    expect(hasFeatureAccess({ entitlements: [{ status: 'canceled', feature: 'reports' }], feature: 'reports', now })).toBe(false);
  });

  test('does not return plan features after downgrade or expiry', () => {
    expect(resolvePlanFeatures({
      subscription: { status: 'active', current_period_end: '2026-09-18T00:00:00Z' },
      plan: { features: ['pipeline', 'reports'] },
      now
    })).toEqual(['pipeline', 'reports']);
    expect(resolvePlanFeatures({
      subscription: { status: 'canceled', current_period_end: '2026-09-18T00:00:00Z' },
      plan: { features: ['pipeline'] },
      now
    })).toEqual([]);
  });
});
