import { Routes, Route } from 'react-router-dom'
import OneReportView from './components/OneReportView'
import ReportsView from './components/ReportsView'
import CreateReportView from './components/CreateReportView'
import LoginView from './components/LoginView'
import RegisterView from './components/RegisterView'
import NavBar from './components/NavBar'
import Notification from './components/Notification'

/**
 * The root application component that defines the main layout and routing structure.
 *
 * @returns {JSX.Element} The rendered application containing NavBar, Notification, and Routes.
 */
const App = () => {
    return (
        <div className="min-h-screen bg-surface font-sans text-gray-800">
            <NavBar />
            <Notification />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <Routes>
                    <Route
                        path="/reports/:id"
                        element={<OneReportView />}
                    />
                    <Route path="/login" element={<LoginView />} />
                    <Route path="/register" element={<RegisterView />} />
                    <Route path="/create" element={<CreateReportView />} />
                    <Route path="/" element={<ReportsView />} />
                </Routes>
            </main>
        </div>
    )
}

export default App
