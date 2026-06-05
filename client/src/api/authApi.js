import apiClient from './apiClient'

export async function createGuest() {
  const response = await apiClient.post('/auth/guest')

  return response.data
}

export async function getMe() {
  const response = await apiClient.get('/auth/me')

  return response.data
}

export async function login(payload) {
  const response = await apiClient.post('/auth/login', payload)

  return response.data
}

export async function signup(payload) {
  const response = await apiClient.post('/auth/signup', payload)

  return response.data
}

export async function linkEmail(payload) {
  const response = await apiClient.post('/auth/link-email', payload)

  return response.data
}

export async function logout() {
  await apiClient.post('/auth/logout')
}