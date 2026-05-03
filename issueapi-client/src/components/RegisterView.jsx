import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/users'
import { useNotificationActions } from '../stores/notificationStore'

/**
 * Component that provides a form for registering a new user account.
 * Upon successful registration, redirects the user to the login page.
 *
 * @returns {JSX.Element} The rendered Register view.
 */
const RegisterView = () => {
    const [userName, setUserName] = useState('')
    const [apiKey, setApiKey] = useState('')

    const { showNotification } = useNotificationActions()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await registerUser(userName, apiKey)
            navigate('/login')
        } catch (err) {
            showNotification(err.message, 'error')
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12">
            <div className="bg-surface-card rounded-xl shadow-lg border border-gray-200/80 p-8">
                {/* Header */}
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-8 pb-4 bg-primary-50 -mx-8 -mt-8 px-8 pt-8 rounded-t-xl">
                    Create a New Account
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="register-username" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Username
                        </label>
                        <input
                            id="register-username"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter username"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="register-apikey" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            API Key
                        </label>
                        <input
                            id="register-apikey"
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter API key"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 text-sm font-semibold rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors shadow-sm"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RegisterView
