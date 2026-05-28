import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import request from '../../utils/request'

const ROLE_LABEL   = ['管理员', '学生', '企业']
const ROLE_TAG     = ['tag-rejected', 'tag-pending', 'tag-active']
const ROLE_ICON    = ['🛡️', '🎓', '🏢']
const STATUS_LABEL = ['已禁用', '正常']
const STATUS_TAG   = ['tag-rejected', 'tag-active']

function UserDetailModal({ user, onClose, onToggle }) {
  if (!user) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {ROLE_ICON[user.role]} {user.username}
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
              <span className={`tag ${ROLE_TAG[user.role]}`}>{ROLE_LABEL[user.role]}</span>
              <span className={`tag ${STATUS_TAG[user.status]}`}>{STATUS_LABEL[user.status]}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="resume-grid">
            <div className="resume-field">
              <div className="resume-label">用户名</div>
              <div className="resume-value">{user.username}</div>
            </div>
            <div className="resume-field">
              <div className="resume-label">角色</div>
              <div className="resume-value">{ROLE_ICON[user.role]} {ROLE_LABEL[user.role]}</div>
            </div>
            <div className="resume-field">
              <div className="resume-label">邮箱</div>
              <div className={`resume-value ${!user.email ? 'empty' : ''}`}>
                {user.email || '未填写'}
              </div>
            </div>
            <div className="resume-field">
              <div className="resume-label">注册时间</div>
              <div className={`resume-value ${!user.createdAt ? 'empty' : ''}`}>
                {user.createdAt || '未知'}
              </div>
            </div>
            {user.role === 1 && (
              <>
                <div className="resume-field">
                  <div className="resume-label">真实姓名</div>
                  <div className={`resume-value ${!user.realName ? 'empty' : ''}`}>
                    {user.realName || '未填写'}
                  </div>
                </div>
                <div className="resume-field">
                  <div className="resume-label">学校</div>
                  <div className={`resume-value ${!user.school ? 'empty' : ''}`}>
                    {user.school || '未填写'}
                  </div>
                </div>
                <div className="resume-field">
                  <div className="resume-label">专业</div>
                  <div className={`resume-value ${!user.major ? 'empty' : ''}`}>
                    {user.major || '未填写'}
                  </div>
                </div>
                <div className="resume-field">
                  <div className="resume-label">年级</div>
                  <div className={`resume-value ${!user.grade ? 'empty' : ''}`}>
                    {user.grade || '未填写'}
                  </div>
                </div>
              </>
            )}
            {user.role === 2 && (
              <>
                <div className="resume-field">
                  <div className="resume-label">企业名称</div>
                  <div className={`resume-value ${!user.companyName ? 'empty' : ''}`}>
                    {user.companyName || '未填写'}
                  </div>
                </div>
                <div className="resume-field">
                  <div className="resume-label">联系人</div>
                  <div className={`resume-value ${!user.contactName ? 'empty' : ''}`}>
                    {user.contactName || '未填写'}
                  </div>
                </div>
                <div className="resume-field">
                  <div className="resume-label">所属行业</div>
                  <div className={`resume-value ${!user.industry ? 'empty' : ''}`}>
                    {user.industry || '未填写'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {user.role !== 0 && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>关闭</button>
            <button
              className={`btn ${user.status === 1 ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => { onToggle(user); onClose() }}
            >
              {user.status === 1 ? '🚫 禁用账号' : '✓ 启用账号'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UserManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await request.get('/api/admin/users')
      setList(res.code === 200 && Array.isArray(res.data) ? res.data : [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchData()
 }, [fetchData])


  const toggleStatus = async (user) => {
    const next = user.status === 1 ? 0 : 1
    const label = next === 0 ? '禁用' : '启用'
    if (!window.confirm(`确认${label}用户「${user.username}」？`)) return
    const res = await request.put(`/api/admin/users/${user.id}/status`, { status: next })
    alert(res.message)
    await fetchData()
  }

  const filtered = list.filter(u => {
    if (filterRole !== '' && u.role !== Number(filterRole)) return false
    if (filterStatus !== '' && u.status !== Number(filterStatus)) return false
    if (keyword && !u.username?.includes(keyword)
      && !u.email?.includes(keyword)
      && !u.realName?.includes(keyword)
      && !u.companyName?.includes(keyword)) return false
    return true
  })

  const counts = {
    total:    list.length,
    students: list.filter(u => u.role === 1).length,
    employers: list.filter(u => u.role === 2).length,
    disabled: list.filter(u => u.status === 0).length,
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">用户管理</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            共 {list.length} 名用户
          </span>
        </div>

        {!loading && (
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">总用户</div>
              <div className="stat-value primary">{counts.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">学生</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{counts.students}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">企业</div>
              <div className="stat-value success">{counts.employers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已禁用</div>
              <div className="stat-value danger">{counts.disabled}</div>
            </div>
          </div>
        )}

        <div className="filter-bar">
          <input
            className="form-input"
            style={{ marginBottom: 0 }}
            placeholder="🔍 搜索用户名、邮箱..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select className="form-select" style={{ marginBottom: 0 }}
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}>
            <option value="">全部角色</option>
            <option value="0">管理员</option>
            <option value="1">学生</option>
            <option value="2">企业</option>
          </select>
          <select className="form-select" style={{ marginBottom: 0 }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="1">正常</option>
            <option value="0">已禁用</option>
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
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-text">暂无匹配用户</div>
          </div>
        )}

        {filtered.map(user => (
          <div key={user.id ?? user.username} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  {ROLE_ICON[user.role]} {user.username}
                  {(user.realName || user.companyName) && (
                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--gray-500)', marginLeft: 8 }}>
                      · {user.realName || user.companyName}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <span className={`tag ${ROLE_TAG[user.role]}`}>{ROLE_LABEL[user.role]}</span>
                  <span className={`tag ${STATUS_TAG[user.status]}`}>{STATUS_LABEL[user.status]}</span>
                </div>
              </div>
            </div>

            <div className="card-meta">
              {user.email    && <span>✉️ {user.email}</span>}
              {user.school   && <span>🎓 {user.school}</span>}
              {user.industry && <span>🏷 {user.industry}</span>}
              {user.createdAt && <span>🕐 注册于 {user.createdAt}</span>}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(user)}>
                👁 查看详情
              </button>
              {user.role !== 0 && (
                <button
                  className={`btn btn-sm ${user.status === 1 ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => toggleStatus(user)}
                >
                  {user.status === 1 ? '🚫 禁用' : '✓ 启用'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onToggle={toggleStatus}
        />
      )}
    </>
  )
}