import api from './api.js'

export async function submitContact(payload) {
  const { data } = await api.post('/contact', payload)
  return data.data.contact
}
