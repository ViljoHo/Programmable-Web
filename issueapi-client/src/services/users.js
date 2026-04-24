import { getAuthHeaders } from './apiClient'

const baseUrl = '/api/users'

export const registerUser = async (name, apiKey) => {
    const response = await fetch(`${baseUrl}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, api_key: apiKey }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to register user')
    }

    return response
}

export const getUser = async (userName) => {
    const response = await fetch(`${baseUrl}/${userName}/`, {
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch user: ${userName}`)
    }

    return await response.json()
}

export const deleteUser = async (userName) => {
    const response = await fetch(`${baseUrl}/${userName}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        throw new Error(`Failed to delete user: ${userName}`)
    }

    const location = response.headers.get('Location')

    const parts = location.split('/').filter(Boolean)
    const id = parts[parts.length - 1]

    return id
}
