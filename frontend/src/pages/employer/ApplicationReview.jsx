import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import { getReceivedApplications, handleApplication } from '../../api/application'

const STATUS_LABEL = ['待处理', '已录用', '已拒绝', '已撤回']
const STATUS_TAG   = ['tag-pending', 'tag-hired', 'tag-rejected', 'tag-withdrawn']

/* ── 简历查看弹窗 ── */

  const Field = ({ label, value, wide, long }) => {
  return (
    <div className={`resume-field ${wide ? 'resume-grid-wide' : ''}`}>
      <div className="resume-label">{label}</div>
      <div className={`resume-value ${!value ? 'empty' : ''} ${long ? 'long' : ''}`}>
        {value || '未填写'}
      </div>
    </div>
  );
};

  function ResumeModal({app,onClose,onHandle}){

  if (!app) return null


  const downloadResume = () => {
    if (app.resumeFile) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${app.resumeFile}`;
      link.download = app.resumeFileName || 'resume.pdf';
      link.click();
    } else {
      alert('暂无简历附件');
    }
  };


  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {app.studentName && app.studentName !== '未填写' ? app.studentName : `学生 #${app.studentId}`}
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`tag ${STATUS_TAG[app.status]}`}>
                {STATUS_LABEL[app.status]}
              </span>
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                投递于 {app.createdAt}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* 岗位信息 */}
          <div style={{
            background: 'var(--primary-faint)',
            border: '1px solid rgba(37,99,235,0.12)',
            borderRadius: 'var(--radius-xs)',
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--primary-dark)',
            marginBottom: 20,
          }}>
            📋 投递岗位：<strong>{app.jobTitle || `#${app.jobId}`}</strong>
          </div>

          {/* 基本信息 */}
          <div className="resume-section">
            <div className="resume-section-title">👤 基本信息</div>
            <div className="resume-grid">
              <Field label="姓名"     value={app.realName || app.studentName} />
              <Field label="手机号"   value={app.phone} />
              <Field label="电子邮箱" value={app.email} />
              <Field label="投递时间" value={app.createdAt} />
            </div>
          </div>

          <div className="divider" />

          {/* 教育背景 */}
          <div className="resume-section">
            <div className="resume-section-title">🎓 教育背景</div>
            <div className="resume-grid">
              <Field label="学校" value={app.school} />
              <Field label="专业" value={app.major} />
              <Field label="学历" value={app.degree} />
              <Field label="毕业年份" value={app.graduationYear ? `${app.graduationYear}年` : null} />
            </div>
          </div>

          {/* 技能与经历 */}
          {(app.skills || app.experience || app.selfIntro) && (
            <>
              <div className="divider" />
              <div className="resume-section">
                <div className="resume-section-title">💡 技能与经历</div>
                {app.skills && (
                  <div className="resume-field" style={{ marginBottom: 14 }}>
                    <div className="resume-label">技能特长</div>
                    <div className="resume-value">{app.skills}</div>
                  </div>
                )}
                {app.experience && (
                  <div className="resume-field" style={{ marginBottom: 14 }}>
                    <div className="resume-label">实习 / 工作经历</div>
                    <div className="resume-value long">{app.experience}</div>
                  </div>
                )}
                {app.selfIntro && (
                  <div className="resume-field">
                    <div className="resume-label">自我介绍</div>
                    <div className="resume-value long">{app.selfIntro}</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 留言 */}
          {app.coverLetter && (
            <>
              <div className="divider" />
              <div className="resume-field">
                <div className="resume-label">求职留言</div>
                <div className="resume-value" style={{ fontStyle: 'italic', color: 'var(--gray-600)' }}>
                  "{app.coverLetter}"
                </div>
              </div>
            </>
          )}

          {/* 简历附件 */}
          <div className="divider" />
          <div className="resume-field">
            <div className="resume-label">简历附件</div>
            {app.resumeFileName ? (
              <button className="btn btn-outline btn-sm" style={{ marginTop: 6 }} onClick={downloadResume}>
                📄 下载简历 · {app.resumeFileName}
              </button>
            ) : (
              <div className="resume-value empty">未上传简历附件</div>
            )}
          </div>
        </div>

        {/* Footer */}
        {app.status === 0 ? (
          <div className="modal-footer">
            <button
              className="btn btn-danger"
              onClick={() => { onHandle(app.id, 2); onClose() }}
            >
              ✗ 拒绝申请
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { onHandle(app.id, 1); onClose() }}
            >
              ✓ 录用该同学
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


/* ── 主组件 ── */
export default function ApplicationReview() {
  const [list, setList]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [keyword, setKeyword]         = useState('')

  const load = useCallback(() => {
    const params = {}
    if (filterStatus !== '') params.status = filterStatus
    getReceivedApplications(params)
      .then(res => {
        setList(res.code === 200 && Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  const handle = async (id, status) => {
    const label = status === 1 ? '录用' : '拒绝'
    if (!window.confirm(`确认${label}该申请？`)) return
    const res = await handleApplication(id, status)
    alert(res.message)
    load()
  }

  const filtered = list.filter(app => {
    if (keyword && !app.studentName?.includes(keyword) && !app.realName?.includes(keyword)
      && !app.jobTitle?.includes(keyword) && !app.school?.includes(keyword)) return false
    return true
  })

  const counts = [0,1,2,3].reduce((a, i) => ({ ...a, [i]: list.filter(x => x.status === i).length }), {})

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">简历处理</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>共 {list.length} 条</span>
        </div>

        {/* 统计卡 */}
        {!loading && list.length > 0 && (
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">待处理</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{counts[0]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已录用</div>
              <div className="stat-value success">{counts[1]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已拒绝</div>
              <div className="stat-value danger">{counts[2]}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">已撤回</div>
              <div className="stat-value" style={{ color: 'var(--gray-400)' }}>{counts[3]}</div>
            </div>
          </div>
        )}

        {/* 筛选栏 */}
        <div className="filter-bar">
          <input
            className="form-input"
            style={{ marginBottom: 0 }}
            placeholder="🔍 搜索姓名、岗位、学校..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select className="form-select" style={{ marginBottom: 0 }}
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
            <div className="empty-state-text">暂无申请记录</div>
          </div>
        )}

        {filtered.map(app => (
          <div key={app.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  {app.realName || app.studentName || `学生 #${app.studentId}`}
                  {app.school && (
                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--gray-500)', marginLeft: 8 }}>
                      · {app.school} {app.major && `/ ${app.major}`}
                    </span>
                  )}
                </div>
                <div className="card-subtitle">📋 {app.jobTitle || `岗位 #${app.jobId}`}</div>
              </div>
              <span className={`tag ${STATUS_TAG[app.status]}`}>
                {STATUS_LABEL[app.status]}
              </span>
            </div>

            <div className="card-meta">
              {app.phone && <span>📱 {app.phone}</span>}
              {app.degree && <span>🎓 {app.degree}</span>}
              <span>🕐 {app.createdAt}</span>
              {app.resumeFileName && <span style={{ color: 'var(--primary)' }}>📄 有附件</span>}
            </div>

            {app.coverLetter && (
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 10, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-xs)', fontStyle: 'italic' }}>
                "{app.coverLetter}"
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(app)}>
                👁 查看完整简历
              </button>
              {app.status === 0 && (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => handle(app.id, 1)}>
                    ✓ 录用
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handle(app.id, 2)}>
                    ✗ 拒绝
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ResumeModal
          app={selected}
          onClose={() => setSelected(null)}
          onHandle={handle}
        />
      )}
    </>
  )
}
