import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import JobCard from '../../components/JobCard'
import { getJobList } from '../../api/job'

const CATEGORIES = [
  { id: '',  name: '全部分类' },
  { id: 1,   name: '餐饮服务' },
  { id: 2,   name: '促销导购' },
  { id: 3,   name: '家教辅导' },
  { id: 4,   name: 'IT技术' },
  { id: 5,   name: '文案设计' },
  { id: 6,   name: '派送配送' },
  { id: 7,   name: '其他' },
]

const SALARY_SORT = [
  { val: '',    label: '默认排序' },
  { val: 'asc', label: '薪资从低到高' },
  { val: 'desc',label: '薪资从高到低' },
]

export default function JobList() {
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [keyword, setKeyword]   = useState('')
  const [category, setCategory] = useState('')
  const [salary, setSalary]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setLoading(true)
  const params = { status: 1 }
  if (category) params.categoryId = category
  if (salary) params.salarySort = salary
  getJobList(params)
    .then(res => {
      if (res.code === 200) setJobs(Array.isArray(res.data) ? res.data : [])
    })
    .catch(() => setJobs([]))
    .finally(() => setLoading(false))
}, [category, salary])


  const filtered = jobs.filter(j =>
  !keyword || j.title?.includes(keyword) || j.location?.includes(keyword)
)


  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">兼职大厅</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            共 {filtered.length} 个岗位
          </span>
        </div>

        <div className="filter-bar">
          <input
            className="form-input"
            style={{ marginBottom: 0 }}
            placeholder="🔍 搜索岗位名称、地点..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select className="form-select" style={{ marginBottom: 0 }}
            value={category}
            onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="form-select" style={{ marginBottom: 0 }}
            value={salary}
            onChange={e => setSalary(e.target.value)}>
            {SALARY_SORT.map(s => (
              <option key={s.val} value={s.val}>{s.label}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-text">加载中...</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">暂无匹配的岗位</div>
            <div className="empty-state-hint">换个关键词试试？</div>
          </div>
        )}

        {filtered.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onClick={id => navigate(`/student/jobs/${id}`)}
          />
        ))}
      </div>
    </>
  )
}
