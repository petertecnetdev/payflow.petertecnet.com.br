import api from './api';

const ESTABLISHMENT_KEY = 'payflow_establishment_id';

export function getSelectedEstablishmentId() {
  const value = Number(localStorage.getItem(ESTABLISHMENT_KEY));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function setSelectedEstablishmentId(id) {
  if (id) localStorage.setItem(ESTABLISHMENT_KEY, String(id));
  else localStorage.removeItem(ESTABLISHMENT_KEY);
}

export async function getPayflowContext() {
  const { data } = await api.get('/payflow/context');
  return data;
}

export async function createPayflowEstablishment({ appId, name, fantasy, phone, email }) {
  const { data } = await api.post('/establishment', {
    app_id: appId,
    name,
    fantasy: fantasy || name,
    phone: phone || null,
    email: email || null,
    type: 'business',
    category: 'payflow-client',
    is_published: false
  });
  return data?.establishment;
}

export async function getPayflowDashboard(establishmentId) {
  const { data } = await api.get('/payflow/dashboard', {
    params: { establishment_id: establishmentId }
  });
  return data;
}
