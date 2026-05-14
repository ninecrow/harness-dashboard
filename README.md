# Harness Engineering Dashboard

> 实时监控和可视化 Harness Engineering 项目过程的 Dashboard

## 功能特性

- ✅ **系统状态监控** — 实时查看 Hermes 运行状态
- ✅ **模型状态面板** — 多模型负载和性能监控
- ✅ **TaskFlow 可视化** — 工作流执行进度追踪
- ✅ **Agent 协作拓扑** — Manager-Workers 关系图
- ✅ **执行时间线** — ReAct 循环步骤追踪
- ✅ **成本分析** — 模型调用成本和趋势
- ✅ **技能使用统计** — 技能调用频率和成功率
- ✅ **飞书告警** — 异常自动通知
- ✅ **Obsidian 导出** — 数据导出到知识库

## 快速开始

### 1. 克隆仓库

```bash
git clone git@github.com:ninecrow/harness-dashboard.git
cd harness-dashboard
```

### 2. 配置环境变量

```bash
# 编辑 .env 文件
cp .env.example .env

# 配置飞书通知（可选）
FEISHU_APP_ID=cli_a96a143ae3385bcb
FEISHU_APP_SECRET=your_secret
```

### 3. Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 4. 访问 Dashboard

- Dashboard: http://localhost:3000
- API 文档: http://localhost:8000/docs

## 项目结构

```
harness-dashboard/
├── api/                    # FastAPI 后端
│   ├── app/
│   │   ├── main.py        # 主应用
│   │   ├── models.py      # 数据模型
│   │   └── services/      # 业务逻辑
│   ├── Dockerfile
│   └── requirements.txt
├── dashboard/             # React 前端
│   ├── src/
│   │   ├── components/    # UI 组件
│   │   ├── types/         # TypeScript 类型
│   │   └── App.tsx        # 主应用
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Docker 编排
└── README.md
```

## API 端点

| 端点 | 方法 | 说明 |
|:---|:---|:---|
| `/health` | GET | 健康检查 |
| `/api/v1/dashboard` | GET | 完整 Dashboard 数据 |
| `/api/v1/system/status` | GET | 系统状态 |
| `/api/v1/models` | GET | 模型状态列表 |
| `/api/v1/taskflows` | GET | TaskFlow 状态 |
| `/api/v1/agents/nodes` | GET | Agent 节点拓扑 |
| `/api/v1/execution/steps` | GET | 执行步骤历史 |
| `/api/v1/metrics/costs` | GET | 成本指标 |
| `/api/v1/metrics/trends` | GET | 趋势数据 |
| `/api/v1/skills/usage` | GET | 技能使用统计 |
| `/api/v1/export` | POST | 导出到 Obsidian |

## 配置说明

### 环境变量

| 变量 | 默认值 | 说明 |
|:---|:---|:---|
| `REACT_APP_API_URL` | `http://localhost:8000` | API 地址 |
| `REACT_APP_REFRESH_INTERVAL` | `30000` | 刷新间隔(ms) |
| `HERMES_LOG_PATH` | `/app/logs` | Hermes 日志路径 |
| `HERMES_DATA_PATH` | `/app/data` | Hermes 数据路径 |

### 数据卷映射

```yaml
volumes:
  - ~/.hermes/logs:/app/logs:ro      # 日志文件
  - ~/.hermes/kanban.db:/app/data/kanban.db:ro  # Kanban 数据库
  - ~/.hermes/config.yaml:/app/data/config.yaml:ro  # 配置文件
  - ~/.hermes/skills:/app/data/skills:ro  # 技能文件
```

## 开发指南

### 本地开发

```bash
# 启动后端
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 启动前端（新终端）
cd dashboard
npm install
npm start
```

### 构建镜像

```bash
# 构建 API 镜像
docker build -t harness-api ./api

# 构建 Dashboard 镜像
docker build -t harness-dashboard ./dashboard
```

## 迁移到阿里云 ECS

1. **准备 ECS 实例**
   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com | sh
   
   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **配置域名和 HTTPS**
   ```bash
   # 使用 Nginx 反向代理
   # 配置 SSL 证书
   # 修改 docker-compose.yml 启用 nginx 服务
   ```

3. **部署**
   ```bash
   git clone git@github.com:ninecrow/harness-dashboard.git
   cd harness-dashboard
   docker-compose up -d
   ```

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -am 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

## 许可证

MIT License
