import api, { tokenStore, userStore } from './api.js'

export async function signup({ name, email, password, phone }) {
  const { data } = await api.post('/auth/signup', { name, email, password, phone })
  tokenStore.set(data.data.token)
  userStore.set(data.data.user)
  return data.data
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  tokenStore.set(data.data.token)
  userStore.set(data.data.user)
  return data.data
}

export async function me() {
  const { data } = await api.get('/auth/me')
  userStore.set(data.data.user)
  return data.data.user
}

export async function updateProfile(patch) {
  const { data } = await api.patch('/auth/me', patch)
  userStore.set(data.data.user)
  return data.data.user
}

export function logout() {
  tokenStore.clear()
  window.dispatchEvent(new CustomEvent('cr:logout'))
}
