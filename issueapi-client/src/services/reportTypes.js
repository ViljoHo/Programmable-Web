import { handleApiError } from './apiClient'

const baseUrl = '/api/report-types'

/**
 * Fetches all available report types from the API.
 *
 * @returns {Promise<Array<Object>>} A promise resolving to an array of report type objects.
 * @throws {Error} Throws an error on server failure (500).
 *                 Handled by showing a generic loading error notification.
 */
export const getAllReportTypes = async () => {
    const response = await fetch(`${baseUrl}/`)

    await handleApiError(response, 'Failed to load report types', {
        500: 'Server error while loading report types. Please try again later.',
    })

    return await response.json()
}
