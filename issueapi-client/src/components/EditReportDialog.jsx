import { useState, useEffect } from 'react'
import { useReportTypes } from '../hooks/useReportTypes'

const EditReportDialog = ({ isOpen, onClose, report, onUpdate }) => {
    const { reportTypes } = useReportTypes()
    const [formData, setFormData] = useState({
        description: '',
        location: '',
        report_type_id: '',
    })

    useEffect(() => {
        if (report && isOpen) {
            setFormData({
                description: report.description || '',
                location: report.location || '',
                report_type_id: report.report_type?.id || '',
            })
        }
    }, [report, isOpen])

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onUpdate({
            ...formData,
            report_type_id: Number(formData.report_type_id)
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-primary-50">
                    <h2 className="text-lg font-semibold text-primary-800">Edit Report</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="report_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Report Type
                        </label>
                        <select
                            id="report_type_id"
                            name="report_type_id"
                            value={formData.report_type_id}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
                        >
                            <option value="" disabled>Select a type</option>
                            {reportTypes?.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="E.g., Central Park"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            placeholder="Describe the issue..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors resize-y"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditReportDialog