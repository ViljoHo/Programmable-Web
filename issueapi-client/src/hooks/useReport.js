import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getReport,
    updateReport,
    deleteReport,
    addComment,
    deleteComment,
    upvoteReport,
    removeUpvote,
    getUpvote,
} from '../services/reports'

export const useReport = (id, userId) => {
    const queryClient = useQueryClient()

    const result = useQuery({
        queryKey: ['report', id],
        queryFn: () => getReport(id),
        refetchOnWindowFocus: false,
    })

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['report', id] })
        queryClient.invalidateQueries({ queryKey: ['reports'] })
        queryClient.invalidateQueries({ queryKey: ['upvoteStatus', id, userId] })
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

    const upvoteStatus = useQuery({
        queryKey: ['upvoteStatus', id, userId],
        queryFn: () => getUpvote(id, userId),
        enabled: !!userId && !!id,
        refetchOnWindowFocus: false,
    })

    return {
        report: result.data,
        isPending: result.isPending,
        hasUpvoted: upvoteStatus.data?.upvoted ?? false,
        isUpvoteLoading: upvoteStatus.isPending,
        updateReport: (reportData, options) => updateReportMutation.mutate({ reportData }, options),
        deleteReport: (options) => deleteReportMutation.mutate(undefined, options),
        addComment: (text, options) => addCommentMutation.mutate({ text }, options),
        deleteComment: (commentId, options) => deleteCommentMutation.mutate(commentId, options),
        upvote: (userId, options) => upvoteMutation.mutate({ userId }, options),
        removeUpvote: (userId, options) => removeUpvoteMutation.mutate({ userId }, options),
    }
}
