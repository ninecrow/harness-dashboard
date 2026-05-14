#!/bin/bash
# Harness Dashboard 部署脚本

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "          Harness Engineering Dashboard 部署"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    echo "   安装指南: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    echo "   安装指南: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，使用默认配置"
    cp .env.example .env
fi

# 构建并启动
echo "🚀 开始构建..."
docker-compose build

echo ""
echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "          部署完成"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "服务地址："
echo "  Dashboard: http://localhost:3000"
echo "  API 文档:  http://localhost:8000/docs"
echo "  API 状态:  http://localhost:8000/health"
echo ""
echo "查看日志："
echo "  docker-compose logs -f"
echo ""
echo "停止服务："
echo "  docker-compose down"
echo ""
