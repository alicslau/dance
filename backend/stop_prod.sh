#!/usr/bin/env bash
# 停止生产后端：FastAPI uvicorn(:8000) 主进程 + worker（对应 run_prod.sh）
PORT="${PORT:-8000}"

echo "正在停止生产后端（端口 $PORT）..."

# 1) 结束 uvicorn 主进程（SIGTERM 会带动各 worker 一并退出）
pkill -f "uvicorn main:app" 2>/dev/null && echo "  · 已停止 uvicorn 主进程"

# 2) 兜底：按端口清理仍监听的进程
PIDS=$(lsof -tnP -iTCP:$PORT -sTCP:LISTEN 2>/dev/null)
if [ -n "$PIDS" ]; then
  kill $PIDS 2>/dev/null && echo "  · 已释放端口 $PORT"
fi

sleep 1

if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "⚠️ 端口 $PORT 仍被占用，请再运行一次本脚本"
  exit 1
else
  echo "✅ 生产后端已停止"
fi
