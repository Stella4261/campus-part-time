import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'

const GRADES = ['大一', '大二', '大三', '大四', '研一', '研二', '研三']

function validate(form) {
  const e = {}
  if (!form.username.trim())                          e.username = '用户名不能为空'
  else if (form.username.trim().length < 3)           e.username = '用户名至少3个字符'
  else if (form.username.trim().length > 20)          e.username = '用户名不超过20个字符'

  if (!form.password)                                 e.password = '密码不能为空'
  else if (form.password.length < 6)                  e.password = '密码至少6位'

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                                      e.email    = '邮箱格式不正确'

  if (form.role === 1) {
    if (!form.realName?.trim())                       e.realName = '真实姓名不能为空'
    if (!form.school?.trim())                         e.school   = '学校不能为空'
    if (!form.grade)                                  e.grade    = '请选择年级'
  }
  if (form.role === 2) {
    if (!form.companyName?.trim())                    e.companyName = '企业名称不能为空'
    if (!form.contactName?.trim())                    e.contactName = '联系人姓名不能为空'
  }
  return e
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', password: '', role: 1, email: '',
    realName: '', school: '', major: '', grade: '',
    companyName: '', contactName: '', industry: '', description: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => { const n = {...e}; delete n[key]; return n })
  }

  const handleSubmit = async () => {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true); setApiError('')
    try {
      const res = await register(form)
      if (res.code === 200) { alert('注册成功！请登录'); navigate('/login') }
      else setApiError(res.message || '注册失败，请稍后重试')
    } catch { setApiError('网络错误，请稍后重试') }
    finally  { setLoading(false) }
  }


  return (
    <div className="form-center">
      <div className="form-box" style={{ maxWidth: 480 }}>
        <div className="form-logo">📝</div>
        <h2 className="form-title">注册账号</h2>
        <p className="form-subtitle">加入校园兼职平台</p>

        {/* 角色选择 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[{ val: 1, icon: '🎓', label: '我是学生' }, { val: 2, icon: '🏢', label: '我是企业' }].map(r => (
            <div
              key={r.val}
              onClick={() => set('role', r.val)}
              style={{
                border: `2px solid ${form.role === r.val ? 'var(--primary)' : 'var(--gray-200)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                background: form.role === r.val ? 'var(--primary-light)' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 22 }}>{r.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: form.role === r.val ? 'var(--primary)' : 'var(--gray-700)', marginTop: 4 }}>
                {r.label}
              </div>
            </div>
          ))}
        </div>

       {/* 公共字段 */}
        <div className="form-group">
          <label className="form-label">用户名 <span className="required">*</span></label>
          <input className={`form-input ${errors.username ? 'is-error' : ''}`}
            placeholder="3~20个字符"
            value={form.username}
            onChange={e => set('username', e.target.value)} />
          {errors.username && <div className="field-error">⚠ {errors.username}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">密码 <span className="required">*</span></label>
          <input className={`form-input ${errors.password ? 'is-error' : ''}`}
            type="password" placeholder="至少6位"
            value={form.password}
            onChange={e => set('password', e.target.value)} />
          {errors.password && <div className="field-error">⚠ {errors.password}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">邮箱</label>
          <input className={`form-input ${errors.email ? 'is-error' : ''}`}
            placeholder="选填"
            value={form.email}
            onChange={e => set('email', e.target.value)} />
          {errors.email && <div className="field-error">⚠ {errors.email}</div>}
        </div>


        {/* 学生字段 */}
        {form.role === 1 && (
          <>
            {/* ... 省略标题 ... */}
            <div className="form-group">
              <label className="form-label">真实姓名 <span className="required">*</span></label>
              <input className={`form-input ${errors.realName ? 'is-error' : ''}`}
                placeholder="请输入真实姓名"
                value={form.realName}
                onChange={e => set('realName', e.target.value)} />
              {errors.realName && <div className="field-error">⚠ {errors.realName}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">学校 <span className="required">*</span></label>
                <input className={`form-input ${errors.school ? 'is-error' : ''}`}
                  placeholder="所在学校"
                  value={form.school}
                  onChange={e => set('school', e.target.value)} />
                {errors.school && <div className="field-error">⚠ {errors.school}</div>}
              </div>
              {/* ... 专业字段不变 ... */}
            </div>
            <div className="form-group">
              <label className="form-label">年级 <span className="required">*</span></label>
              <select className={`form-select ${errors.grade ? 'is-error' : ''}`}
                value={form.grade}
                onChange={e => set('grade', e.target.value)}>
                <option value="">请选择年级</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.grade && <div className="field-error">⚠ {errors.grade}</div>}
            </div>
          </>
        )}


        {form.role === 2 && (
  <div style={{ borderTop: '1px solid var(--gray-200)', marginBottom: 14, paddingTop: 14 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      企业信息
    </div>

    <div className="form-group">
      <label className="form-label">企业名称 <span className="required">*</span></label>
      <input
        className={`form-input ${errors.companyName ? 'is-error' : ''}`}
        placeholder="请输入企业全称"
        value={form.companyName}
        onChange={e => set('companyName', e.target.value)}
      />
      {errors.companyName && <div className="field-error">⚠ {errors.companyName}</div>}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div className="form-group">
        <label className="form-label">联系人姓名 <span className="required">*</span></label>
        <input
          className={`form-input ${errors.contactName ? 'is-error' : ''}`}
          placeholder="HR或负责人姓名"
          value={form.contactName}
          onChange={e => set('contactName', e.target.value)}
        />
        {errors.contactName && <div className="field-error">⚠ {errors.contactName}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">所属行业</label>
        <input
          className="form-input"
          placeholder="如：互联网、餐饮"
          value={form.industry}
          onChange={e => set('industry', e.target.value)}
        />
      </div>
    </div>

    <div className="form-group">
      <label className="form-label">企业简介</label>
      <textarea
        className="form-textarea"
        rows={2}
        placeholder="简要介绍公司业务..."
        value={form.description}
        onChange={e => set('description', e.target.value)}
      />
    </div>
  </div>
)}

        {apiError && <div className="form-error">⚠ {apiError}</div>}

        <button className="btn btn-primary btn-block btn-lg"
          onClick={handleSubmit} disabled={loading}>
          {loading ? '注册中...' : '完成注册'}
        </button>

        <div className="form-footer">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  )
}
