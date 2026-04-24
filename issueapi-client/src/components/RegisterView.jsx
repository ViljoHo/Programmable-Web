import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/users'
import { useUserActions } from '../stores/userStore'

const RegisterView = () => {
    const [userName, setUserName] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [error, setError] = useState(null)
    const { login } = useUserActions()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        try {
            await registerUser(userName, apiKey)
            navigate('/login')
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div>
            <h1>Register</h1>
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
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default RegisterView
