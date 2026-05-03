import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getAllReports,
    createNewReport,
} from '../services/reports'

/**
 * Custom hook to manage fetching and creating reports.
 *
 * @param {string} [userId=null] - Optional user ID to filter the fetched reports.
 * @returns {Object} An object containing the reports array, loading state, and the `addReport` mutation function.
 * @throws {Error} Propagates API errors to the `onError` callbacks of the returned mutation function.
 *                 Component level error handling is required when calling `addReport`.
 */
export const useReports = (userId = null) => {
    const queryClient = useQueryClient()

    const result = useQuery({
        queryKey: userId ? ['reports', userId] : ['reports'],
        queryFn: () => getAllReports(userId),
        refetchOnWindowFocus: false,
    })

    const newReportMutation = useMutation({
        mutationFn: createNewReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] })
        },
    })

    return {
        reports: result.data,
        isPending: result.isPending,
        addReport: (reportData, options) => newReportMutation.mutate(reportData, options),
    }
}
