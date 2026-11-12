// Tiny client for the Express API. Throws an Error with the server's message on failure.
async function request(method, url, body) {
  const isForm = body instanceof FormData
  const res = await fetch(url, {
    method,
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  group: () => request('GET', '/api/group'),
  saveGroup: (g) => request('PUT', '/api/group', g),
  groups: () => request('GET', '/api/groups'),
  businesses: () => request('GET', '/api/businesses'),
  addBusiness: (b) => request('POST', '/api/businesses', b),
  verify: (id, key, value) => request('PATCH', `/api/businesses/${id}/verify`, { key, value }),
  agreements: () => request('GET', '/api/agreements'),
  addAgreement: (a) => request('POST', '/api/agreements', a),
  addPayment: (id, amount) => request('POST', `/api/agreements/${id}/payments`, { amount }),
  lessons: () => request('GET', '/api/lessons'),
  addLesson: (l) => request('POST', '/api/lessons', l),
  uploadLesson: (form) => request('POST', '/api/lessons/upload', form),
  deleteLesson: (id) => request('DELETE', `/api/lessons/${id}`),
}
