import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useUserActions } from '../stores/userStore'
import { useNotificationActions } from '../stores/notificationStore'

const LoginView = () => {
    const [userName, setUserName] = useState('')
    const [apiKey, setApiKey] = useState('')
    const { login, logout } = useUserActions()
    const { showNotification } = useNotificationActions()
    const user = useUser()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await login(userName, apiKey)
            navigate('/')
        } catch (err) {
            showNotification(err.message, 'error')
        }
    }

    if (user) {
        return (
            <div className="max-w-md mx-auto mt-12">
                <div className="bg-surface-card rounded-xl shadow-lg border border-gray-200/80 p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Account</h1>
                    <p className="text-gray-600 mb-6">
                        Logged in as <span className="font-semibold text-gray-800">{user.name}</span>
                    </p>
                    <button
                        onClick={logout}
                        className="w-full py-3 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto mt-12">
            <div className="bg-surface-card rounded-xl shadow-lg border border-gray-200/80 p-8">
                {/* Header */}
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-8 pb-4 bg-primary-50 -mx-8 -mt-8 px-8 pt-8 rounded-t-xl">
                    Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="login-username" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Username
                        </label>
                        <input
                            id="login-username"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter username"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="login-apikey" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            API Key
                        </label>
                        <input
                            id="login-apikey"
                            type="password"
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
                        Login
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="w-full mt-3 py-3 text-sm font-semibold rounded-lg bg-amber-300 text-gray-800 hover:bg-amber-400 transition-colors"
                >
                    Create a New Account
                </button>
            </div>
        </div>
    )
}

export default LoginView
