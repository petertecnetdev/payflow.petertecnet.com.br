const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due', 'grace_period']);

const toTimestamp = (value) => {
  if (!value) return null;
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export function normalizeEntitlement(entitlement, now = Date.now()) {
  if (!entitlement || typeof entitlement !== 'object') {
    return { active: false, status: 'unknown', feature: null, planCode: null };
  }

  const status = String(entitlement.status || entitlement.subscription_status || '').toLowerCase();
  const validUntil = toTimestamp(entitlement.valid_until || entitlement.current_period_end || entitlement.trial_ends_at);
  const withinPeriod = validUntil == null || validUntil > now;
  const active = ACTIVE_STATUSES.has(status) && withinPeriod;

  return {
    active,
    status: status || 'unknown',
    feature: entitlement.feature || entitlement.feature_code || null,
    planCode: entitlement.plan_code || entitlement.plan?.code || null,
    validUntil
  };
}

export function hasFeatureAccess({ entitlements = [], feature, now = Date.now() } = {}) {
  if (!feature || !Array.isArray(entitlements)) return false;
  return entitlements.some((entitlement) => {
    const normalized = normalizeEntitlement(entitlement, now);
    return normalized.active && normalized.feature === feature;
  });
}

export function resolvePlanFeatures({ subscription, plan, now = Date.now() } = {}) {
  const status = String(subscription?.status || '').toLowerCase();
  const validUntil = toTimestamp(subscription?.current_period_end || subscription?.trial_ends_at);
  const active = ACTIVE_STATUSES.has(status) && (validUntil == null || validUntil > now);
  if (!active || !plan) return [];
  return Array.isArray(plan.features) ? plan.features.filter(Boolean) : [];
}
