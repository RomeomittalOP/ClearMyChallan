import api from './api.js'

export async function createResolution({ vehicleNumber, challanIds }) {
  const { data } = await api.post('/resolutions', { vehicleNumber, challanIds })
  return data.data.request
}

export async function listMyResolutions() {
  const { data } = await api.get('/resolutions/me')
  return data.data.requests
}

export async function getResolution(id) {
  const { data } = await api.get(`/resolutions/${id}`)
  return data.data.request
}

export async function addResolutionNote(id, message) {
  const { data } = await api.post(`/resolutions/${id}/notes`, { message })
  return data.data.request
}
