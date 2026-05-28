import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import request from '../../utils/request'

const STATUS_LABEL = ['待处理', '已录用', '已拒绝', '已撤回']
const STATUS_TAG   = ['tag-pending', 'tag-hired', 'tag-rejected', 'tag-withdrawn']
const STATUS_HINT  = [
  '等待用人单位处理',
  '恭喜！您已被录用，请等待联系',
  '很遗憾，该申请未通过',
  '您已撤回该申请',
]

export default function MyApplications() {
  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(() => {
    request.get('/api/applications/my')
      .then(res => {
        setList(res.code === 200 && Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleWithdraw = async id => {
  if (!window.confirm('确认撤回该投递？此操作不可恢复')) return
  const res = await request.put(`/api/applications/${id}/withdraw`)
  alert(res.message)
  setLoading(true)   
  load()
}

  const filtered = filterStatus === ''
    ? list
    : list.filter(a => a.status === Number(filterStatus))

  const counts = STATUS_LABEL.reduce((acc, _, i) => {
    acc[i] = list.filter(a => a.status === i).length
    return acc
  }, {})

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">我的投递</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>共 {list.length} 条</span>
        </div>
{/* 统计卡 */}
        {!loading && list.length > 0 && (
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">全部</div>
              <div className="stat-value">{list.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">待处理</div>
              <div className="stat-value warning" style={{ color: 'var(--warning)' }}>{counts[0]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已录用</div>
              <div className="stat-value success">{counts[1]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已拒绝</div>
              <div className="stat-value danger">{counts[2]}</div>
            </div>
          </div>
        )}

        {/* 筛选 */}
        <div className="filter-bar">
          <select className="form-select" style={{ width: 'auto', marginBottom: 0 }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="0">待处理</option>
            <option value="1">已录用</option>
            <option value="2">已拒绝</option>
            <option value="3">已撤回</option>
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
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">暂无投递记录</div>
            <div className="empty-state-hint">去兼职大厅看看吧</div>
          </div>
        )}

        {filtered.map(app => (
          <div key={app.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{app.jobTitle || `岗位 #${app.jobId}`}</div>
                {app.companyName && (
                  <div className="card-subtitle">🏢 {app.companyName}</div>
                )}
              </div>
              <span className={`tag ${STATUS_TAG[app.status]}`}>
                {STATUS_LABEL[app.status]}
              </span>
            </div>

            <div className="card-meta">
              <span>🕐 投递于 {app.createdAt}</span>
              {app.school && <span>🎓 {app.school}</span>}
            </div>

            <div style={{
              marginTop: 10,
              padding: '8px 12px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 12,
              color: 'var(--gray-500)',
            }}>
              {STATUS_HINT[app.status]}
            </div>

            {app.status === 0 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => handleWithdraw(app.id)}
              >
                撤回申请
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

