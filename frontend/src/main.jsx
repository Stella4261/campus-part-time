import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import EmployerProfile from './pages/employer/EmployerProfile'

// 样式
import './styles/global.css'

// 路由守卫
import PrivateRoute from './components/PrivateRoute'

// 公共页面
import Login    from './pages/Login'
import Register from './pages/Register'

// 学生端
import JobList         from './pages/student/JobList'
import JobDetail       from './pages/student/JobDetail'
import MyApplications  from './pages/student/MyApplications'

// 企业端
import JobManage          from './pages/employer/JobManage'
import ApplicationReview  from './pages/employer/ApplicationReview'

// 管理员端
import UserManage    from './pages/admin/UserManage'
import JobAudit      from './pages/admin/JobAudit'
import EmployerAudit from './pages/admin/EmployerAudit'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 默认跳转 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 公共路由 */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 学生端 - roleRequired=1 */}
        <Route path="/student/jobs" element={
          <PrivateRoute roleRequired={1}><JobList /></PrivateRoute>
        } />
        <Route path="/student/jobs/:id" element={
          <PrivateRoute roleRequired={1}><JobDetail /></PrivateRoute>
        } />
        <Route path="/student/applications" element={
          <PrivateRoute roleRequired={1}><MyApplications /></PrivateRoute>
        } />

        {/* 企业端 - roleRequired=2 */}
        <Route path="/employer/jobs" element={
          <PrivateRoute roleRequired={2}><JobManage /></PrivateRoute>
        } />
        <Route path="/employer/applications" element={
          <PrivateRoute roleRequired={2}><ApplicationReview /></PrivateRoute>
        } />

        {/* 管理员端 - roleRequired=0 */}
        <Route path="/admin/users" element={
          <PrivateRoute roleRequired={0}><UserManage /></PrivateRoute>
        } />
        <Route path="/admin/audit" element={
          <PrivateRoute roleRequired={0}><JobAudit /></PrivateRoute>
        } />
        <Route path="/admin/employers" element={
          <PrivateRoute roleRequired={0}><EmployerAudit /></PrivateRoute>
        } />
        <Route path="/employer/profile"element={
          <PrivateRoute><EmployerProfile /></PrivateRoute>} />

        {/* 404 兜底 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
