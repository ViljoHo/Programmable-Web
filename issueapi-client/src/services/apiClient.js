const API_KEY_HEADER = 'Issue-Api-Key'

let apiKey = null

export const setApiKey = (newApiKey) => {
    apiKey = newApiKey
}

export const getApiKey = () => apiKey

export const clearApiKey = () => {
    apiKey = null
}

export const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) {
        headers[API_KEY_HEADER] = apiKey
    }
    return headers
}
