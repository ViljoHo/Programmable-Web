//import { useEffect } from 'react'
//import { useReportActions, useReportsStore } from './stores/reportsStore'
import { Routes, Route } from 'react-router-dom'
import OneReportView from './components/OneReportView'
import ReportsView from './components/ReportsView'
import CreateReportView from './components/CreateReportView'
import LoginView from './components/LoginView'
import RegisterView from './components/RegisterView'
import NavBar from './components/NavBar'
import Notification from './components/Notification'

const App = () => {
    return (
        <div>
            <NavBar />
            <Notification />

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
        </div>
    )
}

export default App
