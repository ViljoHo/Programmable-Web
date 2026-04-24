import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getReport,
    updateReport,
    deleteReport,
    addComment,
    deleteComment,
    upvoteReport,
    removeUpvote,
} from '../services/reports'

export const useReport = (id) => {
    const queryClient = useQueryClient()

    const result = useQuery({
        queryKey: ['report', id],
        queryFn: () => getReport(id),
        refetchOnWindowFocus: false,
    })

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['report', id] })
        // Invalidate list to keep counts up to date
        queryClient.invalidateQueries({ queryKey: ['reports'] })
    }

    const updateReportMutation = useMutation({
        mutationFn: ({ reportData }) => updateReport(reportData, id),
        onSuccess: handleSuccess,
    })

    const deleteReportMutation = useMutation({
        mutationFn: () => deleteReport(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] })
        },
    })

    const addCommentMutation = useMutation({
        mutationFn: ({ text }) => addComment(id, text),
        onSuccess: handleSuccess,
    })

    const deleteCommentMutation = useMutation({
        mutationFn: deleteComment,
        onSuccess: handleSuccess,
    })

    const upvoteMutation = useMutation({
        mutationFn: ({ userId }) => upvoteReport(id, userId),
        onSuccess: handleSuccess,
    })

    const removeUpvoteMutation = useMutation({
        mutationFn: ({ userId }) => removeUpvote(id, userId),
        onSuccess: handleSuccess,
    })

    return {
        report: result.data,
        isPending: result.isPending,
        updateReport: (reportData) => updateReportMutation.mutate({ reportData }),
        deleteReport: () => deleteReportMutation.mutate(),
        addComment: (text) => addCommentMutation.mutate({ text }),
        deleteComment: (commentId) => deleteCommentMutation.mutate(commentId),
        upvote: (userId, options) => upvoteMutation.mutate({ userId }, options),
        removeUpvote: (userId, options) => removeUpvoteMutation.mutate({ userId }, options),
    }
}
