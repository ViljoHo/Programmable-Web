import { getAuthHeaders } from './apiClient'

const baseUrl = '/api'

// Reports

export const getAllReports = async (userId) => {
    const url = userId
        ? `${baseUrl}/reports/?user_id=${userId}`
        : `${baseUrl}/reports/`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch reports')
    }

    return await response.json()
}

export const getReport = async (id) => {
    const response = await fetch(`${baseUrl}/reports/${id}/`)

    if (!response.ok) {
        throw new Error(`Failed to fetch report with id: ${id}`)
    }

    return await response.json()
}

export const createNewReport = async ({ report_type_id, description, location }) => {
    const response = await fetch(`${baseUrl}/reports/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ report_type_id, description, location }),
    })

    if (!response.ok) {
        throw new Error('Failed to create report')
    }

    const locationHeader = response.headers.get('Location')
    const parts = locationHeader.split('/').filter(Boolean)
    const id = parts[parts.length - 1]

    return id
}

export const updateReport = async ({ report_type_id, description, location }, id) => {
    const response = await fetch(`${baseUrl}/reports/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ report_type_id, description, location }),
    })

    if (!response.ok) {
        throw new Error(`Failed to update report ${id}`)
    }

    return response
}

export const deleteReport = async (id) => {
    const response = await fetch(`${baseUrl}/reports/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        throw new Error(`Failed to delete report ${id}`)
    }

    return response
}

// Comments

export const addComment = async (reportId, text) => {
    const response = await fetch(`${baseUrl}/reports/${reportId}/comments/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
    })

    if (!response.ok) {
        throw new Error('Failed to add comment')
    }

    return response
}

export const deleteComment = async (commentId) => {
    const response = await fetch(`${baseUrl}/comments/${commentId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        throw new Error(`Failed to delete comment ${commentId}`)
    }

    return response
}

// Upvotes

export const upvoteReport = async (reportId, userId) => {
    const response = await fetch(`${baseUrl}/reports/${reportId}/upvote/${userId}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        throw new Error('Failed to upvote report')
    }

    return response
}

export const removeUpvote = async (reportId, userId) => {
    const response = await fetch(`${baseUrl}/reports/${reportId}/upvote/${userId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        throw new Error('Failed to remove upvote')
    }

    return response
}
