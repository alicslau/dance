import { defineConfig } from 'umi';

export default defineConfig({
  title: '舞伴匹配',
  // hash 路由：微信内打开、静态部署都无需服务端 rewrite
  history: { type: 'hash' },
  routes: [
    { path: '/', redirect: '/m' },
    { path: '/m', component: 'mobile', title: '登记' },
    { path: '/stats', component: 'index', title: '统计' },
    { path: '/register', component: 'register', title: '登记' },
    { path: '/list', component: 'list', title: '列表' },
    { path: '/match', component: 'match', title: '匹配' },
    { path: '/manage', component: 'manage', title: '管理' },
  ],
  npmClient: 'npm',
  // 浏览器本机调试时，把 /api 转发到后端
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
});
