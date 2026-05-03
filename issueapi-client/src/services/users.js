import { getAuthHeaders, handleApiError } from './apiClient'

const baseUrl = '/api/users'

/**
 * Registers a new user with the provided username and API key.
 *
 * @param {string} name - The desired username.
 * @param {string} apiKey - The desired API key.
 * @returns {Promise<Response>} A promise resolving to the fetch Response object upon success.
 * @throws {Error} Throws an error if data is invalid (400) or credentials taken (409).
 *                 Handled by showing validation error to the user.
 */
export const registerUser = async (name, apiKey) => {
    const response = await fetch(`${baseUrl}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, api_key: apiKey }),
    })

    await handleApiError(response, 'Failed to register user', {
        400: 'Invalid registration data. Please check your username and API key.',
        409: 'Username or API key is already taken.',
    })

    return response
}

/**
 * Fetches user details by username, effectively logging them in if credentials match.
 *
 * @param {string} userName - The username to fetch.
 * @returns {Promise<Object>} A promise resolving to the user object upon success.
 * @throws {Error} Throws an error if credentials are wrong (401) or user not found (404).
 *                 Handled by informing the user login failed.
 */
export const getUser = async (userName) => {
    const response = await fetch(`${baseUrl}/${userName}/`, {
        headers: getAuthHeaders(),
    })

    await handleApiError(response, 'Login failed', {
        401: 'Wrong credentials. Please check your username and API key.',
        404: 'User not found. Please check your username.',
    })

    return await response.json()
}

/**
 * Deletes a user account by username.
 *
 * @param {string} userName - The username of the account to delete.
 * @returns {Promise<string>} A promise resolving to the ID of the deleted user.
 * @throws {Error} Throws an error if unauthenticated (401), unauthorized (403), or not found (404).
 *                 Handled by notifying the user they cannot delete it.
 */
export const deleteUser = async (userName) => {
    const response = await fetch(`${baseUrl}/${userName}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    await handleApiError(response, 'Failed to delete account', {
        401: 'You must be logged in to delete your account.',
        403: 'You do not have permission to delete this account.',
        404: 'User account not found.',
    })

    const location = response.headers.get('Location')

    const parts = location.split('/').filter(Boolean)
    const id = parts[parts.length - 1]

    return id
}
