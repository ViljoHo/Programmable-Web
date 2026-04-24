const baseUrl = '/api/report-types'

export const getAllReportTypes = async () => {
    const response = await fetch(`${baseUrl}/`)

    if (!response.ok) {
        throw new Error('Failed to fetch report types')
    }

    return await response.json()
}
