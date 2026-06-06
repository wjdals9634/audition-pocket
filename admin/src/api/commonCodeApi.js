import apiClient from './apiClient'

export async function getAdminCommonCodes() {
  const response = await apiClient.get('/admin/common-codes')

  return response.data
}

export async function createAdminCommonCode(payload) {
  const response = await apiClient.post('/admin/common-codes', payload)

  return response.data
}

export async function updateAdminCommonCode(id, payload) {
  const response = await apiClient.patch(`/admin/common-codes/${id}`, payload)

  return response.data
}

export async function deleteAdminCommonCode(id) {
  await apiClient.delete(`/admin/common-codes/${id}`)
}