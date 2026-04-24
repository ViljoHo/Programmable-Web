import { useQuery } from '@tanstack/react-query'
import { getAllReportTypes } from '../services/reportTypes'

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
