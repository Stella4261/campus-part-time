import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

/* ── 请求拦截器：自动注入 Token ── */
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error),
)

/* ── 响应拦截器：统一数据格式 & 错误处理 ── */
request.interceptors.response.use(
  response => {
    // 直接返回 response.data，让各页面用 res.code / res.data / res.message
    return response.data
  },
  error => {
    const status = error.response?.status

    if (status === 401) {
      // Token 过期或未授权，清除登录信息并跳转
      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    if (status === 403) {
      return Promise.reject(new Error('没有权限执行该操作'))
    }

    if (status === 404) {
      return Promise.reject(new Error('请求的资源不存在'))
    }

    if (status >= 500) {
      return Promise.reject(new Error('服务器错误，请稍后重试'))
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请检查网络连接'))
    }

    // 如果后端返回了 data（即使 HTTP 是 4xx），尝试直接返回
    if (error.response?.data) {
      return error.response.data
    }

    return Promise.reject(error)
  },
)

export default request
