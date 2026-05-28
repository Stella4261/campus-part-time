import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import { getMyJobList, createJob, deleteJob } from '../../api/job'

const SALARY_TYPE_LABEL = ['元/小时', '元/天', '元/月']
const STATUS_LABEL = ['待审核', '招募中', '已下架', '审核拒绝']
const STATUS_TAG   = ['tag-pending', 'tag-active', 'tag-closed', 'tag-rejected']

const CATEGORIES = [
  { id: 1, name: '餐饮服务' },
  { id: 2, name: '促销导购' },
  { id: 3, name: '家教辅导' },
  { id: 4, name: 'IT技术' },
  { id: 5, name: '文案设计' },
  { id: 6, name: '派送配送' },
  { id: 7, name: '其他' },
]

const TODAY = new Date().toISOString().split('T')[0]

const emptyForm = {
  title: '', description: '', requirement: '',
  salary: '', salaryType: 0, categoryId: '',
  location: '', workTime: '', headcount: 1, deadline: '',
}

function validate(form) {
  const e = {}
  if (!form.title.trim())                          e.title       = '岗位标题不能为空'
  else if (form.title.trim().length > 30)          e.title       = '标题不超过30个字'

  if (!form.salary)                                e.salary      = '薪资不能为空'
  else if (isNaN(Number(form.salary)) || Number(form.salary) <= 0)
                                                   e.salary      = '请输入合法的薪资金额'
  else if (Number(form.salary) > 99999)            e.salary      = '薪资金额超出合理范围'

  if (!form.categoryId)                            e.categoryId  = '请选择岗位分类'
  if (!form.location.trim())                       e.location    = '工作地点不能为空'

  if (!form.description.trim())                    e.description = '岗位描述不能为空'
  else if (form.description.trim().length < 10)    e.description = '岗位描述至少10个字'

  if (form.headcount !== '' && (isNaN(Number(form.headcount))
    || Number(form.headcount) < 1 || Number(form.headcount) > 999))
                                                   e.headcount   = '招募人数需在 1~999 之间'

  if (form.deadline && form.deadline < TODAY)      e.deadline    = '截止日期不能早于今天'

  return e
}

function FieldErr({ errors, name }) {
  return errors[name]
    ? <div className="field-error">⚠ {errors[name]}</div>
    : null
}

export default function JobManage() {
  const [list, setList]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyJobList()
      setList(res.code === 200 && Array.isArray(res.data) ? res.data : [])
    } catch {
      // ✅ 修复1：去掉未使用的 err 变量
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => { const n = {...e}; delete n[key]; return n })
  }

  const handleCreate = async () => {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        salary:    Number(form.salary),
        headcount: Number(form.headcount) || 1,
        salaryType: Number(form.salaryType),
        categoryId: Number(form.categoryId),
      }
      const res = await createJob(payload)
      alert(res.message)
      if (res.code === 200) {
        setShowForm(false)
        setForm(emptyForm)
        setErrors({})
        // ✅ 修复2：将 load() 改为 fetchData()
        await fetchData()
      }
    } finally { setSubmitting(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('确认下架该岗位？下架后将不再显示给求职者')) return
    const res = await deleteJob(id)
    alert(res.message)
    // ✅ 修复2：将 load() 改为 fetchData()
    await fetchData()
  }

  const filtered = filterStatus === ''
    ? list
    : list.filter(j => j.status === Number(filterStatus))

  const counts = [0,1,2,3].reduce((a, i) => ({
    ...a, [i]: list.filter(j => j.status === i).length,
  }), {})

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">职位管理</h2>
          <button
            className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => { setShowForm(!showForm); setErrors({}) }}
          >
            {showForm ? '✕ 取消' : '＋ 发布职位'}
          </button>
        </div>

        {/* ── 发布表单 ── */}
        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 发布新职位</h3>

            {/* 标题 */}
            <div className="form-section">
              <div className="form-section-title">基本信息</div>

              <label className="form-label">岗位标题 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.title ? 'is-error' : ''}`}
                placeholder="如：周末餐厅服务员、线上家教老师..."
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
              <FieldErr errors={errors} name="title" />

              <div className="form-row form-row-2">
                <div>
                  <label className="form-label">岗位分类 <span className="required">*</span></label>
                  <select
                    className={`form-select ${errors.categoryId ? 'is-error' : ''}`}
                    value={form.categoryId}
                    onChange={e => set('categoryId', e.target.value)}
                  >
                    <option value="">请选择分类</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <FieldErr errors={errors} name="categoryId" />
                </div>
                <div>
                  <label className="form-label">工作地点 <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.location ? 'is-error' : ''}`}
                    placeholder="具体地址或区域"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                  />
                  <FieldErr errors={errors} name="location" />
                </div>
              </div>
            </div>

            {/* 薪资 */}
            <div className="form-section">
              <div className="form-section-title">薪资待遇</div>
              <div className="form-row form-row-3">
                <div>
                  <label className="form-label">薪资金额 <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.salary ? 'is-error' : ''}`}
                    placeholder="数字金额"
                    type="number"
                    min={0}
                    value={form.salary}
                    onChange={e => set('salary', e.target.value)}
                  />
                  <FieldErr errors={errors} name="salary" />
                </div>
                <div>
                  <label className="form-label">结算方式 <span className="required">*</span></label>
                  <select className="form-select" value={form.salaryType}
                    onChange={e => set('salaryType', Number(e.target.value))}>
                    <option value={0}>元 / 小时</option>
                    <option value={1}>元 / 天</option>
                    <option value={2}>元 / 月</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">招募人数</label>
                  <input
                    className={`form-input ${errors.headcount ? 'is-error' : ''}`}
                    type="number" min={1} max={999}
                    value={form.headcount}
                    onChange={e => set('headcount', e.target.value)}
                  />
                  <FieldErr errors={errors} name="headcount" />
                </div>
              </div>
            </div>

            {/* 时间 */}
            <div className="form-section">
              <div className="form-section-title">时间要求</div>
              <div className="form-row form-row-2">
                <div>
                  <label className="form-label">工作时间</label>
                  <input
                    className="form-input"
                    placeholder="如：周末 9:00–18:00"
                    value={form.workTime}
                    onChange={e => set('workTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">招募截止日期</label>
                  <input
                    className={`form-input ${errors.deadline ? 'is-error' : ''}`}
                    type="date"
                    min={TODAY}
                    value={form.deadline}
                    onChange={e => set('deadline', e.target.value)}
                  />
                  <FieldErr errors={errors} name="deadline" />
                </div>
              </div>
            </div>

            {/* 描述 */}
            <div className="form-section">
              <div className="form-section-title">详细说明</div>

              <label className="form-label">
                岗位描述 <span className="required">*</span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 400, marginLeft: 8 }}>
                  至少10字
                </span>
              </label>
              <textarea
                className={`form-textarea ${errors.description ? 'is-error' : ''}`}
                rows={3}
                placeholder="描述工作内容、环境、团队等..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
              <FieldErr errors={errors} name="description" />

              <label className="form-label">任职要求</label>
              <textarea
                className="form-textarea" rows={3}
                placeholder="描述技能要求、工作经验、专业背景等..."
                value={form.requirement}
                onChange={e => set('requirement', e.target.value)}
              />
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="form-error">
                ⚠️ 请检查并修正标红的必填项（共 {Object.keys(errors).length} 处）
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }}
                onClick={() => { setShowForm(false); setErrors({}) }}>
                取消
              </button>
              <button
                className="btn btn-primary" style={{ flex: 2 }}
                onClick={handleCreate} disabled={submitting}
              >
                {submitting ? '⏳ 提交中...' : '🚀 提交发布'}
              </button>
            </div>
          </div>
        )}

        {/* ── 列表部分 ── */}
        {!loading && list.length > 0 && (
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">待审核</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{counts[0]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">招募中</div>
              <div className="stat-value success">{counts[1]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已下架</div>
              <div className="stat-value" style={{ color: 'var(--gray-400)' }}>{counts[2]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">审核拒绝</div>
              <div className="stat-value danger">{counts[3]}</div>
            </div>
          </div>
        )}

        {list.length > 0 && (
          <div className="filter-bar">
            <select className="form-select" style={{ marginBottom: 0, width: 'auto' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}>
              <option value="">全部状态</option>
              <option value="0">待审核</option>
              <option value="1">招募中</option>
              <option value="2">已下架</option>
              <option value="3">审核拒绝</option>
            </select>
            <span className="filter-count">{filtered.length} 个</span>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-text">加载中...</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">还没有发布过职位</div>
            <div className="empty-state-hint">点击上方「发布职位」开始招募</div>
          </div>
        )}

        {filtered.map(job => (
          <div key={job.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{job.title}</div>
                {job.categoryName && (
                  <div style={{ marginTop: 4 }}>
                    <span className="tag tag-pending" style={{ fontSize: 11 }}>{job.categoryName}</span>
                  </div>
                )}
              </div>
              <span className={`tag ${STATUS_TAG[job.status]}`}>{STATUS_LABEL[job.status]}</span>
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)', margin: '8px 0' }}>
              ¥{job.salary}
              <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 400 }}>
                &nbsp;/ {SALARY_TYPE_LABEL[job.salaryType] ?? '元/小时'}
              </span>
            </div>

            <div className="card-meta">
              <span>📍 {job.location || '未填写'}</span>
              <span>👥 招 {job.headcount ?? 1} 人</span>
              {job.workTime && <span>🕐 {job.workTime}</span>}
              {job.deadline && <span>📅 截止 {job.deadline}</span>}
            </div>

            {/* 审核拒绝原因 */}
            {job.status === 3 && job.rejectReason && (
              <div style={{
                marginTop: 10, padding: '8px 12px',
                background: 'var(--danger-light)', borderRadius: 'var(--radius-xs)',
                fontSize: 13, color: 'var(--danger)',
              }}>
                ✗ 拒绝原因：{job.rejectReason}
              </div>
            )}

            {/* 待审核提示 */}
            {job.status === 0 && (
              <div style={{
                marginTop: 10, padding: '8px 12px',
                background: 'var(--warning-light)', borderRadius: 'var(--radius-xs)',
                fontSize: 13, color: 'var(--warning)',
              }}>
                ⏳ 该岗位正在等待管理员审核，审核通过后将公开显示
              </div>
            )}

            {job.status === 1 && (
              <button
                className="btn btn-danger btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => handleDelete(job.id)}
              >
                下架岗位
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  )
}