import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import { auditJob } from '../../api/job'
import request from '../../utils/request'

const STATUS_LABEL = ['待审核', '招募中', '已下架', '审核拒绝']
const STATUS_TAG   = ['tag-pending', 'tag-active', 'tag-closed', 'tag-rejected']
const SALARY_TYPE  = ['元/小时', '元/天', '元/月']

function JobDetailModal({ job, onClose, onAudit }) {
  if (!job) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{job.title}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`tag ${STATUS_TAG[job.status]}`}>
                {STATUS_LABEL[job.status]}
              </span>
              {job.companyName && (
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  🏢 {job.companyName}
                </span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{
            background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)',
            padding: '14px 16px', marginBottom: 20,
            border: '1px solid var(--gray-200)',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--danger)', marginBottom: 10, letterSpacing: '-0.5px' }}>
              ¥{job.salary}
              <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 400 }}>
                /{SALARY_TYPE[job.salaryType] ?? '元/小时'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['📍 工作地点', job.location],
                ['🕐 工作时间', job.workTime || '面议'],
                ['👥 招募人数', `${job.headcount ?? 1} 人`],
                ['📅 截止日期', job.deadline || '未设定'],
              ].map(([label, val]) => (
                <div key={label} style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                  <span style={{ color: 'var(--gray-800)' }}>{label}：</span>{val || '未填写'}
                </div>
              ))}
            </div>
          </div>

          <div className="resume-section">
            <div className="resume-section-title">📋 岗位描述</div>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {job.description || '暂无描述'}
            </p>
          </div>

          {job.requirement && (
            <>
              <div className="divider" />
              <div className="resume-section">
                <div className="resume-section-title">✅ 任职要求</div>
                <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {job.requirement}
                </p>
              </div>
            </>
          )}

          {job.status === 0 && (
            <>
              <div className="divider" />
              <div style={{
                background: 'var(--warning-light)', border: '1px solid rgba(217,119,6,0.2)',
                borderRadius: 'var(--radius-xs)', padding: '10px 14px',
                fontSize: 13, color: 'var(--warning)',
              }}>
                ⚠️ 请仔细核查岗位内容是否合规、薪资是否合理，确认后再操作
              </div>
            </>
          )}
        </div>

        {job.status === 0 ? (
          <div className="modal-footer">
            <button className="btn btn-danger"
              onClick={() => { onAudit(job.id, 3); onClose() }}>
              ✗ 审核拒绝
            </button>
            <button className="btn btn-primary"
              onClick={() => { onAudit(job.id, 1); onClose() }}>
              ✓ 审核通过
            </button>
          </div>
        ) : (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>关闭</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobAudit() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('0')
  const [keyword, setKeyword] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus !== '') params.status = filterStatus
      const res = await request.get('/api/admin/jobs', { params })
      setList(res.code === 200 && Array.isArray(res.data) ? res.data : [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleAudit = async (id, status) => {
    const label = status === 1 ? '通过' : '拒绝'
    if (!window.confirm(`确认审核${label}该岗位？`)) return
    const res = await auditJob(id, { status })
    alert(res.message)
    await fetchData()
  }

  const filtered = list.filter(job =>
    !keyword ||
    job.title?.includes(keyword) ||
    job.location?.includes(keyword) ||
    job.companyName?.includes(keyword)
  )

  const counts = [0, 1, 2, 3].reduce((a, i) => ({
    ...a, [i]: list.filter(j => j.status === i).length,
  }), {})

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">岗位审核</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            待审核 {counts[0]} 个
          </span>
        </div>

        {!loading && (
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
              <div className="stat-label">已拒绝</div>
              <div className="stat-value danger">{counts[3]}</div>
            </div>
          </div>
        )}

        <div className="filter-bar">
          <input
            className="form-input"
            style={{ marginBottom: 0 }}
            placeholder="🔍 搜索岗位名称、地点、企业..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select className="form-select" style={{ marginBottom: 0 }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="0">待审核</option>
            <option value="1">招募中</option>
            <option value="2">已下架</option>
            <option value="3">审核拒绝</option>
          </select>
          <span className="filter-count">{filtered.length} 条</span>
        </div>

        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-text">加载中...</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-text">
              {filterStatus === '0' ? '暂无待审核岗位，全部处理完毕！' : '暂无记录'}
            </div>
          </div>
        )}

        {filtered.map(job => (
          <div key={job.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{job.title}</div>
                {job.companyName && (
                  <div className="card-subtitle">🏢 {job.companyName}</div>
                )}
              </div>
              <span className={`tag ${STATUS_TAG[job.status]}`}>
                {STATUS_LABEL[job.status]}
              </span>
            </div>

            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)', margin: '8px 0' }}>
              ¥{job.salary}
              <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 400 }}>
                &nbsp;/ {SALARY_TYPE[job.salaryType] ?? '元/小时'}
              </span>
            </div>

            <div className="card-meta">
              <span>📍 {job.location || '未填写'}</span>
              <span>👥 招 {job.headcount ?? 1} 人</span>
              {job.deadline && <span>📅 截止 {job.deadline}</span>}
            </div>

            {job.description && (
              <p style={{
                fontSize: 13, color: 'var(--gray-500)', marginTop: 10,
                padding: '8px 12px', background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xs)',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {job.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(job)}>
                👁 查看详情
              </button>
              {job.status === 0 && (
                <>
                  <button className="btn btn-primary btn-sm"
                    onClick={() => handleAudit(job.id, 1)}>
                    ✓ 通过
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => handleAudit(job.id, 3)}>
                    ✗ 拒绝
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <JobDetailModal
          job={selected}
          onClose={() => setSelected(null)}
          onAudit={handleAudit}
        />
      )}
    </>
  )
}