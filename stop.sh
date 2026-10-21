#!/usr/bin/env bash
# 停止前后端服务：后端 FastAPI(:8000) + 前端 Umi dev(:8001)

echo "正在停止前后端服务..."

# 后端（--reload 会起父/子进程，一并清理）
pkill -f "uvicorn main:app" 2>/dev/null && echo "  · 已停止后端 uvicorn"

# 前端（umi dev 实际进程为 forkedDev.js）
pkill -f "forkedDev.js" 2>/dev/null && echo "  · 已停止前端 umi dev"

# 兜底：按端口再清一次，确保监听进程全部结束
for PORT in 8000 8001; do
  PIDS=$(lsof -tnP -iTCP:$PORT -sTCP:LISTEN 2>/dev/null)
  if [ -n "$PIDS" ]; then
    kill $PIDS 2>/dev/null && echo "  · 已释放端口 $PORT"
  fi
done

sleep 1

if lsof -nP -iTCP:8000 -sTCP:LISTEN >/dev/null 2>&1 || lsof -nP -iTCP:8001 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "⚠️ 仍有端口被占用，请再运行一次本脚本"
  exit 1
else
  echo "✅ 前后端已全部停止"
fi
