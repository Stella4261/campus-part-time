import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import request from '../../utils/request'

const STATUS_MAP = [
  { label: '待审核', color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
  { label: '已认证', color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
  { label: '审核拒绝', color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7' },
]

// ✅ 修复：移除未使用的 allValues 参数
function validateField(name, value) {
  switch (name) {
    case 'companyName':
      if (!value?.trim()) return '企业名称不能为空'
      if (value.trim().length < 2) return '企业名称至少2个字'
      if (value.trim().length > 50) return '企业名称不超过50个字'
      return ''
    case 'contactName':
      if (value && (value.length < 2 || value.length > 20)) return '联系人姓名2~20个字'
      return ''
    case 'industry':
      if (value && value.length > 30) return '行业名称不超过30个字'
      return ''
    case 'address':
      if (value && value.length > 100) return '地址不超过100个字'
      return ''
    case 'description':
      if (value && value.length > 500) return '企业简介不超过500字'
      return ''
    default:
      return ''
  }
}

export default function EmployerProfile() {
  const [form, setForm] = useState({
    companyName: '', contactName: '',
    industry: '', address: '', description: ''
  })
  const [verifyStatus, setVerifyStatus] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })

  // 获取企业资料
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await request.get('/api/employer/profile')
        if (res.code === 200 && res.data) {
          setForm({
            companyName:  res.data.companyName  || '',
            contactName:  res.data.contactName  || '',
            industry:     res.data.industry     || '',
            address:      res.data.address      || '',
            description:  res.data.description  || '',
          })
          setVerifyStatus(res.data.verifyStatus ?? 0)
        }
      } catch {
        // ✅ 修复：移除未使用的 err 变量
        console.error('加载企业信息失败')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // 统一更新表单字段并实时验证
  const updateField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    const error = validateField(name, value)  // 不再传 allValues
    setFieldErrors(prev => ({ ...prev, [name]: error }))
  }

  // 整体校验
  const validateForm = () => {
    const errors = {}
    Object.keys(form).forEach(key => {
      const err = validateField(key, form[key])
      if (err) errors[key] = err
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setSubmitting(true)
    setSubmitMessage({ type: '', text: '' })
    try {
      const res = await request.put('/api/employer/profile', form)
      if (res.code === 200) {
        setSubmitMessage({ type: 'success', text: '保存成功，已提交审核，请耐心等待' })
        // 刷新认证状态
        if (res.data && res.data.verifyStatus !== undefined) {
          setVerifyStatus(res.data.verifyStatus)
        } else {
          const profileRes = await request.get('/api/employer/profile')
          if (profileRes.code === 200 && profileRes.data) {
            setVerifyStatus(profileRes.data.verifyStatus ?? 0)
          }
        }
      } else {
        setSubmitMessage({ type: 'error', text: res.message || '保存失败，请重试' })
      }
    } catch {
      setSubmitMessage({ type: 'error', text: '网络错误，请稍后重试' })
    } finally {
      setSubmitting(false)
      if (submitMessage.type === 'success') {
        setTimeout(() => setSubmitMessage({ type: '', text: '' }), 3000)
      }
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-text">加载中...</div>
          </div>
        </div>
      </>
    )
  }

  const currentStatus = STATUS_MAP[verifyStatus] || STATUS_MAP[0]

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="page-title" style={{ marginBottom: 0 }}>企业信息</h2>
          <span
            className="tag"
            style={{
              color: currentStatus.color,
              backgroundColor: currentStatus.bg,
              border: `1px solid ${currentStatus.border}`,
              fontWeight: 600,
              padding: '4px 12px',
            }}
          >
            {currentStatus.label}
          </span>
        </div>

        {verifyStatus === 0 && (
          <div
            className="card"
            style={{
              marginBottom: 20,
              background: currentStatus.bg,
              borderColor: currentStatus.border,
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>⏳</span>
              <div style={{ fontSize: 13, color: currentStatus.color, lineHeight: 1.5 }}>
                企业尚未完成认证，请完善信息并提交，等待管理员审核通过后方可发布职位。
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '28px 30px' }}>
          <div className="form-section">
            <div className="form-section-title">🏢 基本信息</div>
            <div className="form-group">
              <label className="form-label">企业名称 <span className="required">*</span></label>
              <input
                className={`form-input ${fieldErrors.companyName ? 'is-error' : ''}`}
                placeholder="请填写企业全称"
                value={form.companyName}
                onChange={e => updateField('companyName', e.target.value)}
              />
              {fieldErrors.companyName && <div className="field-error">⚠ {fieldErrors.companyName}</div>}
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">所属行业</label>
                <input
                  className="form-input"
                  placeholder="如：互联网、餐饮、教育"
                  value={form.industry}
                  onChange={e => updateField('industry', e.target.value)}
                />
                {fieldErrors.industry && <div className="field-error">⚠ {fieldErrors.industry}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">公司地址</label>
                <input
                  className="form-input"
                  placeholder="所在城市或详细地址"
                  value={form.address}
                  onChange={e => updateField('address', e.target.value)}
                />
                {fieldErrors.address && <div className="field-error">⚠ {fieldErrors.address}</div>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">📞 联系信息</div>
            <div className="form-group">
              <label className="form-label">联系人姓名</label>
              <input
                className="form-input"
                placeholder="HR 或负责人姓名"
                value={form.contactName}
                onChange={e => updateField('contactName', e.target.value)}
              />
              {fieldErrors.contactName && <div className="field-error">⚠ {fieldErrors.contactName}</div>}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">📄 企业简介</div>
            <div className="form-group">
              <textarea
                className={`form-textarea ${fieldErrors.description ? 'is-error' : ''}`}
                rows={5}
                placeholder="介绍公司业务、发展历程、文化氛围等"
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
              />
              {fieldErrors.description && <div className="field-error">⚠ {fieldErrors.description}</div>}
              <div className="form-hint" style={{ textAlign: 'right', marginTop: 4 }}>
                {form.description.length}/500
              </div>
            </div>
          </div>

          {submitMessage.text && (
            <div
              className="info-box"
              style={{
                background: submitMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                borderColor: submitMessage.type === 'success' ? '#b7eb8f' : '#ffccc7',
                color: submitMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
                marginBottom: 24,
              }}
            >
              {submitMessage.type === 'success' ? '✅' : '❌'} {submitMessage.text}
            </div>
          )}

          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 8, padding: '12px' }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '⏳ 提交中...' : (verifyStatus === 0 ? '📋 提交审核' : '💾 保存修改')}
          </button>

          <p className="form-hint" style={{ textAlign: 'center', marginTop: 16 }}>
            提交后信息将被更新，并重新进入审核流程。
          </p>
        </div>
      </div>
    </>
  )
}