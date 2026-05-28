import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async () => {
    if (!form.username.trim()) { setError('请输入用户名'); return }
    if (!form.password)        { setError('请输入密码');   return }
    setLoading(true); setError('')
    try {
      const res = await login(form)
      if (res.code === 200) {
        localStorage.setItem('token',  res.data.token)
        localStorage.setItem('role',   res.data.role)
        localStorage.setItem('userId', res.data.userId)
        if (res.data.realName)  localStorage.setItem('realName', res.data.realName)
        if (res.data.email)     localStorage.setItem('email',    res.data.email)
        const roleMap = { 0: '/admin/users', 1: '/student/jobs', 2: '/employer/jobs' }
        navigate(roleMap[res.data.role] ?? '/login')
      } else {
        setError(res.message || '账号或密码错误')
      }
    } catch {
      setError('网络错误，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-center">
      <div className="form-box">
        <div className="form-logo">🎓</div>
        <h2 className="form-title">校园兼职平台</h2>
        <p className="form-subtitle">登录账号，开启兼职之旅</p>

        <div className="form-group">
          <label className="form-label">用户名</label>
          <input
            className="form-input"
            placeholder="请输入用户名"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">密码</label>
          <input
            className="form-input"
            placeholder="请输入密码"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <div className="form-error">⚠ {error}</div>}

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? '登录中...' : '登 录'}
        </button>

        <div className="form-footer">
          没有账号？<Link to="/register">立即注册</Link>
        </div>
      </div>
    </div>
  )
}
