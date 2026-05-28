import { useNavigate, useLocation } from 'react-router-dom'

const NAV_LINKS = {
  0: [
    { label: '用户管理', path: '/admin/users' },
    { label: '岗位审核', path: '/admin/audit' },
    { label: '企业审核', path: '/admin/employers' },
  ],
  1: [
    { label: '兼职大厅',  path: '/student/jobs' },
    { label: '我的投递',  path: '/student/applications' },
  ],
  2: [
    { label: '职位管理',  path: '/employer/jobs' },
    { label: '简历处理',  path: '/employer/applications' },
     { label: '企业信息',  path: '/employer/profile' },
  ],
}

const ROLE_ICON = { 0: '🛡️', 1: '🎓', 2: '🏢' }

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = Number(localStorage.getItem('role'))
  const links = NAV_LINKS[role] || []

  const handleLogout = () => {
    if (!window.confirm('确认退出登录？')) return
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => navigate('/')}>
        🎓 校园兼职平台
      </span>

      <div className="navbar-links">
        {links.map(link => (
          <span
            key={link.path}
            className={`navbar-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          {ROLE_ICON[role]} {role === 0 ? '管理员' : role === 1 ? '学生' : '企业'}
        </span>
        <span className="navbar-logout" onClick={handleLogout}>退出</span>
      </div>
    </nav>
  )
}
