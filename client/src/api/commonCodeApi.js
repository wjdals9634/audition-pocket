import apiClient from './apiClient'

export async function getCommonCodes(groupCode) {
  const response = await apiClient.get('/common-codes', {
    params: {
      groupCode,
    },
  })

  return response.data
}