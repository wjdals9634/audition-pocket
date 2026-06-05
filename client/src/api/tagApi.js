import apiClient from './apiClient'

export async function getTags() {
  const response = await apiClient.get('/tags')

  return response.data
}