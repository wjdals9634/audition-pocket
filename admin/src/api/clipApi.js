import apiClient from './apiClient'

export async function getAdminClips() {
  const response = await apiClient.get('/admin/clips')

  return response.data
}

export async function getAdminClip(id) {
  const response = await apiClient.get(`/admin/clips/${id}`)

  return response.data
}

export async function updateAdminClip(id, payload) {
  const response = await apiClient.patch(`/admin/clips/${id}`, payload)

  return response.data
}

export async function deleteAdminClip(id) {
  await apiClient.delete(`/admin/clips/${id}`)
}

export async function hideAdminClip(id) {
  const response = await apiClient.patch(`/admin/clips/${id}/hide`)

  return response.data
}

export async function unhideAdminClip(id) {
  const response = await apiClient.patch(`/admin/clips/${id}/unhide`)

  return response.data
}