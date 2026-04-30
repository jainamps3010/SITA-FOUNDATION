import axios from 'axios'

const api = axios.create({
  baseURL: 'https://sita-backend-whn2.onrender.com/api/v1',
  timeout: 30000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('survey_agent_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
