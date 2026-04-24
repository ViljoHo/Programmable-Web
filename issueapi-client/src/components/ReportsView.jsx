import { useState } from 'react'
import { useReports } from '../hooks/useReports'
import { useUser } from '../stores/userStore'
import ReportListItem from './ReportListItem'

const ReportsView = () => {
  const [filter, setFilter] = useState('all')
  const user = useUser()
  const userId = filter === 'my' && user ? user.id : null
  const { reports, isPending } = useReports(userId)

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
      <ul>
        {reports.map((report) => (
          <ReportListItem key={report.id} report={report} />
        ))}
      </ul>
    </div>
  )
}

export default ReportsView
