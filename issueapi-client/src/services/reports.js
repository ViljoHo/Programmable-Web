import { getAuthHeaders, handleApiError } from './apiClient'

const baseUrl = '/api'

// Reports

export const getAllReports = async (userId) => {
    const url = userId
        ? `${baseUrl}/reports/?user_id=${userId}`
        : `${baseUrl}/reports/`
    const response = await fetch(url)

    await handleApiError(response, 'Failed to load reports', {
        500: 'Server error while loading reports. Please try again later.',
    })

    return await response.json()
}

export const getReport = async (id) => {
    const response = await fetch(`${baseUrl}/reports/${id}/`)

    await handleApiError(response, 'Failed to load report', {
        404: 'Report not found. It may have been deleted.',
    })

    return await response.json()
}

export const createNewReport = async ({ report_type_id, description, location }) => {
    const response = await fetch(`${baseUrl}/reports/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ report_type_id, description, location }),
    })

    await handleApiError(response, 'Failed to create report', {
        400: 'Invalid report data. Please check all fields are filled correctly.',
        401: 'You must be logged in to create a report.',
    })

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

    await handleApiError(response, 'Failed to update report', {
        400: 'Invalid report data. Please check all fields are filled correctly.',
        401: 'You must be logged in to edit a report.',
        403: 'You do not have permission to edit this report.',
        404: 'Report not found. It may have been deleted.',
    })

    return response
}

export const deleteReport = async (id) => {
    const response = await fetch(`${baseUrl}/reports/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    await handleApiError(response, 'Failed to delete report', {
        401: 'You must be logged in to delete a report.',
        403: 'You do not have permission to delete this report.',
        404: 'Report not found. It may have already been deleted.',
    })

    return response
}

// Comments

export const addComment = async (reportId, text) => {
    const response = await fetch(`${baseUrl}/reports/${reportId}/comments/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
    })

    await handleApiError(response, 'Failed to add comment', {
        400: 'Invalid comment. Please check your input.',
        401: 'You must be logged in to add a comment.',
        404: 'Report not found. It may have been deleted.',
    })

    return response
}

export const deleteComment = async (commentId) => {
    const response = await fetch(`${baseUrl}/comments/${commentId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    await handleApiError(response, 'Failed to delete comment', {
        401: 'You must be logged in to delete a comment.',
        403: 'You do not have permission to delete this comment.',
        404: 'Comment not found. It may have already been deleted.',
    })

    return response
}

// Upvotes

export const upvoteReport = async (reportId, userId) => {
    const response = await fetch(`${baseUrl}/reports/${reportId}/upvote/${userId}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
    })

    await handleApiError(response, 'Failed to upvote report', {
        401: 'You must be logged in to upvote.',
        403: 'You do not have permission to upvote this report.',
        409: 'You have already upvoted this report.',
    })

    return response
}

export const getUpvote = async (reportId, userId) => {
    const response = await fetch(`${baseUrl}/reports/${reportId}/upvote/${userId}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
    })

    await handleApiError(response, 'Failed to check upvote status', {
        401: 'You must be logged in to check upvote status.',
        403: 'You do not have permission to check this upvote status.',
    })

    return await response.json()
}

export const removeUpvote = async (reportId, userId) => {
    const response = await fetch(`${baseUrl}/reports/${reportId}/upvote/${userId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })

    await handleApiError(response, 'Failed to remove upvote', {
        401: 'You must be logged in to remove your upvote.',
        403: 'You do not have permission to remove this upvote.',
        404: 'You have not upvoted this report.',
    })

    return response
}
