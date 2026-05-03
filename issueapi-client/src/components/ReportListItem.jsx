import { useNavigate } from 'react-router-dom'


/**
 * Component that renders a single report as a list item.
 * Clicking the item navigates the user to the detailed view of the report.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.report - The report object to render.
 * @returns {JSX.Element} The rendered report list item.
 */
const ReportListItem = ({ report }) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/reports/${report.id}`)
    }

    return (
        <div
            onClick={handleClick}
            className="bg-surface-card rounded-xl border border-gray-200/80 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200 group"
        >
            {/* Report type badge */}
            <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-purple-100 text-purple-800`}
            >
                {report.report_type?.name}
            </span>

            {/* Description */}
            <p className="mt-3 text-gray-700 leading-relaxed line-clamp-3">
                {report.description}
            </p>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {report.user_name}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {report.location}
                </span>

                <span className="ml-auto flex items-center gap-3">
                    {!isNaN(report.urgency_score) && (
                        <span className="text-sm font-medium">
                            {report.urgency_score}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-primary-600 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                        {report.upvote_count}
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
        </div>
    )
}

export default ReportListItem
