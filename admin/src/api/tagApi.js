import apiClient from './apiClient'

export async function getAdminTags() {
  const response = await apiClient.get('/admin/tags')

  return response.data
}

export async function createAdminTag(payload) {
  const response = await apiClient.post('/admin/tags', payload)

  return response.data
}

export async function updateAdminTag(id, payload) {
  const response = await apiClient.patch(`/admin/tags/${id}`, payload)

  return response.data
}