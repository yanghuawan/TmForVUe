import Vue from 'vue'
import Router from 'vue-router'
import index from '../components/index/index'
import login from '../components/login/login'
import error404 from '../components/errorPage/404'
import otherError from '../components/errorPage/otherError'
import menuList from '../components/menuMangement/menuList'
import addNewDish from '../components/menuMangement/addNewDish'
import menuNavManagement from '../components/menuMangement/menuNavManagement'
import tableList from '../components/tableManagement/tableList'
import regionList from '../components/tableManagement/regionList'
import robotList from '../components/tableManagement/robotList'
import orderManagement from '../components/orderManagement/orderManagement'
import orderDetail from '../components/orderManagement/orderDetail'
import restaurantSetting from '../components/restaurantSetting/restaurantSetting'
import accountManagement from '../components/accountManagement/accountManagement'
import amap from '../components/intelligentWarehousing/aMap'
import foodStoreImport from '../components/intelligentWarehousing/foodStoreImport'
import foodForecastNumber from '../components/intelligentWarehousing/foodForecastNumber'
import amapList from '../components/intelligentWarehousing/aMapList'
import foodHouse from '../components/intelligentWarehousing/foodHouse'
import tomorrowForecast from '../components/intelligentWarehousing/tomorrowForecast'
import forecastCurve from '../components/intelligentWarehousing/forecastCurve'
import adjustManagement from '../components/adjustManagement/adjustManagement'
import needSetting from '../components/menuMangement/needSetting'

Vue.use(Router)

const routes = new Router({
  routes: [
    {
      path: '/',
      redirect: 'accountManagement/accountList'
    },
    {
      path: '/index',
      name: '主页',
      meta: {
        login: true // 需要登录的页面
      },
      component: index
    },
    {
      path: '/login',
      name: '登录',
      component: login
    },
    {
      path: '/error',
      name: '404错误',
      component: error404
    },
    {
      path: '/otherError',
      name: '其他错误',
      component: otherError
    },
    {
      path: '/addNewDish',
      name: '添加新菜品',
      component: addNewDish,
      meta: {
        login: true // 需要登录的页面
      }
    },
    {
      path: '/menuManagement',
      name: '菜谱管理',
      component: index,
      meta: {
        login: true // 需要登录的页面
      },
      children: [
        {
          path: 'menuList',
          name: '菜品列表',
          component: menuList,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'menuNavManagement',
          name: '菜品导航管理',
          component: menuNavManagement,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'needSetting',
          name: '必点项设置',
          component: needSetting,
          meta: {
            login: true // 需要登录的页面
          }
        }
      ]
    },
    {
      path: '/tableManagement',
      name: '桌台管理',
      component: index,
      meta: {
        login: true // 需要登录的页面
      },
      children: [
        {
          path: 'tableList',
          name: '桌台列表',
          component: tableList,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'regionList',
          name: '区域列表',
          component: regionList,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'robotList',
          name: '机器人列表',
          component: robotList,
          meta: {
            login: true // 需要登录的页面
          }
        }
      ]
    },
    {
      path: '/orderDetail',
      name: '订单详情',
      component: orderDetail,
      meta: {
        login: true // 需要登录的页面
      }
    },
    {
      path: '/orderManagement',
      name: '订单管理',
      component: index,
      meta: {
        login: true // 需要登录的页面
      },
      children: [
        {
          path: 'order',
          name: '订单列表',
          component: orderManagement,
          meta: {
            login: true // 需要登录的页面
          }
        }
      ]
    },
    {
      path: '/restaurantSetting',
      name: '餐厅设置',
      component: index,
      meta: {
        login: true // 需要登录的页面
      },
      children: [
        {
          path: 'setting',
          name: '餐厅设置详情',
          component: restaurantSetting,
          meta: {
            login: true // 需要登录的页面
          }
        }
      ]
    },
    {
      path: '/accountManagement',
      name: '账号管理',
      component: index,
      meta: {
        login: true // 需要登录的页面
      },
      children: [
        {
          path: 'accountList',
          name: '账号列表',
          component: accountManagement,
          meta: {
            login: true // 需要登录的页面
          }
        }
      ]
    },
    {
      path: '/intelligentWarehousing',
      name: '智慧仓配',
      component: index,
      meta: {
        login: true // 需要登录的页面
      },
      children: [
        {
          path: 'amap',
          name: '餐厅',
          component: amap,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'amapList',
          name: '餐厅列表',
          component: amapList,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'foodStoreImport',
          name: '食材库存导入',
          component: foodStoreImport,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'foodForecastNumber',
          name: '食材预计结余',
          component: foodForecastNumber,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'foodHouse',
          name: '食材库',
          component: foodHouse,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'tomorrowForecast',
          name: '明日采购量预测',
          component: tomorrowForecast,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'forecastCurve',
          name: '数据统计及预测',
          component: forecastCurve,
          meta: {
            login: true // 需要登录的页面
          }
        },
        {
          path: 'adjustManagement',
          name: '调货管理',
          component: adjustManagement,
          meta: {
            login: true // 需要登录的页面
          }
        }
      ]
    }
  ]
})

routes.beforeEach((to, from, next) => {
  // 全局拦截器的
  if (to.meta.login) { // 判断该路由是否需要登录权限
    let token = sessionStorage.token
    if (token) { // 通过store获取当前的token是否存在
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  } else {
    next()
  }
})

export default routes
