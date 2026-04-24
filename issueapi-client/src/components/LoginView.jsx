import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useUserActions } from '../stores/userStore'

const LoginView = () => {
    const [userName, setUserName] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [error, setError] = useState(null)
    const { login, logout } = useUserActions()
    const user = useUser()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        try {
            await login(userName, apiKey)
            navigate('/')
        } catch (err) {
            setError(err.message)
        }
    }

    if (user) {
        return (
            <div>
                <h1>Login</h1>
                <p>Logged in as {user.name}</p>
                <button onClick={logout}>Logout</button>
            </div>
        )
    }

    return (
        <div>
            <h1>Login</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>API Key: </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/register')}>
                    Create new account
                </button>
            </p>
        </div>
    )
}

export default LoginView
