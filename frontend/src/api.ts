import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export const getCategories = async () => {
  const { data } = await api.get('/categories')
  return data
}

export const getEmployee = async (email) => {
  const { data } = await api.get('/employee', { params: { email } })
  return data
}

export const submitAnonymousFeedback = async (feedbacks) => {
  const { data } = await api.post('/feedback/anonymous', { feedbacks })
  return data
}

export const submitNamedFeedback = async (employeeDetails, feedbacks) => {
  const { data } = await api.post('/feedback/named', {
    employee_details: employeeDetails,
    feedbacks,
  })
  return data
}
