import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getJobDetail } from '../../api/job'
import { applyJob } from '../../api/application'

const SALARY_TYPE = ['小时', '天', '月']
const DEGREE_OPTIONS = ['大专', '本科', '硕士', '博士', '其他']
const CUR_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => String(CUR_YEAR + 3 - i))

const emptyForm = {
  // 基本信息
  realName:       '',
  phone:          '',
  email:          '',
  // 教育背景
  school:         '',
  major:          '',
  degree:         '本科',
  graduationYear: '',
  // 技能经历
  skills:         '',
  experience:     '',
  selfIntro:      '',
  // 留言
  coverLetter:    '',
}

function validate(form) {
  const e = {}
  if (!form.realName.trim())                             e.realName = '真实姓名不能为空'
  else if (form.realName.trim().length > 20)             e.realName = '姓名不超过20字'

  if (!form.phone.trim())                                e.phone = '手机号不能为空'
  else if (!/^1[3-9]\d{9}$/.test(form.phone.trim()))    e.phone = '手机号格式不正确（11位大陆手机号）'

  if (!form.email.trim())                                e.email = '邮箱不能为空'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '邮箱格式不正确'

  if (!form.school.trim())                               e.school         = '学校不能为空'
  if (!form.major.trim())                                e.major          = '专业不能为空'
  if (!form.graduationYear)                              e.graduationYear = '请选择毕业年份'

  if (!form.selfIntro.trim())                            e.selfIntro = '自我介绍不能为空'
  else if (form.selfIntro.trim().length < 30)            e.selfIntro = `自我介绍至少30字（当前${form.selfIntro.trim().length}字）`

  return e
}

function FieldErr({ errors, name }) {
  return errors[name]
    ? <div className="field-error">⚠ {errors[name]}</div>
    : null
}

export default function JobDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const fileRef   = useRef()

  const [job, setJob]       = useState(null)
  const [step, setStep]     = useState(1)   // 1=详情 2=投递
  const [form, setForm]     = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [file, setFile]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  getJobDetail(id).then(res => {
    if (res.code === 200) setJob(res.data);
    setForm(prev => ({
      ...prev,
      realName: localStorage.getItem('realName') || '',
      email: localStorage.getItem('email') || '',
    }));
  });
}, [id]);   // 依赖数组正确放在 useEffect 的第二个参数

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => { const n = {...e}; delete n[key]; return n })
  }

  const handleFileChange = e => {
    const f = e.target.files[0]
    if (!f) return
    if (f.type !== 'application/pdf') { alert('请上传 PDF 格式的简历文件'); return }
    if (f.size > 5 * 1024 * 1024)    { alert('文件大小不能超过 5MB'); return }
    setFile(f)
  }

  const handleSubmit = async () => {
  const errs = validate(form)
  setErrors(errs)
  if (Object.keys(errs).length > 0) return
  
  setLoading(true)
  try {
    const payload = {
      jobId: Number(id),
      studentId: localStorage.getItem('userId'),
      // 把整个表单都传过去
      ...form,
      // 如果有文件，需要单独处理（FormData）
    }
    const res = await applyJob(payload)
    alert(res.message)
    if (res.code === 200) navigate('/student/applications')
  } finally {
    setLoading(false)
  }
}
  if (!job) return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">加载中...</div></div>
      </div>
    </>
  )

  /* ── Step 1: 岗位详情 ── */
  if (step === 1) return (
    <>
      <Navbar />
      <div className="detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h2 className="detail-title">{job.title}</h2>
            {job.companyName && (
              <div style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 8 }}>🏢 {job.companyName}</div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.categoryName && <span className="tag tag-pending">{job.categoryName}</span>}
              <span className="tag tag-active">招募中</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="card-salary" style={{ marginBottom: 0 }}>
              ¥{job.salary}
              <span className="card-salary-unit">/{SALARY_TYPE[job.salaryType] ?? '小时'}</span>
            </div>
          </div>
        </div>

        <div className="detail-meta-grid">
          <div className="detail-meta-item">📍 {job.location || '未填写'}</div>
          <div className="detail-meta-item">🕐 {job.workTime || '面议'}</div>
          <div className="detail-meta-item">👥 招募 {job.headcount ?? 1} 人</div>
          <div className="detail-meta-item">📅 截止 {job.deadline || '未设定'}</div>
        </div>

        <div className="detail-section-title">岗位描述</div>
        <p className="detail-content">{job.description || '暂无描述'}</p>

        <div className="detail-section-title">任职要求</div>
        <p className="detail-content">{job.requirement || '暂无要求'}</p>

        <div className="divider" />

        <button
          className="btn btn-primary btn-block"
          style={{ padding: '14px', fontSize: 15 }}
          onClick={() => setStep(2)}
        >
          📝 立即投递
        </button>
      </div>
    </>
  )

  /* ── Step 2: 投递简历 ── */
  const introLen = form.selfIntro.trim().length
  const introClass = introLen === 0 ? '' : introLen < 30 ? 'warn' : 'ok'

  return (
    <>
      <Navbar />
      <div className="detail-card">
        {/* 返回 */}
        <div className="apply-back" onClick={() => setStep(1)}>
          ← 返回岗位详情
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>投递简历</h2>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
          投递至：<strong style={{ color: 'var(--gray-700)' }}>{job.title}</strong>
        </p>

        <div className="info-box">
          ℹ️ 以下信息将完整展示给用人单位，请如实、认真填写
        </div>

        {/* ── 基本信息 ── */}
        <div className="form-section">
          <div className="form-section-title">👤 基本信息</div>

          <label className="form-label">真实姓名 <span className="required">*</span></label>
          <input
            className={`form-input ${errors.realName ? 'is-error' : ''}`}
            placeholder="请输入真实姓名"
            value={form.realName}
            onChange={e => set('realName', e.target.value)}
          />
          <FieldErr errors={errors} name="realName" />

          <div className="form-row form-row-2">
            <div>
              <label className="form-label">手机号 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.phone ? 'is-error' : ''}`}
                placeholder="1XXXXXXXXXX"
                maxLength={11}
                value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
              />
              <FieldErr errors={errors} name="phone" />
            </div>
            <div>
              <label className="form-label">电子邮箱 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.email ? 'is-error' : ''}`}
                placeholder="example@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
              <FieldErr errors={errors} name="email" />
            </div>
          </div>
        </div>

        {/* ── 教育背景 ── */}
        <div className="form-section">
          <div className="form-section-title">🎓 教育背景</div>

          <label className="form-label">学校名称 <span className="required">*</span></label>
          <input
            className={`form-input ${errors.school ? 'is-error' : ''}`}
            placeholder="就读/毕业学校全称"
            value={form.school}
            onChange={e => set('school', e.target.value)}
          />
          <FieldErr errors={errors} name="school" />

          <div className="form-row form-row-3">
            <div>
              <label className="form-label">专业 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.major ? 'is-error' : ''}`}
                placeholder="所学专业"
                value={form.major}
                onChange={e => set('major', e.target.value)}
              />
              <FieldErr errors={errors} name="major" />
            </div>
            <div>
              <label className="form-label">学历 <span className="required">*</span></label>
              <select className="form-select" value={form.degree}
                onChange={e => set('degree', e.target.value)}>
                {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">毕业年份 <span className="required">*</span></label>
              <select
                className={`form-select ${errors.graduationYear ? 'is-error' : ''}`}
                value={form.graduationYear}
                onChange={e => set('graduationYear', e.target.value)}
              >
                <option value="">请选择</option>
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}年</option>)}
              </select>
              <FieldErr errors={errors} name="graduationYear" />
            </div>
          </div>
        </div>

        {/* ── 技能与经历 ── */}
        <div className="form-section">
          <div className="form-section-title">💡 技能与经历</div>

          <label className="form-label">技能特长</label>
          <textarea
            className="form-textarea" rows={2}
            placeholder="如：熟练使用 Office 办公软件，具备良好的沟通协调能力..."
            value={form.skills}
            onChange={e => set('skills', e.target.value)}
          />

          <label className="form-label">实习 / 兼职经历</label>
          <textarea
            className="form-textarea" rows={3}
            placeholder="如有相关经历，请简要描述（时间、单位、职责）..."
            value={form.experience}
            onChange={e => set('experience', e.target.value)}
          />

          <label className="form-label">
            自我介绍 <span className="required">*</span>
            <span className={`char-counter ${introClass}`} style={{ marginLeft: 8 }}>
              {introLen} / 至少 30 字
            </span>
          </label>
          <textarea
            className={`form-textarea ${errors.selfIntro ? 'is-error' : ''}`} rows={4}
            placeholder="介绍自己的性格、优势、求职动机，让用人单位更了解你..."
            value={form.selfIntro}
            onChange={e => set('selfIntro', e.target.value)}
          />
          <FieldErr errors={errors} name="selfIntro" />
        </div>

        {/* ── 简历附件 ── */}
        <div className="form-section">
          <div className="form-section-title">📄 简历附件</div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div
            className={`file-upload-zone ${file ? 'has-file' : ''}`}
            onClick={() => fileRef.current.click()}
          >
            <div className="file-upload-icon">{file ? '✅' : '📎'}</div>
            {file ? (
              <>
                <div className="file-upload-title">{file.name}</div>
                <div className="file-upload-hint">
                  {(file.size / 1024).toFixed(0)} KB · 点击可重新选择
                </div>
              </>
            ) : (
              <>
                <div className="file-upload-title">点击上传简历 PDF</div>
                <div className="file-upload-hint">支持 PDF 格式，大小不超过 5MB（选填，建议上传）</div>
              </>
            )}
          </div>

          <label className="form-label">附加留言（选填）</label>
          <textarea
            className="form-textarea" rows={2}
            placeholder="给用人单位的一句话补充说明..."
            value={form.coverLetter}
            onChange={e => set('coverLetter', e.target.value)}
          />
        </div>

        {/* 校验总提示 */}
        {Object.keys(errors).length > 0 && (
          <div className="form-error">
            ⚠️ 请检查并修正标红的必填项，共 {Object.keys(errors).length} 处
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>
            ← 返回查看
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ 提交中...' : '🚀 确认投递'}
          </button>
        </div>
      </div>
    </>
  )
}
