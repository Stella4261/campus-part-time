const SALARY_TYPE = ['元/小时', '元/天', '元/月']
const TAG_CLASS   = ['tag-pending', 'tag-active', 'tag-closed', 'tag-rejected']
const TAG_LABEL   = ['待审核', '招募中', '已下架', '审核拒绝']

export default function JobCard({ job, onClick }) {
  return (
    <div
      className={`card ${onClick ? 'card-clickable' : ''}`}
      onClick={() => onClick && onClick(job.id)}
    >
      <div className="card-header">
        <div>
          <div className="card-title">{job.title}</div>
          {job.companyName && (
            <div className="card-subtitle">🏢 {job.companyName}</div>
          )}
        </div>
        <span className={`tag ${TAG_CLASS[job.status]}`}>{TAG_LABEL[job.status]}</span>
      </div>

      <div className="card-salary">
        ¥{job.salary}
        <span className="card-salary-unit">/{SALARY_TYPE[job.salaryType] ?? '元/小时'}</span>
      </div>

      <div className="card-meta">
        <span>📍 {job.location || '未填写'}</span>
        <span>🕐 {job.workTime || '面议'}</span>
        <span>👥 招 {job.headcount ?? 1} 人</span>
        {job.categoryName && <span>🏷 {job.categoryName}</span>}
      </div>

      {job.deadline && (
        <div className="card-deadline">📅 截止日期：{job.deadline}</div>
      )}
    </div>
  )
}
