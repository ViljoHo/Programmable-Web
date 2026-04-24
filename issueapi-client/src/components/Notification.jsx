import { useNotification } from '../stores/notificationStore'

const Notification = () => {
    const { message, msgType } = useNotification()

    const errorStyle = {
        color: 'red',
        backgroundColor: 'lightcoral',
        border: '1px solid red',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
    }

    const successStyle = {
        color: 'green',
        backgroundColor: 'lightgreen',
        border: '1px solid green',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
    }

    if (!message) {
        return null
    }

    return (
        <div style={msgType === 'error' ? errorStyle : successStyle}>
            {message}
        </div>
    )
}

export default Notification

