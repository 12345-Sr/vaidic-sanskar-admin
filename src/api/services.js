import client from './client';

/**
 * Admin API surface. Every resource follows a simple REST shape so the generic
 * ResourcePage can list / update without bespoke code:
 *   GET    {endpoint}          → array (or { data: [...] })
 *   PATCH  {endpoint}/:id      → update fields (status changes, KYC, etc.)
 *   POST   {endpoint}          → create
 *   DELETE {endpoint}/:id
 *
 * Developer: adjust endpoint strings to match your backend. The list() helper
 * unwraps common envelopes ({data}, {results}, {items}) automatically.
 */
function unwrap(res) {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.results ?? res?.items ?? [];
}

export function makeResource(endpoint) {
  return {
    list: (params) => client.get(endpoint, { params }).then(unwrap),
    get: (id) => client.get(`${endpoint}/${id}`),
    create: (body) => client.post(endpoint, body),
    update: (id, body) => client.patch(`${endpoint}/${id}`, body),
    remove: (id) => client.delete(`${endpoint}/${id}`),
  };
}

// Resource endpoints (both apps, managed from one console)
export const api = {
  users:         makeResource('users'),
  vendors:       makeResource('vendors'),
  bookings:      makeResource('bookings'),
  jobs:          makeResource('jobs'),
  orders:        makeResource('orders'),
  products:      makeResource('products'),
  sessions:      makeResource('sessions'),
  subs:          makeResource('subs'),
  temples:       makeResource('temples'),
  donations:     makeResource('donations'),
  events:        makeResource('events'),
  payouts:       makeResource('payouts'),
  reviews:       makeResource('reviews'),
  library:       makeResource('library'),
  banners:       makeResource('banners'),
};

// Dashboard summary
export const dashboardApi = {
  summary: () => client.get('dashboard/summary'),
};

// Auth
export const authApi = {
  login: (email, password) => client.post('auth/login', { email, password }),
  me: () => client.get('auth/me'),
};
