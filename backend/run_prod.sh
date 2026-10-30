#!/usr/bin/env bash
# 生产启动后端：多 worker、无热重载（区别于开发用的 start.sh）
set -e
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  echo "未找到虚拟环境，请先初始化并安装依赖："
  echo "  python3 -m venv .venv"
  echo "  ./.venv/bin/pip install -r requirements.txt"
  exit 1
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
WORKERS="${WORKERS:-4}"

echo "生产启动后端 -> http://${HOST}:${PORT} （${WORKERS} 个 worker）"
exec ./.venv/bin/uvicorn main:app --host "$HOST" --port "$PORT" --workers "$WORKERS"
