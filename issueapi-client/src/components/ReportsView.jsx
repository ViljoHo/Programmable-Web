import { useState } from 'react'
import { useReports } from '../hooks/useReports'
import { useUser } from '../stores/userStore'
import ReportListItem from './ReportListItem'

const ReportsView = () => {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const user = useUser()
  const userId = filter === 'my' && user ? user.id : null
  const { reports, isPending } = useReports(userId)

  const sortedReports = Array.isArray(reports)
  ? [...reports].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'urgency':
          return b.urgency_score - a.urgency_score
        default:
          return 0
      }
    })
  : []

  if (isPending) {
    return <div>Loading reports...</div>
  }

  if (!reports) {
    return <div>No reports available</div>
  }

  return (
    <div>
      <h1>Community Reports</h1>
      <div>
        <label>Show: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Reports</option>
          {user && <option value="my">My Reports</option>}
        </select>
      </div>
      <div>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="urgency">Urgency</option>
        </select>
      </div>
      <ul>
        {sortedReports.map((report) => (
          <ReportListItem key={report.id} report={report} />
        ))}
      </ul>
    </div>
  )
}

export default ReportsView
