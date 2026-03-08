import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

import Login from './pages/Login'
import Home from './pages/Home'
import Demo from './pages/Demo'
import StudentCheckIn from './pages/StudentCheckIn'
import Alerts from './pages/Alerts'
import ManageStudents from './pages/ManageStudents'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherQuestionManagement from './pages/TeacherQuestionManagement'
import StudentMatching from './pages/StudentMatching'
import ManagePartners from './pages/ManagePartners'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"   element={<Login />} />
          <Route path="/demo"    element={<Demo />} />
          <Route path="/checkin" element={<StudentCheckIn />} />

          {/* Staff - requires auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="/"          element={<Home />} />
            <Route path="/dashboard" element={<TeacherDashboard />} />
            <Route path="/alerts"    element={<Alerts />} />
            <Route path="/students"  element={<ManageStudents />} />
            <Route path="/questions" element={<TeacherQuestionManagement />} />
            <Route path="/matching"  element={<StudentMatching />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/partners" element={<ManagePartners />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
