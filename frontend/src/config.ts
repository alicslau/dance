// 后端接口地址：
// - 本机 / 同局域网手机（微信）开发：走 umi dev 代理 → '/api'，无需修改。
// - 生产构建（Vercel 部署）：默认指向 Render 后端 PROD_API。
// - 可用环境变量 UMI_APP_API_BASE 覆盖（例如在 Vercel 项目里设置，后端域名变了改这里即可）。
const DEV_API = '/api';
const PROD_API = 'https://ruc-art-backend.onrender.com/api';

export const API_BASE =
  (process.env as any)?.UMI_APP_API_BASE ||
  (process.env.NODE_ENV === 'production' ? PROD_API : DEV_API);
