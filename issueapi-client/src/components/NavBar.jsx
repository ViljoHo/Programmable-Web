import { Link } from 'react-router-dom'
import { useUser, useUserActions } from '../stores/userStore'

const NavBar = () => {
    const padding = {
        padding: 5
    }

    const user = useUser()
    const { logout } = useUserActions()

    return (
        <div>
            <Link style={padding} to="/">
                reports
            </Link>

            <Link style={padding} to="/create">
                create report
            </Link>

            {user ? (
                <>
                    <span style={padding}>Hello!, {user.name}</span>
                    <button style={padding} onClick={logout}>logout</button>
                </>
            ) : (
                <Link style={padding} to="/login">
                    login
                </Link>
            )}
        </div>
    )
}

export default NavBar
