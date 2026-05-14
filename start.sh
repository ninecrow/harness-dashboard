#!/bin/bash
# Harness Dashboard 启动脚本
# 支持本地开发和生产环境

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV="${1:-dev}"

echo "═══════════════════════════════════════════════════════════════"
echo "          Harness Engineering Dashboard 启动脚本"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "环境: $ENV"
echo ""

# 检查依赖
check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ $1 未安装"
        return 1
    fi
    echo "✅ $1"
}

echo "【检查依赖】"
check_dependency python3 || exit 1
check_dependency node || exit 1
check_dependency npm || exit 1

echo ""
echo "【检查端口】"

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -i :"$port" &> /dev/null; then
        echo "⚠️  端口 $port 已被占用"
        return 1
    fi
    echo "✅ 端口 $port 可用"
}

check_port 8000
check_port 3000

echo ""
echo "【启动服务】"

# 启动 API 服务
start_api() {
    echo "🚀 启动 API 服务 (端口 8000)..."
    cd "$SCRIPT_DIR/api"
    
    # 检查 Python 依赖
    if ! python3 -c "import fastapi" 2>/dev/null; then
        echo "📦 安装 Python 依赖..."
        pip3 install -r requirements.txt
    fi
    
    # 后台启动 API
    python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$SCRIPT_DIR/api.log" 2>&1 &
    API_PID=$!
    echo $API_PID > "$SCRIPT_DIR/api.pid"
    
    # 等待 API 启动
    echo "⏳ 等待 API 启动..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo "✅ API 服务已启动 (PID: $API_PID)"
            return 0
        fi
        sleep 1
    done
    
    echo "❌ API 服务启动失败"
    return 1
}

# 启动前端服务
start_frontend() {
    echo "🚀 启动前端服务 (端口 3000)..."
    cd "$SCRIPT_DIR/dashboard"
    
    # 检查是否需要构建
    if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
        echo "📦 构建前端..."
        npm install
        npm run build
    fi
    
    # 启动前端服务器
    cd "$SCRIPT_DIR/dashboard/dist"
    python3 -m http.server 3000 > "$SCRIPT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$SCRIPT_DIR/frontend.pid"
    
    echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
}

# 启动服务
start_api
start_frontend

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "          服务已启动"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "【访问地址】"
echo "  Dashboard:    http://localhost:3000"
echo "  API:          http://localhost:8000"
echo "  API 文档:     http://localhost:8000/docs"
echo "  健康检查:     http://localhost:8000/health"
echo ""
echo "【日志文件】"
echo "  API 日志:     $SCRIPT_DIR/api.log"
echo "  前端日志:     $SCRIPT_DIR/frontend.log"
echo ""
echo "【停止服务】"
echo "  ./stop.sh"
echo ""
echo "═══════════════════════════════════════════════════════════════"
