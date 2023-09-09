import axios from 'axios'
import axiosBetterStacktrace from 'axios-better-stacktrace'
import axiosRetry from 'axios-retry'

const axiosAgent = axios.create()

axiosBetterStacktrace(axiosAgent)
axiosRetry(axiosAgent, {
  retries: 10,
  retryCondition: (err) =>
    err.response
      ? err.response?.status === 429 || err.response.status >= 500
      : false,
  retryDelay: () => 1500,
})

export default axiosAgent
