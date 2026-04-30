import { handleApiError } from './apiClient'

const baseUrl = '/api/report-types'

export const getAllReportTypes = async () => {
    const response = await fetch(`${baseUrl}/`)

    await handleApiError(response, 'Failed to load report types', {
        500: 'Server error while loading report types. Please try again later.',
    })

    return await response.json()
}
