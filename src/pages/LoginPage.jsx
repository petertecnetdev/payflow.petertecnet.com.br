import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Google, LockFill } from 'react-bootstrap-icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/app');
  };

  return (
    <div className="pf-auth-page">
      <Link to="/" className="pf-brand pf-auth-brand"><span className="pf-brand-mark">P</span><span>Peter <strong>PayFlow</strong></span></Link>
      <form className="pf-auth-card" onSubmit={handleSubmit}>
        <div className="pf-auth-icon"><LockFill /></div>
        <h1>Entre no PayFlow</h1>
        <p>Acesse seu comercial digital e acompanhe suas vendas.</p>
        <button className="pf-google" type="button"><Google /> Continuar com Google</button>
        <div className="pf-divider"><span>ou</span></div>
        <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" required /></label>
        <label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></label>
        <button className="pf-button pf-button-full" type="submit">Entrar</button>
        <small>Autenticação real será conectada à API central da Peter Tecnet.</small>
      </form>
    </div>
  );
}
