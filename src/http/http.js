// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import axios from 'axios'
import router from '../router/router'
import { Message } from 'element-ui'

/* axios.defaults.timeout = 5000 */

axios.interceptors.request.use(config => {
  let url = config.url
  if (url.indexOf('login') > -1) {
    sessionStorage.setItem('token', '')
    config.headers.Authorization = ''
  }
  if (url.indexOf('login') < 0) {
    config.headers.Authorization = sessionStorage.getItem('token')
  }
  return config
}, error => {
  Message.error({
    message: '加载超时'
  })
  return Promise.reject(error)
})

// http响应拦截器
axios.interceptors.response.use(data => { // 响应成功关闭loading
  if (data.data.code === 401) {
    sessionStorage.clear()
    router.push('/login')
  }
  if (data.headers.token) {
    localStorage.setItem('token', data.headers.token)
  }
  return data
}, error => {
  if (error.response.data.status === 404) {
    router.push('/error')
  } else if (error.response.data.status === 400 || error.response.data.status === 403 || error.response.data.status === 500) {
    router.push('/otherError?errorStatus=' + error.response.data.status)
  }
  return Promise.reject(error)
})

const http = {
  router: router,
  get: function (url, params = {}) {
    return new Promise((resolve, reject) => {
      axios.get(url, {
        params: params
      })
        .then(response => {
          resolve(response.data)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  post: function (url, data = {}) {
    return new Promise((resolve, reject) => {
      axios.post(url, data)
        .then(response => {
          resolve(response.data)
        }, err => {
          reject(err)
        })
    })
  },
  patch: function (url, data = {}) {
    return new Promise((resolve, reject) => {
      axios.patch(url, data)
        .then(response => {
          resolve(response.data)
        }, err => {
          reject(err)
        })
    })
  },
  put: function (url, data = {}) {
    return new Promise((resolve, reject) => {
      axios.put(url, data)
        .then(response => {
          resolve(response.data)
        }, err => {
          reject(err)
        })
    })
  }
}

export default http
