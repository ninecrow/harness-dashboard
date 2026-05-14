#!/bin/bash
# Harness Dashboard 停止脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "═══════════════════════════════════════════════════════════════"
echo "          Harness Engineering Dashboard 停止脚本"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 停止 API 服务
stop_api() {
    if [ -f "$SCRIPT_DIR/api.pid" ]; then
        PID=$(cat "$SCRIPT_DIR/api.pid")
        if kill -0 "$PID" 2>/dev/null; then
            echo "🛑 停止 API 服务 (PID: $PID)..."
            kill "$PID"
            rm "$SCRIPT_DIR/api.pid"
            echo "✅ API 服务已停止"
        else
            echo "⚠️  API 服务未运行"
            rm -f "$SCRIPT_DIR/api.pid"
        fi
    else
        echo "⚠️  API PID 文件不存在"
    fi
}

# 停止前端服务
stop_frontend() {
    if [ -f "$SCRIPT_DIR/frontend.pid" ]; then
        PID=$(cat "$SCRIPT_DIR/frontend.pid")
        if kill -0 "$PID" 2>/dev/null; then
            echo "🛑 停止前端服务 (PID: $PID)..."
            kill "$PID"
            rm "$SCRIPT_DIR/frontend.pid"
            echo "✅ 前端服务已停止"
        else
            echo "⚠️  前端服务未运行"
            rm -f "$SCRIPT_DIR/frontend.pid"
        fi
    else
        echo "⚠️  前端 PID 文件不存在"
    fi
}

# 停止服务
stop_api
stop_frontend

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "          服务已停止"
echo "═══════════════════════════════════════════════════════════════"
