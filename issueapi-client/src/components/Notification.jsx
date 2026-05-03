import { useNotification } from '../stores/notificationStore'

/**
 * A global notification component that displays success or error messages.
 * Uses the `notificationStore` to determine visibility and content.
 *
 * @returns {JSX.Element|null} The notification element, or null if no message is set.
 */
const Notification = () => {
    const { message, msgType } = useNotification()

    if (!message) {
        return null
    }

    const baseClasses =
        'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg border text-sm font-medium animate-fade-in max-w-lg text-center'

    const typeClasses =
        msgType === 'error'
            ? 'bg-red-50 border-red-300 text-red-700'
            : 'bg-accent-50 border-accent-300 text-accent-700'

    return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>
}

export default Notification
