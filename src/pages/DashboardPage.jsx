import React, { useEffect, useMemo, useState } from 'react';
import { BarChartLineFill, CashCoin, ChatDotsFill, FileEarmarkTextFill, PeopleFill, PersonBadgeFill, Robot, Wallet2 } from 'react-bootstrap-icons';
import { createPayflowEstablishment, getPayflowContext, getPayflowDashboard, getSelectedEstablishmentId, setSelectedEstablishmentId } from '../services/payflow';

const nav = [
  ['Visão geral', <BarChartLineFill />],
  ['Conversas', <ChatDotsFill />],
  ['Clientes', <PeopleFill />],
  ['Oportunidades', <PersonBadgeFill />],
  ['Propostas', <FileEarmarkTextFill />],
  ['Cobranças', <Wallet2 />],
  ['Agente IA', <Robot />]
];

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function apiMessage(error) {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.error && typeof data.error === 'string') return data.error;
  const first = data?.errors ? Object.values(data.errors).flat()[0] : null;
  return first || error?.message || 'Não foi possível concluir a operação.';
}

export default function DashboardPage() {
  const [context, setContext] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', fantasy: '', phone: '', email: '' });

  const establishments = context?.establishments || [];
  const selected = useMemo(() => establishments.find((item) => Number(item.id) === Number(selectedId)) || null, [establishments, selectedId]);

  async function loadContext(preferredId = null) {
    setLoading(true);
    setError('');
    try {
      const data = await getPayflowContext();
      setContext(data);
      const available = data?.establishments || [];
      const remembered = preferredId || getSelectedEstablishmentId();
      const next = available.find((item) => Number(item.id) === Number(remembered)) || available[0] || null;
      const nextId = next ? Number(next.id) : null;
      setSelectedId(nextId);
      setSelectedEstablishmentId(nextId);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDashboard(null);
      return;
    }
    let active = true;
    getPayflowDashboard(selectedId)
      .then((data) => active && setDashboard(data))
      .catch((err) => active && setError(apiMessage(err)));
    return () => { active = false; };
  }, [selectedId]);

  async function handleCreateCompany(event) {
    event.preventDefault();
    if (!context?.application?.id) return;
    setSaving(true);
    setError('');
    try {
      const establishment = await createPayflowEstablishment({ appId: context.application.id, ...form });
      await loadContext(establishment?.id || null);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function changeCompany(event) {
    const id = Number(event.target.value);
    setSelectedId(id);
    setSelectedEstablishmentId(id);
  }

  if (loading) {
    return <div className="pf-context-state"><div className="pf-context-spinner" /><h1>Preparando seu PayFlow</h1><p>Carregando sua empresa e o contexto comercial.</p></div>;
  }

  if (!context) {
    return <div className="pf-context-state"><h1>Não foi possível abrir o PayFlow</h1><p>{error}</p><button className="pf-button" onClick={() => loadContext()}>Tentar novamente</button></div>;
  }

  if (!establishments.length) {
    return (
      <div className="pf-onboarding-page">
        <div className="pf-onboarding-card">
          <div className="pf-brand"><span className="pf-brand-mark">P</span><span>Peter <strong>PayFlow</strong></span></div>
          <span className="pf-onboarding-kicker">Primeira configuração</span>
          <h1>Cadastre a empresa que o PayFlow vai vender por você.</h1>
          <p>Essa empresa será exclusiva do PayFlow. Cadastros de Rasoio, Nexus, Plat e outros aplicativos não serão misturados aqui.</p>
          {error && <div className="pf-form-error">{error}</div>}
          <form className="pf-company-form" onSubmit={handleCreateCompany}>
            <label>Nome da empresa<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Peter Tecnet" /></label>
            <label>Nome fantasia<input value={form.fantasy} onChange={(e) => setForm({ ...form, fantasy: e.target.value })} placeholder="Como seus clientes conhecem a empresa" /></label>
            <div className="pf-form-row">
              <label>WhatsApp / telefone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(62) 99999-9999" /></label>
              <label>E-mail<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com.br" /></label>
            </div>
            <button className="pf-button pf-button-full" disabled={saving}>{saving ? 'Criando empresa...' : 'Criar minha empresa no PayFlow'}</button>
          </form>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Vendido', value: currency.format(dashboard?.metrics?.sold || 0), icon: <BarChartLineFill /> },
    { label: 'Recebido', value: currency.format(dashboard?.metrics?.received || 0), icon: <CashCoin /> },
    { label: 'Aguardando pagamento', value: currency.format(dashboard?.metrics?.pending || 0), icon: <Wallet2 /> },
    { label: 'Clientes', value: String(dashboard?.metrics?.contacts || 0), icon: <PeopleFill /> }
  ];

  return (
    <div className="pf-app-shell">
      <aside className="pf-sidebar">
        <div className="pf-brand"><span className="pf-brand-mark">P</span><span>Peter <strong>PayFlow</strong></span></div>
        <nav>{nav.map(([label, icon], index) => <button className={index === 0 ? 'active' : ''} key={label}>{icon}<span>{label}</span></button>)}</nav>
        <div className="pf-sidebar-footer"><span className="pf-live-dot" /> Estrutura comercial ativa</div>
      </aside>
      <main className="pf-dashboard">
        <header className="pf-dashboard-header">
          <div><span>Visão geral comercial</span><h1>{selected?.fantasy || selected?.name}</h1></div>
          <div className="pf-company-switcher">
            <span>Empresa</span>
            <select value={selectedId || ''} onChange={changeCompany}>{establishments.map((item) => <option key={item.id} value={item.id}>{item.fantasy || item.name}</option>)}</select>
          </div>
        </header>
        {error && <div className="pf-form-error pf-dashboard-error">{error}</div>}
        <section className="pf-metrics">{metrics.map((metric) => <article key={metric.label}><div>{metric.icon}</div><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</section>
        <section className="pf-dashboard-grid">
          <article className="pf-work-card">
            <div className="pf-card-title"><div><span className="pf-live-dot" /> Atividade do PayFlow</div><strong>{dashboard?.activities?.length ? 'ATIVO' : 'AGUARDANDO'}</strong></div>
            <div className="pf-timeline">
              {dashboard?.activities?.length ? dashboard.activities.map((activity) => <p key={activity.id}><span>{new Date(activity.executed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span><b>{activity.summary}</b><small>{activity.channel || 'sistema'}</small></p>) : <div className="pf-empty-state"><b>Nenhuma atividade ainda.</b><small>As ações do agente, cobranças e follow-ups aparecerão aqui.</small></div>}
            </div>
          </article>
          <article className="pf-opportunities-card">
            <div className="pf-card-title"><div>Pipeline comercial</div></div>
            <div className="pf-empty-state"><b>{dashboard?.metrics?.open_opportunities || 0} oportunidades abertas</b><small>O próximo bloco conectará clientes e oportunidades reais a esta empresa.</small></div>
          </article>
        </section>
      </main>
    </div>
  );
}
