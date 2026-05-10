import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function createApiClient(): AxiosInstance {
  const client = axios.create({ baseURL: API_URL, withCredentials: true })

  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      const tenantSlug = localStorage.getItem('tenantSlug')
      if (token) config.headers.Authorization = `Bearer ${token}`
      if (tenantSlug) config.headers['x-tenant-slug'] = tenantSlug
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_URL}/v1/auth/refresh`, { refreshToken })
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            error.config.headers.Authorization = `Bearer ${data.accessToken}`
            return client(error.config)
          } catch {
            localStorage.clear()
            window.location.href = '/login'
          }
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const api = createApiClient()

export const hrApi = {
  getEmployees: (params?: any) => api.get('/v1/hr/employees', { params }),
  getEmployee: (id: string) => api.get(`/v1/hr/employees/${id}`),
  createEmployee: (data: any) => api.post('/v1/hr/employees', data),
  updateEmployee: (id: string, data: any) => api.put(`/v1/hr/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/v1/hr/employees/${id}`),
  getStats: () => api.get('/v1/hr/employees/stats'),
  getDepartments: () => api.get('/v1/hr/departments'),
  createDepartment: (data: any) => api.post('/v1/hr/departments', data),
}

export const settingsApi = {
  getBranding: () => api.get('/v1/settings/branding'),
  updateBranding: (data: any) => api.put('/v1/settings/branding', data),
  getModules: () => api.get('/v1/settings/modules'),
  updateModules: (modules: string[]) => api.put('/v1/settings/modules', { modules }),
  getNotifications: () => api.get('/v1/settings/notifications'),
  updateNotifications: (data: any) => api.put('/v1/settings/notifications', data),
}

export const dashboardApi = {
  getStats: () => api.get('/v1/dashboard/stats'),
  getActivity: () => api.get('/v1/dashboard/activity'),
}

export const tenantsApi = {
  getAll: () => api.get('/v1/tenants'),
  getOne: (id: string) => api.get(`/v1/tenants/${id}`),
  create: (data: any) => api.post('/v1/tenants', data),
  update: (id: string, data: any) => api.put(`/v1/tenants/${id}`, data),
  toggle: (id: string) => api.patch(`/v1/tenants/${id}/toggle`),
}
