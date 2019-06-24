/* eslint-disable no-undef */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../static/css/common/common.css'
import http from './http/http'
/* import axios from 'axios' */
import md5 from 'js-md5'
import App from './App'
import echarts from 'echarts'

Vue.prototype.$echarts = echarts
Vue.use(ElementUI)
Vue.prototype.$axios = http
/* Vue.prototype.$ajax = axios */
Vue.prototype.$md5 = md5
Vue.config.productionTip = false
Vue.prototype.Const = {
  INIT_PASSWORD: '000000',
  PAGE_SIZE: 20,
  IMAGES_DOMAIN: '/api/image/uploadimage',
  IMAGE_PATH: '../../static/image/',
  RADIUS: 20000,
  T_HEADER: ['食材编码', '食材名称', '采购数量(斤)', '错误原因'],
  FILTER_VAL: ['id', 'name', 'weight', 'errorMsg']
}
Vue.prototype.$goEasy = new GoEasy({
  appkey: 'BC-582ab3e4c6be4d6a82f8eb86dd35cb76'
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router: http.router,
  components: { App },
  template: '<App/>'
})
