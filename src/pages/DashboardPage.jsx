import React from 'react';
import { BarChartLineFill, CashCoin, ChatDotsFill, CheckCircleFill, ChevronRight, FileEarmarkTextFill, PeopleFill, PersonBadgeFill, Robot, Wallet2 } from 'react-bootstrap-icons';

const metrics = [
  { label: 'Vendido hoje', value: 'R$ 2.840', icon: <BarChartLineFill /> },
  { label: 'Recebido hoje', value: 'R$ 1.920', icon: <CashCoin /> },
  { label: 'Aguardando pagamento', value: 'R$ 920', icon: <Wallet2 /> },
  { label: 'Clientes atendidos', value: '37', icon: <PeopleFill /> }
];

const nav = [
  ['Visão geral', <BarChartLineFill />],
  ['Conversas', <ChatDotsFill />],
  ['Clientes', <PeopleFill />],
  ['Oportunidades', <PersonBadgeFill />],
  ['Propostas', <FileEarmarkTextFill />],
  ['Cobranças', <Wallet2 />],
  ['Agente IA', <Robot />]
];

export default function DashboardPage() {
  return (
    <div className="pf-app-shell">
      <aside className="pf-sidebar">
        <div className="pf-brand"><span className="pf-brand-mark">P</span><span>Peter <strong>PayFlow</strong></span></div>
        <nav>{nav.map(([label, icon], index) => <button className={index === 0 ? 'active' : ''} key={label}>{icon}<span>{label}</span></button>)}</nav>
        <div className="pf-sidebar-footer"><span className="pf-live-dot" /> Agente IA ativo</div>
      </aside>
      <main className="pf-dashboard">
        <header className="pf-dashboard-header"><div><span>Domingo, 30 de agosto</span><h1>Boa tarde. Seu comercial está trabalhando.</h1></div><div className="pf-avatar">PT</div></header>
        <section className="pf-metrics">{metrics.map((metric) => <article key={metric.label}><div>{metric.icon}</div><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</section>
        <section className="pf-dashboard-grid">
          <article className="pf-work-card">
            <div className="pf-card-title"><div><span className="pf-live-dot" /> Funcionário digital</div><strong>TRABALHANDO</strong></div>
            <div className="pf-timeline">
              <p><span>13:42</span><b>Respondeu Maria</b><small>Cliente perguntou sobre instalação.</small></p>
              <p><span>13:43</span><b>Enviou proposta de R$ 480</b><small>Proposta #PF-1048.</small></p>
              <p><span>13:47</span><b>Pagamento confirmado</b><small>João pagou R$ 320 via Pix.</small></p>
              <p><span>13:51</span><b>Recuperou oportunidade</b><small>Carlos voltou a responder após follow-up.</small></p>
            </div>
          </article>
          <article className="pf-opportunities-card">
            <div className="pf-card-title"><div>Oportunidades quentes</div><button>Ver todas <ChevronRight /></button></div>
            <div className="pf-opportunity"><div><b>Maria Oliveira</b><small>Instalação comercial</small></div><span>R$ 480</span></div>
            <div className="pf-opportunity"><div><b>Carlos Souza</b><small>Manutenção mensal</small></div><span>R$ 650</span></div>
            <div className="pf-opportunity"><div><b>Ana Martins</b><small>Plano recorrente</small></div><span>R$ 299/mês</span></div>
            <div className="pf-insight"><CheckCircleFill /><div><b>6 clientes têm alta chance de fechar hoje.</b><small>O agente pode priorizar o follow-up automaticamente.</small></div></div>
          </article>
        </section>
      </main>
    </div>
  );
}
