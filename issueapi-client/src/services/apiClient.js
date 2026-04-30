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

export const handleApiError = async (response, defaultMessage, statusMessages = {}) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const message = statusMessages[response.status]
            || errorData?.description
            || errorData?.message
            || defaultMessage
        throw new Error(message)
    }
}
