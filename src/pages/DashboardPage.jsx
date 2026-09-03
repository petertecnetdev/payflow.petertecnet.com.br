import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChartLineFill, CashCoin, ChatDotsFill, FileEarmarkTextFill,
  PeopleFill, PersonBadgeFill, Robot, Wallet2
} from 'react-bootstrap-icons';
import {
  createCharge, createContact, createOpportunity, createPayflowEstablishment,
  createProposal, deleteContact, getCharges, getContacts, getOpportunities,
  getPayflowContext, getPayflowDashboard, getProposals, getSelectedEstablishmentId,
  markChargePaid, setSelectedEstablishmentId, updateOpportunityStage
} from '../services/payflow';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const stages = [
  ['new', 'Novo'], ['qualified', 'Qualificado'], ['proposal', 'Proposta'],
  ['payment_pending', 'Aguardando pagamento'], ['won', 'Ganho'], ['lost', 'Perdido']
];
const nav = [
  ['dashboard', 'Visão geral', <BarChartLineFill />],
  ['conversations', 'Conversas', <ChatDotsFill />],
  ['contacts', 'Clientes', <PeopleFill />],
  ['opportunities', 'Oportunidades', <PersonBadgeFill />],
  ['proposals', 'Propostas', <FileEarmarkTextFill />],
  ['charges', 'Cobranças', <Wallet2 />],
  ['agent', 'Agente IA', <Robot />]
];

function apiMessage(error) {
  const data = error?.response?.data;
  const first = data?.errors ? Object.values(data.errors).flat()[0] : null;
  return first || data?.message || data?.error || error?.message || 'Não foi possível concluir a operação.';
}

export default function DashboardPage() {
  const [active, setActive] = useState('dashboard');
  const [context, setContext] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [company, setCompany] = useState({ name: '', fantasy: '', phone: '', email: '' });
  const [contact, setContact] = useState({ name: '', phone: '', email: '', source: 'manual', notes: '' });
  const [opportunity, setOpportunity] = useState({ contact_id: '', title: '', value: '', probability: 20 });
  const [proposal, setProposal] = useState({ contact_id: '', opportunity_id: '', description: '', quantity: 1, unit_price: '', discount: 0 });
  const [charge, setCharge] = useState({ contact_id: '', proposal_id: '', amount: '' });

  const establishments = context?.establishments || [];
  const selected = useMemo(() => establishments.find((item) => Number(item.id) === Number(selectedId)) || null, [establishments, selectedId]);

  async function loadContext(preferredId = null) {
    setLoading(true); setError('');
    try {
      const data = await getPayflowContext();
      setContext(data);
      const available = data?.establishments || [];
      const remembered = preferredId || getSelectedEstablishmentId();
      const next = available.find((item) => Number(item.id) === Number(remembered)) || available[0] || null;
      const nextId = next ? Number(next.id) : null;
      setSelectedId(nextId); setSelectedEstablishmentId(nextId);
    } catch (err) { setError(apiMessage(err)); }
    finally { setLoading(false); }
  }

  async function refreshCommercial(id = selectedId) {
    if (!id) return;
    setError('');
    try {
      const [d, c, o, p, ch] = await Promise.all([
        getPayflowDashboard(id), getContacts(id), getOpportunities(id), getProposals(id), getCharges(id)
      ]);
      setDashboard(d); setContacts(c); setOpportunities(o); setProposals(p); setCharges(ch);
    } catch (err) { setError(apiMessage(err)); }
  }

  useEffect(() => { loadContext(); }, []);
  useEffect(() => { if (selectedId) refreshCommercial(selectedId); }, [selectedId]);

  async function handleCreateCompany(event) {
    event.preventDefault(); if (!context?.application?.id) return;
    setBusy(true); setError('');
    try {
      const establishment = await createPayflowEstablishment({ appId: context.application.id, ...company });
      await loadContext(establishment?.id || null);
    } catch (err) { setError(apiMessage(err)); }
    finally { setBusy(false); }
  }

  async function handleContact(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await createContact(selectedId, contact);
      setContact({ name: '', phone: '', email: '', source: 'manual', notes: '' });
      await refreshCommercial();
    } catch (err) { setError(apiMessage(err)); }
    finally { setBusy(false); }
  }

  async function handleDeleteContact(id) {
    if (!window.confirm('Excluir este cliente?')) return;
    try { await deleteContact(selectedId, id); await refreshCommercial(); }
    catch (err) { setError(apiMessage(err)); }
  }

  async function handleOpportunity(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await createOpportunity(selectedId, { ...opportunity, contact_id: Number(opportunity.contact_id), value: Number(opportunity.value || 0), probability: Number(opportunity.probability || 20) });
      setOpportunity({ contact_id: '', title: '', value: '', probability: 20 });
      await refreshCommercial();
    } catch (err) { setError(apiMessage(err)); }
    finally { setBusy(false); }
  }

  async function moveOpportunity(id, stage) {
    try { await updateOpportunityStage(selectedId, id, stage); await refreshCommercial(); }
    catch (err) { setError(apiMessage(err)); }
  }

  async function handleProposal(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await createProposal(selectedId, {
        contact_id: Number(proposal.contact_id),
        opportunity_id: proposal.opportunity_id ? Number(proposal.opportunity_id) : null,
        items: [{ description: proposal.description, quantity: Number(proposal.quantity), unit_price: Number(proposal.unit_price) }],
        discount: Number(proposal.discount || 0)
      });
      setProposal({ contact_id: '', opportunity_id: '', description: '', quantity: 1, unit_price: '', discount: 0 });
      await refreshCommercial();
    } catch (err) { setError(apiMessage(err)); }
    finally { setBusy(false); }
  }

  async function handleCharge(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await createCharge(selectedId, { contact_id: Number(charge.contact_id), proposal_id: charge.proposal_id ? Number(charge.proposal_id) : null, amount: Number(charge.amount) });
      setCharge({ contact_id: '', proposal_id: '', amount: '' });
      await refreshCommercial();
    } catch (err) { setError(apiMessage(err)); }
    finally { setBusy(false); }
  }

  async function confirmPaid(id) {
    try { await markChargePaid(selectedId, id); await refreshCommercial(); }
    catch (err) { setError(apiMessage(err)); }
  }

  if (loading) return <div className="pf-context-state"><div className="pf-context-spinner" /><h1>Preparando seu PayFlow</h1><p>Carregando seu ambiente comercial.</p></div>;
  if (!context) return <div className="pf-context-state"><h1>Não foi possível abrir o PayFlow</h1><p>{error}</p><button className="pf-button" onClick={() => loadContext()}>Tentar novamente</button></div>;

  if (!establishments.length) {
    return <div className="pf-onboarding-page"><div className="pf-onboarding-card">
      <div className="pf-brand"><span className="pf-brand-mark">P</span><span>Peter <strong>PayFlow</strong></span></div>
      <span className="pf-onboarding-kicker">Primeira configuração</span>
      <h1>Cadastre a empresa que o PayFlow vai vender por você.</h1>
      <p>Essa empresa será exclusiva do PayFlow.</p>
      {error && <div className="pf-form-error">{error}</div>}
      <form className="pf-company-form" onSubmit={handleCreateCompany}>
        <label>Nome da empresa<input required value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></label>
        <label>Nome fantasia<input value={company.fantasy} onChange={(e) => setCompany({ ...company, fantasy: e.target.value })} /></label>
        <div className="pf-form-row"><label>Telefone<input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></label><label>E-mail<input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></label></div>
        <button className="pf-button pf-button-full" disabled={busy}>{busy ? 'Criando...' : 'Criar minha empresa no PayFlow'}</button>
      </form>
    </div></div>;
  }

  const metrics = [
    ['Vendido', currency.format(dashboard?.metrics?.sold || 0), <BarChartLineFill />],
    ['Recebido', currency.format(dashboard?.metrics?.received || 0), <CashCoin />],
    ['Aguardando pagamento', currency.format(dashboard?.metrics?.pending || 0), <Wallet2 />],
    ['Clientes', String(dashboard?.metrics?.contacts || 0), <PeopleFill />]
  ];
  const financialChart = [
    { label: 'Vendido', value: Number(dashboard?.metrics?.sold || 0) },
    { label: 'Recebido', value: Number(dashboard?.metrics?.received || 0) },
    { label: 'Aguardando pagamento', value: Number(dashboard?.metrics?.pending || 0) }
  ];
  const pipelineChart = stages.map(([stage, label]) => ({ label, value: opportunities.filter((item) => item.stage === stage).length }));

  return <div className="pf-app-shell">
    <aside className="pf-sidebar">
      <div className="pf-brand"><span className="pf-brand-mark">P</span><span>Peter <strong>PayFlow</strong></span></div>
      <nav>{nav.map(([key, label, icon]) => <button className={active === key ? 'active' : ''} key={key} onClick={() => setActive(key)}>{icon}<span>{label}</span></button>)}</nav>
      <div className="pf-sidebar-footer"><span className="pf-live-dot" /> Estrutura comercial ativa</div>
    </aside>
    <main className="pf-dashboard">
      <header className="pf-dashboard-header"><div><span>Peter PayFlow</span><h1>{selected?.fantasy || selected?.name}</h1></div><div className="pf-company-switcher"><span>Empresa</span><select value={selectedId || ''} onChange={(e) => { const id = Number(e.target.value); setSelectedId(id); setSelectedEstablishmentId(id); }}>{establishments.map((item) => <option key={item.id} value={item.id}>{item.fantasy || item.name}</option>)}</select></div></header>
      {error && <div className="pf-form-error pf-dashboard-error">{error}</div>}

      {active === 'dashboard' && <><section className="pf-metrics">{metrics.map(([label, value, icon]) => <article key={label}><div>{icon}</div><span>{label}</span><strong>{value}</strong></article>)}</section><section className="pf-dashboard-grid"><peter-insight-chart type="bar" title="Vendido x recebido" subtitle="Compare o valor vendido, o que já entrou e o que ainda aguarda pagamento." data={JSON.stringify(financialChart)} primary-label="Valor" format="currency"/><peter-insight-chart type="donut" title="Pipeline por etapa" subtitle="Distribuição atual das oportunidades entre as etapas do processo comercial." data={JSON.stringify(pipelineChart)} primary-label="Oportunidades"/></section><section className="pf-dashboard-grid"><article className="pf-work-card"><div className="pf-card-title"><div><span className="pf-live-dot" /> Atividade do PayFlow</div><strong>{dashboard?.activities?.length ? 'ATIVO' : 'AGUARDANDO'}</strong></div><div className="pf-timeline">{dashboard?.activities?.length ? dashboard.activities.map((a) => <p key={a.id}><b>{a.summary}</b><small>{a.channel || 'sistema'}</small></p>) : <div className="pf-empty-state"><b>Nenhuma atividade ainda.</b><small>As ações do agente aparecerão aqui.</small></div>}</div></article><article className="pf-opportunities-card"><div className="pf-card-title"><div>Pipeline comercial</div></div><div className="pf-empty-state"><b>{dashboard?.metrics?.open_opportunities || 0} oportunidades abertas</b><small>{opportunities.filter((o) => o.stage === 'won').length} vendas ganhas.</small></div></article></section></>}

      {active === 'contacts' && <section className="pf-module"><div className="pf-module-head"><div><span>CRM</span><h2>Clientes</h2></div></div><form className="pf-inline-form" onSubmit={handleContact}><input required placeholder="Nome" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })}/><input placeholder="WhatsApp" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })}/><input type="email" placeholder="E-mail" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })}/><button disabled={busy}>Adicionar cliente</button></form><div className="pf-data-list">{contacts.map((c) => <div className="pf-data-row" key={c.id}><div><b>{c.name}</b><small>{c.phone || c.email || 'Sem contato informado'}</small></div><span>{c.status}</span><button onClick={() => handleDeleteContact(c.id)}>Excluir</button></div>)}{!contacts.length && <div className="pf-empty-state"><b>Nenhum cliente cadastrado.</b><small>Cadastre o primeiro cliente acima.</small></div>}</div></section>}

      {active === 'opportunities' && <section className="pf-module"><div className="pf-module-head"><div><span>Pipeline</span><h2>Oportunidades</h2></div></div><form className="pf-inline-form" onSubmit={handleOpportunity}><select required value={opportunity.contact_id} onChange={(e) => setOpportunity({ ...opportunity, contact_id: e.target.value })}><option value="">Cliente</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input required placeholder="Oportunidade" value={opportunity.title} onChange={(e) => setOpportunity({ ...opportunity, title: e.target.value })}/><input type="number" min="0" step="0.01" placeholder="Valor" value={opportunity.value} onChange={(e) => setOpportunity({ ...opportunity, value: e.target.value })}/><button disabled={busy}>Criar oportunidade</button></form><div className="pf-pipeline">{stages.map(([stage, label]) => <div className="pf-pipeline-column" key={stage}><h3>{label}</h3>{opportunities.filter((o) => o.stage === stage).map((o) => <article key={o.id}><b>{o.title}</b><small>{o.contact_name}</small><strong>{currency.format(Number(o.value || 0))}</strong><select value={o.stage} onChange={(e) => moveOpportunity(o.id, e.target.value)}>{stages.map(([s, l]) => <option key={s} value={s}>{l}</option>)}</select></article>)}</div>)}</div></section>}

      {active === 'proposals' && <section className="pf-module"><div className="pf-module-head"><div><span>Vendas</span><h2>Propostas</h2></div></div><form className="pf-inline-form pf-form-wrap" onSubmit={handleProposal}><select required value={proposal.contact_id} onChange={(e) => setProposal({ ...proposal, contact_id: e.target.value })}><option value="">Cliente</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={proposal.opportunity_id} onChange={(e) => setProposal({ ...proposal, opportunity_id: e.target.value })}><option value="">Sem oportunidade</option>{opportunities.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select><input required placeholder="Descrição" value={proposal.description} onChange={(e) => setProposal({ ...proposal, description: e.target.value })}/><input type="number" min="0.001" step="0.001" value={proposal.quantity} onChange={(e) => setProposal({ ...proposal, quantity: e.target.value })}/><input required type="number" min="0" step="0.01" placeholder="Preço unitário" value={proposal.unit_price} onChange={(e) => setProposal({ ...proposal, unit_price: e.target.value })}/><button disabled={busy}>Criar proposta</button></form><div className="pf-data-list">{proposals.map((p) => <div className="pf-data-row" key={p.id}><div><b>{p.code} · {p.contact_name}</b><small>Status: {p.status}</small></div><strong>{currency.format(Number(p.total || 0))}</strong></div>)}{!proposals.length && <div className="pf-empty-state"><b>Nenhuma proposta.</b></div>}</div></section>}

      {active === 'charges' && <section className="pf-module"><div className="pf-module-head"><div><span>Financeiro comercial</span><h2>Cobranças</h2></div></div><form className="pf-inline-form" onSubmit={handleCharge}><select required value={charge.contact_id} onChange={(e) => setCharge({ ...charge, contact_id: e.target.value })}><option value="">Cliente</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={charge.proposal_id} onChange={(e) => setCharge({ ...charge, proposal_id: e.target.value })}><option value="">Sem proposta</option>{proposals.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select><input required type="number" min="0.01" step="0.01" placeholder="Valor" value={charge.amount} onChange={(e) => setCharge({ ...charge, amount: e.target.value })}/><button disabled={busy}>Criar cobrança</button></form><div className="pf-data-list">{charges.map((c) => <div className="pf-data-row" key={c.id}><div><b>{c.contact_name}</b><small>{c.status === 'paid' ? 'Pagamento confirmado' : 'Aguardando pagamento'}</small></div><strong>{currency.format(Number(c.amount || 0))}</strong>{c.status !== 'paid' && <button onClick={() => confirmPaid(c.id)}>Confirmar pagamento</button>}</div>)}{!charges.length && <div className="pf-empty-state"><b>Nenhuma cobrança.</b></div>}</div></section>}

      {active === 'conversations' && <section className="pf-module"><div className="pf-empty-state"><b>WhatsApp ainda não conectado.</b><small>O módulo está reservado para a integração oficial da Meta. Precisamos das credenciais da conta WhatsApp Business para ativá-lo.</small></div></section>}
      {active === 'agent' && <section className="pf-module"><div className="pf-empty-state"><b>Agente IA preparado para a próxima integração.</b><small>Clientes, oportunidades, propostas e cobranças já formam a base de contexto do agente. A ativação exige a chave do provedor de IA e o canal WhatsApp.</small></div></section>}
    </main>
  </div>;
}
