import { useNavigate } from 'react-router-dom'

const ReportListItem = ({ report }) => {
    const style = {
        padding: 5,
        border: '1px solid black',
        marginBottom: 5,
    }

    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/reports/${report.id}`)
    }

    return (
        <div style={style} onClick={handleClick}>
            <p>Report type: {report.report_type?.name}</p>
            <p>Description: {report.description}</p>
            <p>Location: {report.location}</p>
            <p>Reported by: {report.user_name}</p>
            <p>Time: {report.timestamp}</p>
            <p>Upvotes: {report.upvote_count}</p>
        </div>
    )
}

export default ReportListItem

