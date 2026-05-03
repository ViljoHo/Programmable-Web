const API_KEY_HEADER = 'Issue-Api-Key'

let apiKey = null

/**
 * Sets the global API key used for authenticated requests.
 *
 * @param {string} newApiKey - The API key to set.
 * @returns {void}
 */
export const setApiKey = (newApiKey) => {
    apiKey = newApiKey
}

/**
 * Retrieves the current global API key.
 *
 * @returns {string|null} The current API key, or null if not set.
 */
export const getApiKey = () => apiKey

/**
 * Clears the global API key, effectively logging the user out of the API client.
 *
 * @returns {void}
 */
export const clearApiKey = () => {
    apiKey = null
}

/**
 * Generates the standard headers for API requests, including the API key if available.
 *
 * @returns {Object} An object containing the request headers.
 */
export const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) {
        headers[API_KEY_HEADER] = apiKey
    }
    return headers
}

/**
 * Evaluates an API response and throws a formatted Error if the response is not OK.
 *
 * @param {Response} response - The Fetch API response object to check.
 * @param {string} defaultMessage - The fallback error message if no specific message is found.
 * @param {Object} [statusMessages={}] - An optional map of HTTP status codes to custom error messages.
 * @returns {Promise<void>} Resolves if the response is OK.
 * @throws {Error} Throws an error containing the specific status message, the API response description/message, or the default message.
 */
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
