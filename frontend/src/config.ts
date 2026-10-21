// 后端接口地址，默认 '/api'：
// - 本机浏览器 / 同局域网手机（微信）：走 umi dev 代理，无需修改。
// - 若前端用静态构建（umi build）单独部署、不走代理，需改成后端真实地址，
//   例如 http://192.168.1.100:8000/api
//   （也可在 frontend/.env 里写 UMI_APP_API_BASE=http://192.168.1.100:8000/api）
export const API_BASE = (process.env as any)?.UMI_APP_API_BASE || '/api';
