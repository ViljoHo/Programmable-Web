import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReports } from '../hooks/useReports'
import { useReportTypes } from '../hooks/useReportTypes'
import { useUser } from '../stores/userStore'
import { useNotificationActions } from '../stores/notificationStore'

/**
 * Component that renders a form for users to create a new report.
 * Requires the user to be logged in; otherwise displays an error message.
 *
 * @returns {JSX.Element} The rendered CreateReport view.
 */
const CreateReport = () => {
    const [reportTypeId, setReportTypeId] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const { addReport } = useReports()
    const { reportTypes, isPending } = useReportTypes()
    const { showNotification } = useNotificationActions()
    const user = useUser()
    const navigate = useNavigate()

    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-12">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <p className="text-amber-800 font-medium">You must be logged in to create a report.</p>
                </div>
            </div>
        )
    }

    if (isPending) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500">
                <svg className="animate-spin h-5 w-5 mr-3 text-primary-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading report types...
            </div>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            addReport(
                { report_type_id: parseInt(reportTypeId), description, location },
                {
                    onSuccess: () => {
                        showNotification('A new report created successfully!', 'success', 5)
                        navigate('/')
                    },
                    onError: (err) => showNotification(err.message, 'error', 5)
                }
            )
        } catch (err) {
            showNotification(err.message, 'error', 5)
        }
    }

    return (
        <div>
            {/* Header */}
            <h1 className="text-sm font-semibold uppercase tracking-wider text-accent-700 bg-accent-50 px-4 py-2.5 rounded-t-xl">
                Create a New Report
            </h1>

            <div className="bg-surface-card rounded-b-xl border border-t-0 border-gray-200/80 shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Report Type */}
                    <div>
                        <label htmlFor="report-type" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Report Topic
                        </label>
                        <select
                            id="report-type"
                            value={reportTypeId}
                            onChange={(e) => setReportTypeId(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 transition-colors"
                        >
                            <option value="">Select the category that best describes the issue</option>
                            {reportTypes?.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="report-description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            id="report-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide a clear description of the issue"
                            required
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 transition-colors resize-y"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="report-location" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Location
                        </label>
                        <input
                            id="report-location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter the location of the issue"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-3 text-sm font-semibold rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors shadow-sm"
                    >
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateReport
