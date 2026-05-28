import { Navigate, useLocation } from 'react-router-dom'

// roleRequired: 不传 = 只需登录, 传数字 = 需要特定角色
export default function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem('token')
  const role  = Number(localStorage.getItem('role'))
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roleRequired !== undefined && role !== roleRequired) {
    // 已登录但角色不符，跳回各自首页
    const home = { 0: '/admin/users', 1: '/student/jobs', 2: '/employer/jobs' }
    return <Navigate to={home[role] ?? '/login'} replace />
  }

  return children
}
