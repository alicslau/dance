#!/usr/bin/env bash
# 一键启动前后端：后端 FastAPI(:8000) + 前端 Umi dev(:8001)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# 局域网 IP（手机扫码/访问用）
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")

echo "=========================================="
echo "  舞伴匹配 · 启动前后端"
echo "=========================================="

# ---- 后端 ----
cd "$BACKEND"
if [ ! -d .venv ]; then
  echo "· 首次运行：创建后端虚拟环境并安装依赖..."
  python3 -m venv .venv
  ./.venv/bin/pip install -q -r requirements.txt
fi
echo "· 启动后端 :8000"
./.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACK_PID=$!

# ---- 前端 ----
cd "$FRONTEND"
if [ ! -d node_modules ]; then
  echo "· 首次运行：安装前端依赖（较慢，请耐心等待）..."
  npm install
fi
echo "· 启动前端 :8001"
npm run dev &
FRONT_PID=$!

cleanup() {
  echo ""
  echo "正在停止前后端..."
  kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
  pkill -f "uvicorn main:app" 2>/dev/null || true
  pkill -f "umi dev" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo ""
echo "=========================================="
echo "  启动完成"
echo "  本机访问 : http://localhost:8001/"
echo "  手机访问 : http://$LAN_IP:8001/"
echo "  （手机需与电脑在同一 Wi-Fi，可扫桌面二维码）"
echo "  按 Ctrl+C 停止前后端"
echo "=========================================="
echo ""

wait
