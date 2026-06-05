import apiClient from './apiClient'

export async function getClips(params = {}) {
  const response = await apiClient.get('/clips', {
    params,
  })

  return response.data
}

export async function getClip(id) {
  const response = await apiClient.get(`/clips/${id}`)

  return response.data
}

export async function createClip(payload) {
  const response = await apiClient.post('/clips', payload)

  return response.data
}

export async function updateClip(id, payload) {
  const response = await apiClient.patch(`/clips/${id}`, payload)

  return response.data
}

export async function deleteClip(id) {
  await apiClient.delete(`/clips/${id}`)
}