import request from '../utils/request'

/**
 * 投递简历（学生端）
 * data 可以是 FormData（含文件）或普通对象
 */
export const applyJob = (data) => request.post('/api/applications', data)


/** 查询我的投递列表（学生端） */
export const getMyApplications = () =>
  request.get('/api/applications/my')

/** 撤回投递（学生端） */
export const withdrawApplication = (id) =>
  request.put(`/api/applications/${id}/withdraw`)

/**
 * 查询收到的申请（企业端）
 * params: { status?, jobId?, page?, size? }
 */
export const getReceivedApplications = (params) =>
  request.get('/api/applications/received', { params })

/**
 * 处理申请（企业端）
 * status: 1=录用  2=拒绝
 */
export const handleApplication = (id, status) =>
  request.put(`/api/applications/${id}/handle`, { status })
