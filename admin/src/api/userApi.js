import apiClient from './apiClient'

export async function getAdminUsers() {
  const response = await apiClient.get('/admin/users')

  return response.data
}

export async function getAdminUser(id) {
  const response = await apiClient.get(`/admin/users/${id}`)

  return response.data
}

export async function createAdminUser(payload) {
  const response = await apiClient.post('/admin/users', payload)

  return response.data
}

export async function updateAdminUser(id, payload) {
  const response = await apiClient.patch(`/admin/users/${id}`, payload)

  return response.data
}

export async function deleteAdminUser(id) {
  await apiClient.delete(`/admin/users/${id}`)
}