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

const ctx = (establishmentId) => ({ params: { establishment_id: establishmentId } });
const bodyCtx = (establishmentId, payload = {}) => ({ establishment_id: establishmentId, ...payload });

export async function getPayflowDashboard(establishmentId) {
  const { data } = await api.get('/payflow/dashboard', ctx(establishmentId));
  return data;
}

export async function getContacts(establishmentId, q = '') {
  const { data } = await api.get('/payflow/contacts', { params: { establishment_id: establishmentId, q } });
  return data?.contacts?.data || [];
}

export async function createContact(establishmentId, payload) {
  const { data } = await api.post('/payflow/contacts', bodyCtx(establishmentId, payload));
  return data?.contact;
}

export async function updateContact(establishmentId, id, payload) {
  const { data } = await api.put(`/payflow/contacts/${id}`, bodyCtx(establishmentId, payload));
  return data?.contact;
}

export async function deleteContact(establishmentId, id) {
  return api.delete(`/payflow/contacts/${id}`, { data: { establishment_id: establishmentId } });
}

export async function getOpportunities(establishmentId) {
  const { data } = await api.get('/payflow/opportunities', ctx(establishmentId));
  return data?.opportunities?.data || [];
}

export async function createOpportunity(establishmentId, payload) {
  const { data } = await api.post('/payflow/opportunities', bodyCtx(establishmentId, payload));
  return data?.opportunity;
}

export async function updateOpportunityStage(establishmentId, id, stage) {
  return api.patch(`/payflow/opportunities/${id}/stage`, bodyCtx(establishmentId, { stage }));
}

export async function getProposals(establishmentId) {
  const { data } = await api.get('/payflow/proposals', ctx(establishmentId));
  return data?.proposals?.data || [];
}

export async function createProposal(establishmentId, payload) {
  const { data } = await api.post('/payflow/proposals', bodyCtx(establishmentId, payload));
  return data?.proposal;
}

export async function getCharges(establishmentId) {
  const { data } = await api.get('/payflow/charges', ctx(establishmentId));
  return data?.charges?.data || [];
}

export async function createCharge(establishmentId, payload) {
  const { data } = await api.post('/payflow/charges', bodyCtx(establishmentId, payload));
  return data?.charge;
}

export async function markChargePaid(establishmentId, id) {
  return api.patch(`/payflow/charges/${id}/paid`, { establishment_id: establishmentId });
}
