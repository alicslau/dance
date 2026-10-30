# 舞伴匹配 · 人员信息统计与匹配

一个可在微信内打开的 H5 应用：录入人员信息、查看统计、按多维度自动匹配舞伴。

- **前端**：Umi 4 + React 18 + antd-mobile（移动端 H5，微信内置浏览器可直接打开）
- **后端**：Python FastAPI + SQLAlchemy + SQLite

## 目录结构

```
dance/
├── backend/          FastAPI 后端
│   ├── main.py       路由与接口
│   ├── models.py     数据模型
│   ├── schemas.py    Pydantic 校验
│   ├── matching.py   匹配算法（多维度打分 + 贪心配对）
│   ├── seed.py       演示数据
│   ├── database.py   SQLite 连接
│   └── requirements.txt
└── frontend/         Umi 前端
    ├── .umirc.ts     路由 / 代理 / hash 路由
    └── src/
        ├── layouts/index.tsx   底部 TabBar 布局
        ├── pages/              统计 / 登记 / 列表 / 匹配 四个页面
        ├── components/BarList  条形图组件
        └── services/api.ts     接口封装
```

## 人员信息字段

姓名、性别、年龄、学号、地区、舞种/技能标签（可多选）、爱好、星座、MBTI。

## 匹配算法

按 7 个维度对每两人计算兼容度（0~1），加权求和得到两两分数：

| 维度 | 权重 | 规则 |
|---|---|---|
| 舞种重合 | 35% | 舞种标签 Jaccard 相似度 |
| 性别互补 | 20% | 异性满分，同性/其他中性 |
| 同地区 | 15% | 相同地区加分 |
| 年龄相近 | 10% | 差值越小分越高 |
| 共同爱好 | 10% | 爱好标签 Jaccard 相似度 |
| MBTI | 5% | 互补“黄金搭档”加分 |
| 星座 | 5% | 火风/土水相配、同元素加分 |

**配对算法**（可选）：

- **最优匹配**（默认）：全局最优。异性配对用**匈牙利算法**（Kuhn-Munkres，二分图最大权匹配）；不限性别用 **Blossom 算法**（networkx，一般图最大权匹配）。两者均与暴力枚举逐一核对过正确性。
- **贪心**：按分数从高到低依次配对。

**规则与筛选**：

- 规则：**异性优先**（默认，仅男↔女）/ **不限性别**
- **最低匹配分**：低于该分不配对（0 表示不限）
- **筛选**：可只让符合条件的人参与匹配（舞种 / 地区 / 性别）

权重在 `backend/matching.py` 的 `WEIGHTS` 中可调。

## 快速开始

### 1. 启动后端（端口 8000）

```bash
cd backend
python3 -m venv .venv                     # 首次
./.venv/bin/pip install -r requirements.txt   # 首次
./.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. 启动前端（端口 8001）

```bash
cd frontend
npm install          # 首次
npm run dev
```

浏览器打开 http://localhost:8001 （后端接口已由 umi 代理转发）。

> 列表页有「填充示例数据」按钮（调用 `/api/seed`）可一键写入 16 条演示数据。想清空重来：删除 `backend/dance.db` 文件，或逐个删除。

## 微信 / 手机打开

前端 dev 服务已绑定 `0.0.0.0`，同一 Wi-Fi 下，用电脑局域网 IP 访问即可：

1. 启动后看终端里 `Network` 那一行（或运行 `./start.sh` 时打印的「手机访问」地址），例如 `http://10.140.32.171:8001`。此 IP 是电脑的局域网地址，换 WiFi 后会变。
2. 把该地址发到手机（微信里点开、或用微信「扫一扫」识别二维码均可）。
3. dev 模式下 `/api` 由电脑上的代理转发到后端，手机无需额外配置。

**正式部署**：前端部署到 Vercel，后端部署到 Render。生产构建默认用 `frontend/src/config.ts` 里的 `PROD_API`（当前 `https://ruc-art-backend.onrender.com/api`），本地开发仍走 `frontend/.umirc.ts` 的 `/api` 代理；后端域名变了改 `config.ts`，或在 Vercel 项目里设 `UMI_APP_API_BASE` 环境变量覆盖。

## 接口一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| POST | `/api/persons` | 新增人员 |
| GET | `/api/persons` | 人员列表 |
| DELETE | `/api/persons/{id}` | 删除人员 |
| GET | `/api/stats` | 统计（人数/性别/舞种/地区/星座/MBTI） |
| POST | `/api/match` | 匹配，body `{"gender_mode": "opposite" \| "any", "algorithm": "optimal" \| "greedy", "min_score": 0~1, "filters": {"dance_style", "region", "gender"}}` |
| POST | `/api/seed` | 填充演示数据 |

接口文档（Swagger）：启动后端后访问 http://localhost:8000/docs
