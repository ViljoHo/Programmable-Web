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
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <svg className="animate-spin h-5 w-5 mr-3 text-primary-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading reports...
      </div>
    )
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No reports available</p>
        <p className="text-sm mt-1">Be the first to create a report!</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Reports</h1>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-select" className="text-sm text-gray-500 font-medium">Show:</label>
            <select
              id="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
            >
              <option value="all">All Reports</option>
              {user && <option value="my">My Reports</option>}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-gray-500 font-medium">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="urgency">Urgency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report list */}
      <div className="space-y-4">
        {sortedReports.map((report) => (
          <ReportListItem key={report.id} report={report} />
        ))}
      </div>
    </div>
  )
}

export default ReportsView
