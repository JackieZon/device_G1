import axios from 'axios'
import qs from 'qs'
import {toast, confirm, alert, loading, success, error} from './toast'
export default (url, type, param) => {
  
  axios.defaults.timeout = 5000
  // axios.defaults.withCredentials = true
  
  const goBack = () => {
    setTimeout(() => {
      history.go(((history.length * -1) + 1))
    }, 1500)
  }
  /* eslint-disable */
  switch (type) {
    case 'delete':
      const upDelete = new Promise((resolve, reject) => {
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        axios.delete(url, param).then((res) => {
          if (res.status >= 200 && res.status < 300) {
            if (res.data.status) {
              resolve({data: res.data})
            } else {
              resolve({data: res.data})
              if (res.data.infocode === -3000 || res.data.infocode === '-3000' || res.data.infocode === '-1') {
                goBack()
              }
            }
          } else {
            alert({msg: '请求出错！'});
          }
        }).catch((res) => {
          alert({msg: '请求出错！'});
          reject(res)
        })

      })
      return upDelete
      break
    case 'get':
      const getApi = new Promise((resolve, reject) => {
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        axios.get(url, param).then((res) => {
          if (res.status >= 200 && res.status < 300) {
            if (res.data.status) {
              resolve({data: res.data})
            } else {
              resolve({data: res.data})
              if (res.data.infocode === -3000 || res.data.infocode === '-3000' || res.data.infocode === '-1') {
                goBack()
              }
            }
          } else {
            alert({msg: '请求出错！'});
          }
        }).catch((res) => {
          alert({msg: '请求出错！'});
          reject(res)
        })

      })
      return getApi
      break
    case 'getLogin':
      const getLoginApi = new Promise((resolve, reject) => {
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        axios.get(url, param).then((res) => {
          if (res.status >= 200 && res.status < 300) {
            if (res.data.status) {
              resolve({data: res.data})
            } else {
              resolve({data: res.data})
              alert({msg: res.data.info})
              if (res.data.infocode === -3000 || res.data.infocode === '-3000' || res.data.infocode === '-1') {
                goBack()
              }
            }
          } else {
            alert({msg: '请求失败'})
          }
        }).catch((res) => {
          alert({msg: '请求失败'})
          reject(res)
        })
        
      })
      return getLoginApi
      break
    case 'post':
      const postApi = new Promise((resolve, reject) => {
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post(url, JSON.stringify(param)).then((res) => {
          if (res.status >= 200 && res.status < 300) {
            if (res.data.status) {
              resolve({data: res.data})
            } else {
              resolve({data: res.data})
              alert({msg: res.data.info})
              if (res.data.infocode === -3000 || res.data.infocode === '-3000' || res.data.infocode === '-1') {
                goBack()
              }
            }
          } else {
            alert({msg: '请求失败'})
          }
        }).catch((res) => {
          alert({msg: '请求出错'})
          reject(res)
        })

      })
      return postApi
      break
    case 'postDataList':
      const postDataList = new Promise((resolve, reject) => {

        // axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        
        axios.post(url, JSON.stringify(param)).then((res) => {
          if (res.status >= 200 && res.status < 300) {
            if (res.data.status) {
              resolve({data: res.data})
            } else {
              resolve({data: res.data})
              alert({msg: res.data.info})
              if (res.data.infocode === -3000 || res.data.infocode === '-3000' || res.data.infocode === '-1') {
                goBack()
              }
            }
          } else {
            alert({msg: '请求失败'})
          }
        }).catch((res) => {
          alert({msg: '请求出错'})
          reject(res)
        })

      })
      return postDataList
      break
    case 'postFile':
      const postFileApi = new Promise((resolve, reject) => {
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        axios.defaults.withCredentials = false
        axios.defaults.timeout = 10000
        axios.post(url, param).then((res) => {
          if (res.status >= 200 && res.status < 300) {
            if (res.data.status) {
              resolve({data: res.data})
            } else {
              alert({msg: res.data.info})
              if (res.data.infocode === -3000 || res.data.infocode === '-3000' || res.data.infocode === '-1') {
                goBack()
              }
            }
          } else {
            alert({msg: '请求失败'})
          }
        }).catch((res) => {
          alert({msg: '请求出错'})
          reject(res)
        })

      })
      return postFileApi
      break
    default:
      console.log('缺少传输类型参数！（get or post）')
  }
}
