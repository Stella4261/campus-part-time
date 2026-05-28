import request from '../utils/request'

/** 登录 */
export const login = (data) => request.post('/api/auth/login', data)

/** 注册（支持学生和企业字段） */
export const register = (data) => request.post('/api/auth/register', data)

/** 修改密码（可选扩展） */
export const changePassword = (data) => request.put('/api/auth/password', data)
