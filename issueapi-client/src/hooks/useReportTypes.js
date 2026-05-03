import { useQuery } from '@tanstack/react-query'
import { getAllReportTypes } from '../services/reportTypes'

/**
 * Custom hook to fetch all available report types.
 *
 * @returns {Object} An object containing the `reportTypes` array and a boolean `isPending` state.
 * @throws {Error} Propagates any API query errors. Handled by the query client or error boundaries.
 */
export const useReportTypes = () => {
    const result = useQuery({
        queryKey: ['reportTypes'],
        queryFn: getAllReportTypes,
        refetchOnWindowFocus: false,
    })

    return {
        reportTypes: result.data,
        isPending: result.isPending,
    }
}
