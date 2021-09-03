import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
// to表示将要访问的路径
// from表示从哪个路径跳转来
// next是一个函数，表示放行
// next() 放行 next('/login') 强制跳转
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
