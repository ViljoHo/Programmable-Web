import { getAuthHeaders, handleApiError } from './apiClient'

const baseUrl = '/api/users'

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
