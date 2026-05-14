from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import os
import yaml
import sqlite3

from .models import (
    SystemStatus, ModelStatus, TaskFlowStatus, 
    AgentNode, ExecutionStep, CostMetrics,
    DashboardData, AlertConfig, ExportRequest
)
from .services.data_collector import DataCollector
from .services.alert_service import AlertService
from .services.export_service import ExportService

# 全局服务实例
data_collector: Optional[DataCollector] = None
alert_service: Optional[AlertService] = None
export_service: Optional[ExportService] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global data_collector, alert_service, export_service
    
    # 初始化服务
    data_collector = DataCollector()
    alert_service = AlertService()
    export_service = ExportService()
    
    # 启动后台任务
    asyncio.create_task(periodic_refresh())
    
    yield
    
    # 清理资源
    if data_collector:
        await data_collector.close()

app = FastAPI(
    title="Harness Engineering Dashboard API",
    description="实时监控和可视化 Harness Engineering 项目过程",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def periodic_refresh():
    """定时刷新数据"""
    while True:
        try:
            if data_collector:
                await data_collector.refresh()
        except Exception as e:
            print(f"刷新数据失败: {e}")
        await asyncio.sleep(30)  # 30秒刷新一次

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/v1/dashboard", response_model=DashboardData)
async def get_dashboard_data():
    """获取 Dashboard 完整数据"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    try:
        data = await data_collector.get_dashboard_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/system/status", response_model=SystemStatus)
async def get_system_status():
    """获取系统状态"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_system_status()

@app.get("/api/v1/models", response_model=List[ModelStatus])
async def get_models_status():
    """获取模型状态列表"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_models_status()

@app.get("/api/v1/taskflows", response_model=List[TaskFlowStatus])
async def get_taskflows_status():
    """获取 TaskFlow 状态列表"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_taskflows_status()

@app.get("/api/v1/agents/nodes", response_model=List[AgentNode])
async def get_agent_nodes():
    """获取 Agent 节点拓扑"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_agent_nodes()

@app.get("/api/v1/execution/steps", response_model=List[ExecutionStep])
async def get_execution_steps(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None
):
    """获取执行步骤历史"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_execution_steps(limit, offset, status)

@app.get("/api/v1/metrics/costs", response_model=CostMetrics)
async def get_cost_metrics(
    days: int = 7,
    model: Optional[str] = None
):
    """获取成本指标"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_cost_metrics(days, model)

@app.get("/api/v1/metrics/trends")
async def get_trends(
    metric: str = "executions",
    days: int = 30
):
    """获取趋势数据"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_trends(metric, days)

@app.post("/api/v1/alerts/config")
async def configure_alerts(config: AlertConfig):
    """配置告警规则"""
    if not alert_service:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    await alert_service.update_config(config)
    return {"status": "success", "message": "告警配置已更新"}

@app.get("/api/v1/alerts/history")
async def get_alert_history(
    limit: int = 50,
    severity: Optional[str] = None
):
    """获取告警历史"""
    if not alert_service:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await alert_service.get_history(limit, severity)

@app.post("/api/v1/export")
async def export_data(request: ExportRequest):
    """导出数据到 Obsidian"""
    if not export_service:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    try:
        result = await export_service.export_to_obsidian(request)
        return {"status": "success", "path": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/skills/usage")
async def get_skills_usage(
    days: int = 7,
    limit: int = 20
):
    """获取技能使用统计"""
    if not data_collector:
        raise HTTPException(status_code=503, detail="服务未初始化")
    
    return await data_collector.get_skills_usage(days, limit)

@app.get("/api/v1/config")
async def get_hermes_config():
    """获取 Hermes 配置"""
    config_path = os.environ.get("HERMES_DATA_PATH", "/app/data") + "/config.yaml"
    
    try:
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
        return config
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="配置文件未找到")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
