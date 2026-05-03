import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReport } from '../hooks/useReport'
import { useUser } from '../stores/userStore'
import { useNotificationActions } from '../stores/notificationStore'
import EditReportDialog from './EditReportDialog'

/**
 * Component that displays the details of a single report.
 * Provides functionality to update, delete, upvote, and add/delete comments for the report.
 * Uses the URL parameter `id` to determine which report to display.
 *
 * @returns {JSX.Element} The rendered single report view.
 */
const OneReportView = () => {
  const { id } = useParams()
  const user = useUser()
  const { report, isPending, hasUpvoted, deleteReport, addComment, deleteComment, upvote, removeUpvote, updateReport } = useReport(id, user?.id)
  const navigate = useNavigate()
  const { showNotification } = useNotificationActions()
  const [commentText, setCommentText] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <svg className="animate-spin h-5 w-5 mr-3 text-primary-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading report...
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg font-medium">Report not found</p>
      </div>
    )
  }

  const handleDelete = () => {
    deleteReport({
      onSuccess: () => navigate('/'),
      onError: (err) => showNotification(err.message, 'error')
    })
  }

  const handleUpdateReport = (updatedData) => {
    updateReport(updatedData, {
      onSuccess: () => {
        setIsEditDialogOpen(false)
        showNotification('Report updated successfully', 'success')
      },
      onError: (err) => showNotification(err.message, 'error')
    })
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      addComment(commentText, {
        onSuccess: () => setCommentText(''),
        onError: (err) => showNotification(err.message, 'error')
      })
    }
  }

  const handleUpvoteToggle = () => {
    if (!hasUpvoted) {
      upvote(user.id, {
        onError: (err) => showNotification(err.message, 'error')
      })
    } else {
      removeUpvote(user.id, {
        onError: (err) => showNotification(err.message, 'error')
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Details Section */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 px-4 py-2.5 rounded-t-xl">
          Report Details
        </h2>

        <div className="bg-surface-card rounded-b-xl border border-t-0 border-gray-200/80 shadow-sm p-6">
          {/* Report type badge */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-purple-100 text-purple-800`}
          >
            {report.report_type?.name}
          </span>

          {/* Description */}
          <p className="mt-4 text-gray-700 leading-relaxed text-base">
            {report.description}
          </p>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-gray-100 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {report.user_name}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {report.location}
            </span>

            <span className="ml-auto flex items-center gap-3">
              {/* Upvote */}
              <span className="inline-flex items-center gap-1.5">
                {user && (
                  <button
                    onClick={handleUpvoteToggle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${hasUpvoted
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                  >
                    <svg className="w-4 h-4" fill={hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                    {hasUpvoted ? 'Upvoted' : 'Upvote'}
                  </button>
                )}
                <span className="text-sm font-medium text-primary-600">
                  {report.upvote_count}
                </span>
              </span>

              <span className="text-gray-400">
                {new Date(report.timestamp).toLocaleDateString('fi-FI', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </div>

          {/* Action buttons (owner only) */}
          {user?.name === report.user_name && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setIsEditDialogOpen(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors border border-primary-200"
              >
                Edit Report
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
              >
                Delete Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 px-4 py-2.5 rounded-t-xl">
          Comments ({report.comment_count})
        </h3>

        <div className="bg-surface-card rounded-b-xl border border-t-0 border-gray-200/80 shadow-sm p-6">
          {report.comments?.length > 0 ? (
            <div className="space-y-4">
              {report.comments.map(comment => (
                <div
                  key={comment.id}
                  className="bg-surface-raised rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-sm font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {comment.user.name}
                      </span>
                      <span className="text-gray-400 text-xs ">
                        {new Date(comment.timestamp).toLocaleDateString('fi-FI', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {user?.name === comment.user.name && (
                      <button
                        onClick={() => deleteComment(comment.id, {
                          onError: (err) => showNotification(err.message, 'error')
                        })}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No comments yet.</p>
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      {user && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-700 bg-accent-50 px-4 py-2.5 rounded-t-xl">
            Add a New Comment
          </h3>

          <div className="bg-surface-card rounded-b-xl border border-t-0 border-gray-200/80 shadow-sm p-6">
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your comment here..."
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 transition-colors resize-y"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors shadow-sm"
              >
                Submit Comment
              </button>
            </form>
          </div>
        </div>
      )}

      <EditReportDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        report={report}
        onUpdate={handleUpdateReport}
      />
    </div>
  )
}

export default OneReportView
