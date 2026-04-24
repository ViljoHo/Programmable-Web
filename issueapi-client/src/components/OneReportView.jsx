import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReport } from '../hooks/useReport'
import { useUser } from '../stores/userStore'
import { useNotificationActions } from '../stores/notificationStore'

const OneReportView = () => {
  const { id } = useParams()
  const { report, isPending, deleteReport, addComment, deleteComment, upvote, removeUpvote } = useReport(id)
  const user = useUser()
  const navigate = useNavigate()
  const { showNotification } = useNotificationActions()
  const [commentText, setCommentText] = useState('')
  const [hasUpvoted, setHasUpvoted] = useState(false)

  if (isPending) {
    return <div>Loading report...</div>
  }

  if (!report) {
    return <div>Report not found</div>
  }

  const handleDelete = () => {
    deleteReport()
    navigate('/')
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      addComment(commentText)
      setCommentText('')
    }
  }

  const handleUpvoteToggle = () => {
    if (!hasUpvoted) {
      upvote(user.id, {
        onSuccess: () => setHasUpvoted(true),
        onError: (err) => showNotification(err.message, 'error', 5)
      })
    } else {
      removeUpvote(user.id, {
        onSuccess: () => setHasUpvoted(false),
        onError: (err) => showNotification(err.message, 'error', 5)
      })
    }
  }

  return (
    <div>
      <h2>{report.description}</h2>
      <p>Report type: {report.report_type?.name}</p>
      <p>Location: {report.location}</p>
      <p>Reported by: {report.user_name}</p>
      <p>Time: {report.timestamp}</p>
      <p>
        Upvotes: {report.upvote_count}
        {user && (
            <button onClick={handleUpvoteToggle} style={{ marginLeft: 10 }}>
                {hasUpvoted ? 'Remove Upvote' : 'Upvote'}
            </button>
        )}
      </p>

      {user?.name === report.user_name && (
        <button onClick={handleDelete}>Delete Report</button>
      )}

      <h3>Comments ({report.comment_count})</h3>

      {report.comments?.map(comment => (
        <div key={comment.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '5px' }}>
          <p><strong>{comment.user.name}</strong>: {comment.text}</p>
          {user?.name === comment.user.name && (
            <button onClick={() => deleteComment(comment.id)}>Delete Comment</button>
          )}
        </div>
      ))}

      {user && (
        <form onSubmit={handleAddComment}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            required
          />
          <button type="submit">Add Comment</button>
        </form>
      )}
    </div>
  )
}

export default OneReportView
