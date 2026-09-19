import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { createSubscriptionIntent } from '../services/subscriptionIntent';
import { trackSubscriptionHandoff } from '../services/subscriptionTelemetry';
import { buildPeterWhatsappUrl, getPeterWhatsapp } from '../utils/peterWhatsappFallback';
import '../styles/subscription-plans.css';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salesWhatsapp, setSalesWhatsapp] = useState(null);
  const [submittingPlan, setSubmittingPlan] = useState(null);

  useEffect(() => {
    let active = true;

    api.get('/v1/apps/payflow/subscription-plans')
      .then(({ data }) => {
        if (active) setPlans(data?.data?.plans || []);
      })
      .catch(() => active && setError('Os planos não puderam ser carregados agora. Você ainda pode falar com nosso atendimento para contratar o PayFlow.'))
      .finally(() => active && setLoading(false));

    getPeterWhatsapp().then((url) => {
      if (active) setSalesWhatsapp(url);
    });

    return () => { active = false; };
  }, []);

  const choose = async (plan) => {
    if (submittingPlan) return;
    setSubmittingPlan(plan.code);

    const salesUrl = buildPeterWhatsappUrl(salesWhatsapp, [
      'Olá! Vim pelo PayFlow e quero contratar um plano.',
      `Plano: ${plan.name} (${plan.code})`,
      `Valor exibido: ${money.format(plan.price ?? plan.price_cents / 100)}/mês.`,
      'Pode me orientar para concluir a contratação?'
    ].join('\n'));
    const handoff = salesUrl ? 'whatsapp' : 'app';

    const pendingPlan = {
      application: 'payflow',
      plan: plan.code,
      price_cents: plan.price_cents,
      currency: plan.currency || 'BRL',
      selected_at: new Date().toISOString(),
      source: 'subscription_plans',
      handoff
    };

    localStorage.setItem('pending_subscription_plan', JSON.stringify(pendingPlan));

    const intent = await createSubscriptionIntent({ plan, handoff });
    if (intent?.id) {
      localStorage.setItem('pending_subscription_plan', JSON.stringify({
        ...pendingPlan,
        intent_id: intent.id,
        intent_status: intent.status,
        price_cents: intent.price_cents,
        currency: intent.currency || pendingPlan.currency
      }));
    }

    trackSubscriptionHandoff({ plan, handoff });

    if (salesUrl) {
      window.location.assign(salesUrl);
      return;
    }

    const authenticated = Boolean(localStorage.getItem('petertecnet_token'));
    window.location.assign(authenticated ? `/app?plan=${encodeURIComponent(plan.code)}` : `/login?plan=${encodeURIComponent(plan.code)}`);
  };

  const contactSales = () => {
    const salesUrl = buildPeterWhatsappUrl(salesWhatsapp, [
      'Olá! Vim pela página de planos do PayFlow.',
      'Quero conhecer os planos disponíveis e concluir a contratação.'
    ].join('\n'));

    trackSubscriptionHandoff({
      plan: { code: 'plans_unavailable', price_cents: null },
      handoff: salesUrl ? 'whatsapp' : 'login'
    });

    window.location.assign(salesUrl || '/login?intent=subscription');
  };

  return (
    <main className="subscription-plans-page">
      <header className="subscription-plans-hero">
        <span>PayFlow</span>
        <h1>Planos para transformar oportunidades em receita</h1>
        <p>Clientes, propostas, cobranças, follow-up e automações em uma única operação comercial.</p>
      </header>

      {loading && <p className="subscription-plans-status">Carregando planos…</p>}
      {error && (
        <div className="subscription-plans-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={contactSales}>Falar com o comercial</button>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="subscription-plans-error" role="status">
          <p>Os planos estão temporariamente indisponíveis para consulta.</p>
          <button type="button" onClick={contactSales}>Quero contratar o PayFlow</button>
        </div>
      )}

      <section className="subscription-plans-grid" aria-label="Planos PayFlow">
        {plans.map((plan) => (
          <article className={`subscription-plan-card${plan.recommended ? ' is-recommended' : ''}`} key={plan.id || plan.code}>
            {plan.recommended && <div className="subscription-plan-badge">Mais escolhido</div>}
            <h2>{plan.name}</h2>
            <div className="subscription-plan-price">
              <strong>{money.format(plan.price ?? plan.price_cents / 100)}</strong>
              <small>/mês</small>
            </div>
            <ul>
              {(plan.features || []).map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <button type="button" disabled={Boolean(submittingPlan)} onClick={() => choose(plan)}>
              {submittingPlan === plan.code ? 'Preparando contratação…' : `Solicitar ${plan.name}`}
            </button>
            <small className="subscription-plan-handoff">
              A contratação é concluída com o atendimento comercial. Nenhuma cobrança é feita sem sua confirmação.
            </small>
          </article>
        ))}
      </section>
    </main>
  );
}
