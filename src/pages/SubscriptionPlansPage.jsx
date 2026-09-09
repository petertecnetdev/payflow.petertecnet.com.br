import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/subscription-plans.css';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/v1/apps/payflow/subscription-plans')
      .then(({ data }) => {
        if (active) setPlans(data?.data?.plans || []);
      })
      .catch(() => active && setError('Não foi possível carregar os planos agora.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const choose = (plan) => {
    localStorage.setItem('pending_subscription_plan', JSON.stringify({
      application: 'payflow',
      plan: plan.code,
      selected_at: new Date().toISOString()
    }));

    const authenticated = Boolean(localStorage.getItem('petertecnet_token'));
    window.location.assign(authenticated ? `/app?plan=${encodeURIComponent(plan.code)}` : `/login?plan=${encodeURIComponent(plan.code)}`);
  };

  return (
    <main className="subscription-plans-page">
      <header className="subscription-plans-hero">
        <span>PayFlow</span>
        <h1>Planos para transformar oportunidades em receita</h1>
        <p>Clientes, propostas, cobranças, follow-up e automações em uma única operação comercial.</p>
      </header>

      {loading && <p className="subscription-plans-status">Carregando planos…</p>}
      {error && <p className="subscription-plans-error">{error}</p>}

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
            <button type="button" onClick={() => choose(plan)}>Escolher {plan.name}</button>
          </article>
        ))}
      </section>
    </main>
  );
}
