import { getAuthHeaders, handleApiError } from './apiClient'

const baseUrl = '/api'

// Reports

/**
 * Fetches all reports from the API, optionally filtered by a specific user ID.
 *
 * @param {string} [userId] - Optional ID of the user to filter reports by.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of report objects.
 * @throws {Error} Throws an error if the fetch fails or server returns an error. 
 *                 Handled by displaying a notification or error state in the UI.
 */
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

/**
 * Fetches a single report by its ID from the API.
 *
 * @param {string} id - The unique identifier of the report to fetch.
 * @returns {Promise<Object>} A promise that resolves to the report object.
 * @throws {Error} Throws an error if the report is not found (404) or fetch fails.
 *                 Handled by redirecting or showing a "not found" message.
 */
export const getReport = async (id) => {
    const response = await fetch(`${baseUrl}/reports/${id}/`)

    await handleApiError(response, 'Failed to load report', {
        404: 'Report not found. It may have been deleted.',
    })

    return await response.json()
}

/**
 * Creates a new report with the provided data.
 *
 * @param {Object} reportData - The data for the new report.
 * @param {string} reportData.report_type_id - The ID of the report type.
 * @param {string} reportData.description - The description of the issue.
 * @param {string} reportData.location - The location string for the issue.
 * @returns {Promise<string>} A promise that resolves to the ID of the newly created report.
 * @throws {Error} Throws an error on invalid data (400) or missing authentication (401).
 *                 Handled by showing a validation error to the user.
 */
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

/**
 * Updates an existing report with new data.
 *
 * @param {Object} reportData - The updated data for the report.
 * @param {string} reportData.report_type_id - The ID of the report type.
 * @param {string} reportData.description - The description of the issue.
 * @param {string} reportData.location - The location string for the issue.
 * @param {string} id - The ID of the report to update.
 * @returns {Promise<Response>} A promise resolving to the fetch Response object upon success.
 * @throws {Error} Throws an error if validation fails (400), unauthenticated (401), unauthorized (403), or not found (404).
 *                 Handled by notifying the user of the failure reason.
 */
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

/**
 * Deletes an existing report.
 *
 * @param {string} id - The ID of the report to delete.
 * @returns {Promise<Response>} A promise resolving to the fetch Response object upon success.
 * @throws {Error} Throws an error if unauthenticated (401), unauthorized (403), or not found (404).
 *                 Handled by informing the user they cannot delete it.
 */
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

/**
 * Adds a new comment to a specific report.
 *
 * @param {string} reportId - The ID of the report to comment on.
 * @param {string} text - The content of the comment.
 * @returns {Promise<Response>} A promise resolving to the fetch Response object upon success.
 * @throws {Error} Throws an error on invalid input (400), unauthenticated (401), or missing report (404).
 *                 Handled by showing a validation or error notification.
 */
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

/**
 * Deletes a comment by its ID.
 *
 * @param {string} commentId - The ID of the comment to delete.
 * @returns {Promise<Response>} A promise resolving to the fetch Response object upon success.
 * @throws {Error} Throws an error if unauthenticated (401), unauthorized (403), or not found (404).
 *                 Handled by notifying the user they cannot delete it.
 */
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

/**
 * Upvotes a report for a specific user.
 *
 * @param {string} reportId - The ID of the report to upvote.
 * @param {string} userId - The ID of the user casting the upvote.
 * @returns {Promise<Response>} A promise resolving to the fetch Response object upon success.
 * @throws {Error} Throws an error if unauthenticated (401), unauthorized (403), or already upvoted (409).
 *                 Handled by alerting the user.
 */
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

/**
 * Checks if a user has upvoted a specific report.
 *
 * @param {string} reportId - The ID of the report to check.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} A promise resolving to the upvote status object.
 * @throws {Error} Throws an error if unauthenticated (401) or unauthorized (403).
 *                 Handled by failing the query silently or showing an error.
 */
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

/**
 * Removes an upvote from a report for a specific user.
 *
 * @param {string} reportId - The ID of the report to remove upvote from.
 * @param {string} userId - The ID of the user removing the upvote.
 * @returns {Promise<Response>} A promise resolving to the fetch Response object upon success.
 * @throws {Error} Throws an error if unauthenticated (401), unauthorized (403), or upvote not found (404).
 *                 Handled by informing the user of the failure.
 */
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
