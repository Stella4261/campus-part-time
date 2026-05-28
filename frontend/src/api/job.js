import request from '../utils/request'

// ── 学生端 ──────────────────────────────────────────────────

/**
 * 获取公开岗位列表
 * params: { status?, categoryId?, salarySort?, keyword?, page?, size? }
 */
export const getJobList = (params) =>
  request.get('/api/jobs/public', { params })

/** 获取岗位详情 */
export const getJobDetail = (id) =>
  request.get(`/api/jobs/public/${id}`)

// ── 企业端 ──────────────────────────────────────────────────

/** 获取本企业发布的职位列表 */
export const getMyJobList = () =>
  request.get('/api/employer/jobs')

/** 发布新职位 */
export const createJob = (data) =>
  request.post('/api/employer/jobs', data)

/** 下架职位 */
export const deleteJob = (id) =>
  request.delete(`/api/employer/jobs/${id}`)

// ── 管理员端 ─────────────────────────────────────────────────

/**
 * 审核岗位
 * data: { status: 1=通过 | 3=拒绝, rejectReason?: string }
 */
export const auditJob = (id, data) =>
  request.put(`/api/admin/jobs/${id}/audit`, data)
