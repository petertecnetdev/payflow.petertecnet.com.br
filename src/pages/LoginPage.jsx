import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, Google, LockFill } from 'react-bootstrap-icons';
import { login } from '../services/auth';

function apiErrorMessage(error) {
  return error?.response?.data?.error
    || error?.response?.data?.message
    || error?.message
    || 'Não foi possível entrar. Tente novamente.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/app', { replace: true });
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pf-auth-page">
      <Link to="/" className="pf-brand pf-auth-brand">
        <span className="pf-brand-mark">P</span>
        <span>Peter <strong>PayFlow</strong></span>
      </Link>

      <form className="pf-auth-card" onSubmit={handleSubmit}>
        <div className="pf-auth-icon"><LockFill /></div>
        <h1>Entre no PayFlow</h1>
        <p>Acesse seu comercial digital e acompanhe suas vendas.</p>

        <button className="pf-google" type="button" disabled title="Login Google será habilitado na próxima etapa">
          <Google /> Continuar com Google
        </button>

        <div className="pf-divider"><span>ou</span></div>

        {error && <div className="pf-auth-error" role="alert">{error}</div>}

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com.br"
            autoComplete="email"
            disabled={loading}
            required
          />
        </label>

        <label>
          Senha
          <div className="pf-password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              required
            />
            <button
              className="pf-password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </label>

        <button className="pf-button pf-button-full" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <small>Autenticação conectada à API central da Peter Tecnet.</small>
      </form>
    </div>
  );
}
