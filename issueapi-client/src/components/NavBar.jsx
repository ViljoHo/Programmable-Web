import { Link } from 'react-router-dom'
import { useUser, useUserActions } from '../stores/userStore'

/**
 * The navigation bar component displayed at the top of the application.
 * Provides links to home, create report, and login/logout actions.
 *
 * @returns {JSX.Element} The rendered navigation bar.
 */
const NavBar = () => {
    const user = useUser()
    const { logout } = useUserActions()

    return (
        <nav className="sticky top-0 z-40 bg-surface-card/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link
                    to="/"
                    className="text-lg font-bold tracking-tight text-primary-800 hover:text-primary-600 transition-colors"
                >
                    Issue Reporting System
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        to="/create"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
                    >
                        <span className="text-base leading-none">+</span>
                        Create Report
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 hidden sm:inline">
                                Hello, <span className="font-medium text-gray-800">{user.name}</span>
                            </span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default NavBar
