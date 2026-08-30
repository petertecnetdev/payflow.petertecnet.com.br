import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircleFill, LightningChargeFill, Robot, Whatsapp } from 'react-bootstrap-icons';

const benefits = [
  'Atende clientes 24 horas por dia',
  'Organiza oportunidades automaticamente',
  'Gera propostas e cobranças',
  'Faz follow-up de quem ainda não fechou',
  'Acompanha pagamentos e recebimentos',
  'Mostra ao empresário o que a IA fez e vendeu'
];

export default function HomePage() {
  return (
    <div className="pf-site">
      <header className="pf-nav container">
        <Link to="/" className="pf-brand"><span className="pf-brand-mark">P</span><span>Peter <strong>PayFlow</strong></span></Link>
        <div className="pf-nav-actions">
          <Link to="/login" className="pf-link">Entrar</Link>
          <Link to="/login" className="pf-button pf-button-small">Começar agora</Link>
        </div>
      </header>

      <main>
        <section className="pf-hero container">
          <div className="pf-hero-copy">
            <span className="pf-eyebrow"><LightningChargeFill /> Seu comercial trabalhando 24/7</span>
            <h1>Pare de perder clientes no WhatsApp.</h1>
            <p>O Peter PayFlow atende, qualifica, vende, cobra e acompanha seus clientes automaticamente — enquanto você cuida da sua empresa.</p>
            <div className="pf-hero-actions">
              <Link to="/login" className="pf-button">Quero vender mais <ArrowRight /></Link>
              <a href="#como-funciona" className="pf-button pf-button-ghost">Ver como funciona</a>
            </div>
            <div className="pf-trust"><CheckCircleFill /> Sem ERP complicado. Comece pelo que gera receita.</div>
          </div>

          <div className="pf-agent-card">
            <div className="pf-agent-head"><span className="pf-live-dot" /> Funcionário digital trabalhando</div>
            <div className="pf-agent-event"><span>13:42</span><p><Whatsapp /> Respondeu Maria</p></div>
            <div className="pf-agent-event"><span>13:43</span><p>Enviou proposta de <strong>R$ 480</strong></p></div>
            <div className="pf-agent-event"><span>13:47</span><p>Pagamento de João confirmado</p></div>
            <div className="pf-agent-event"><span>13:51</span><p>Recuperou oportunidade de Carlos</p></div>
            <div className="pf-agent-total"><span>Receita assistida hoje</span><strong>R$ 2.840</strong></div>
          </div>
        </section>

        <section id="como-funciona" className="pf-section container">
          <div className="pf-section-title"><span>O produto</span><h2>Um funcionário comercial digital, não apenas um chatbot.</h2></div>
          <div className="pf-grid-3">
            <article className="pf-card"><Whatsapp /><h3>Atende</h3><p>Recebe o cliente, entende a necessidade e responde com contexto da sua empresa.</p></article>
            <article className="pf-card"><Robot /><h3>Vende</h3><p>Qualifica oportunidades, sugere itens, prepara propostas e conduz o próximo passo.</p></article>
            <article className="pf-card"><LightningChargeFill /><h3>Recupera</h3><p>Retoma conversas, acompanha propostas e cobra quem ainda não concluiu.</p></article>
          </div>
        </section>

        <section className="pf-section container">
          <div className="pf-panel">
            <div><span className="pf-eyebrow">Programa Fundadores</span><h2>Entre na primeira turma do PayFlow.</h2><p>Implantação assistida e condição especial de lançamento para as primeiras empresas.</p></div>
            <Link to="/login" className="pf-button">Quero participar <ArrowRight /></Link>
          </div>
        </section>
      </main>

      <footer className="pf-footer container">Desenvolvido pela <a href="https://petertecnet.com.br">Peter Tecnet</a>.</footer>
    </div>
  );
}
