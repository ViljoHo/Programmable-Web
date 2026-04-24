import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getAllReports,
    createNewReport,
} from '../services/reports'

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
