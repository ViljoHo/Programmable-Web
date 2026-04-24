import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReports } from '../hooks/useReports'
import { useReportTypes } from '../hooks/useReportTypes'
import { useUser } from '../stores/userStore'
import { useNotificationActions } from '../stores/notificationStore'

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
        return <div>You must be logged in to create a report.</div>
    }

    if (isPending) {
        return <div>Loading report types...</div>
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
            <h1>Create Report</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Report Type: </label>
                    <select
                        value={reportTypeId}
                        onChange={(e) => setReportTypeId(e.target.value)}
                        required
                    >
                        <option value="">Select a type...</option>
                        {reportTypes?.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Description: </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Location: </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    )
}

export default CreateReport


