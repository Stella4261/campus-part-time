import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import request from '../../utils/request'

const VERIFY_LABEL = ['待审核', '已认证', '已拒绝']
const VERIFY_TAG   = ['tag-pending', 'tag-active', 'tag-rejected']

function EmpDetailModal({ emp, onClose, onAudit }) {
  if (!emp) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{emp.companyName}</div>
            <div style={{ marginTop: 6 }}>
              <span className={`tag ${VERIFY_TAG[emp.verifyStatus]}`}>
                {VERIFY_LABEL[emp.verifyStatus]}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="resume-section">
            <div className="resume-section-title">🏢 企业基本信息</div>
            <div className="resume-grid">
              <div className="resume-field">
                <div className="resume-label">企业名称</div>
                <div className="resume-value">{emp.companyName || '未填写'}</div>
              </div>
              <div className="resume-field">
                <div className="resume-label">所属行业</div>
                <div className={`resume-value ${!emp.industry ? 'empty' : ''}`}>
                  {emp.industry || '未填写'}
                </div>
              </div>
              <div className="resume-field">
                <div className="resume-label">联系人</div>
                <div className={`resume-value ${!emp.contactName ? 'empty' : ''}`}>
                  {emp.contactName || '未填写'}
                </div>
              </div>
              <div className="resume-field">
                <div className="resume-label">注册时间</div>
                <div className={`resume-value ${!emp.createdAt ? 'empty' : ''}`}>
                  {emp.createdAt || '未知'}
                </div>
              </div>
              <div className="resume-field">
                <div className="resume-label">联系邮箱</div>
                <div className={`resume-value ${!emp.email ? 'empty' : ''}`}>
                  {emp.email || '未填写'}
                </div>
              </div>
              <div className="resume-field">
                <div className="resume-label">注册账号</div>
                <div className="resume-value">{emp.username || `#${emp.id}`}</div>
              </div>
            </div>
          </div>

          {emp.description && (
            <>
              <div className="divider" />
              <div className="resume-field">
                <div className="resume-label">企业简介</div>
                <div className="resume-value long">{emp.description}</div>
              </div>
            </>
          )}
        </div>

        {emp.verifyStatus === 0 ? (
          <div className="modal-footer">
            <button className="btn btn-danger"
              onClick={() => { onAudit(emp.id, 2); onClose() }}>
              ✗ 拒绝认证
            </button>
            <button className="btn btn-primary"
              onClick={() => { onAudit(emp.id, 1); onClose() }}>
              ✓ 认证通过
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

export default function EmployerAudit() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('0')
  const [keyword, setKeyword] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus !== '') params.verifyStatus = filterStatus
      const res = await request.get('/api/admin/employers', { params })
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


  const handleAudit = async (id, verifyStatus) => {
    const label = verifyStatus === 1 ? '认证通过' : '拒绝'
    if (!window.confirm(`确认${label}该企业？`)) return
    const res = await request.put(`/api/admin/employers/${id}/verify`, { verifyStatus })
    alert(res.message)
    await fetchData()
  }

  const filtered = list.filter(emp =>
    !keyword ||
    emp.companyName?.includes(keyword) ||
    emp.contactName?.includes(keyword) ||
    emp.industry?.includes(keyword)
  )

  const counts = {
    0: list.filter(e => e.verifyStatus === 0).length,
    1: list.filter(e => e.verifyStatus === 1).length,
    2: list.filter(e => e.verifyStatus === 2).length,
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">企业审核</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            待审核 {counts[0]} 家
          </span>
        </div>

        {!loading && (
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">待审核</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{counts[0]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已认证</div>
              <div className="stat-value success">{counts[1]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已拒绝</div>
              <div className="stat-value danger">{counts[2]}</div>
            </div>
          </div>
        )}

        <div className="filter-bar">
          <input
            className="form-input"
            style={{ marginBottom: 0 }}
            placeholder="🔍 搜索企业名称、联系人、行业..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select className="form-select" style={{ marginBottom: 0 }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="0">待审核</option>
            <option value="1">已认证</option>
            <option value="2">已拒绝</option>
          </select>
          <span className="filter-count">{filtered.length} 家</span>
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
              {filterStatus === '0' ? '暂无待审核企业，审核全部完成！' : '暂无记录'}
            </div>
          </div>
        )}

        {filtered.map(emp => (
          <div key={emp.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{emp.companyName}</div>
                <div className="card-subtitle">
                  {emp.industry && `🏷 ${emp.industry}`}
                  {emp.contactName && ` · 联系人：${emp.contactName}`}
                </div>
              </div>
              <span className={`tag ${VERIFY_TAG[emp.verifyStatus]}`}>
                {VERIFY_LABEL[emp.verifyStatus]}
              </span>
            </div>

            <div className="card-meta">
              {emp.email && <span>✉️ {emp.email}</span>}
              {emp.createdAt && <span>🕐 注册于 {emp.createdAt}</span>}
            </div>

            {emp.description && (
              <p style={{
                fontSize: 13, color: 'var(--gray-500)', marginTop: 10,
                padding: '8px 12px', background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xs)',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {emp.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(emp)}>
                👁 查看详情
              </button>
              {emp.verifyStatus === 0 && (
                <>
                  <button className="btn btn-primary btn-sm"
                    onClick={() => handleAudit(emp.id, 1)}>
                    ✓ 认证通过
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => handleAudit(emp.id, 2)}>
                    ✗ 拒绝
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <EmpDetailModal
          emp={selected}
          onClose={() => setSelected(null)}
          onAudit={handleAudit}
        />
      )}
    </>
  )
}