import os
import yaml
import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import asyncio

from ..models import (
    SystemStatus, ModelStatus, TaskFlowStatus, TaskFlowStage,
    AgentNode, ExecutionStep, CostMetrics, SkillUsage, StatusEnum
)

class DataCollector:
    """数据收集器 - 从 Hermes 文件系统收集数据"""
    
    def __init__(self):
        self.data_path = os.environ.get("HERMES_DATA_PATH", "/app/data")
        self.log_path = os.environ.get("HERMES_LOG_PATH", "/app/logs")
        self.config = None
        self.last_refresh = None
        self._cache = {}
        
    async def refresh(self):
        """刷新所有数据"""
        try:
            self.config = await self._load_config()
            self.last_refresh = datetime.now()
            
            # 预加载数据到缓存
            self._cache = {
                "system": await self.get_system_status(),
                "models": await self.get_models_status(),
                "taskflows": await self.get_taskflows_status(),
                "agents": await self.get_agent_nodes(),
                "executions": await self.get_execution_steps(50, 0),
                "costs": await self.get_cost_metrics(7),
                "skills": await self.get_skills_usage(7, 20)
            }
        except Exception as e:
            print(f"数据刷新失败: {e}")
    
    async def close(self):
        """清理资源"""
        pass
    
    async def _load_config(self) -> Dict:
        """加载 Hermes 配置"""
        config_path = os.path.join(self.data_path, "config.yaml")
        try:
            with open(config_path, "r") as f:
                return yaml.safe_load(f)
        except Exception:
            return {}
    
    async def get_system_status(self) -> SystemStatus:
        """获取系统状态"""
        # 从日志文件分析
        log_files = self._get_log_files()
        
        # 计算活跃会话数（从会话数据库）
        active_sessions = 0
        total_messages = 0
        
        try:
            sessions_db = os.path.expanduser("~/.hermes/sessions.db")
            if os.path.exists(sessions_db):
                conn = sqlite3.connect(sessions_db)
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM sessions WHERE updated_at > datetime('now', '-1 hour')")
                active_sessions = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM messages")
                total_messages = cursor.fetchone()[0]
                conn.close()
        except Exception:
            pass
        
        # 从 Kanban 数据库获取待处理任务
        pending_tasks = 0
        try:
            kanban_db = os.path.join(self.data_path, "kanban.db")
            if os.path.exists(kanban_db):
                conn = sqlite3.connect(kanban_db)
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'pending'")
                result = cursor.fetchone()
                if result:
                    pending_tasks = result[0]
                conn.close()
        except Exception:
            pass
        
        return SystemStatus(
            status=StatusEnum.RUNNING,
            uptime="N/A",  # 需要额外实现
            version="1.0.0",
            last_refresh=self.last_refresh or datetime.now(),
            active_sessions=active_sessions,
            total_messages=total_messages,
            pending_tasks=pending_tasks
        )
    
    async def get_models_status(self) -> List[ModelStatus]:
        """获取模型状态"""
        if not self.config:
            self.config = await self._load_config()
        
        models = []
        
        # 从配置中提取模型信息
        default_model = self.config.get("model", {}).get("default", "kimi-k2.6")
        default_provider = self.config.get("model", {}).get("provider", "kimi-coding")
        
        fallback = self.config.get("fallback_model", {})
        fallback_model = fallback.get("model", "qwen-turbo")
        fallback_provider = fallback.get("provider", "dashscope")
        
        delegation = self.config.get("delegation", {})
        delegation_model = delegation.get("model", "qwen-turbo")
        delegation_provider = delegation.get("provider", "dashscope")
        
        # 主模型
        models.append(ModelStatus(
            name=default_model,
            provider=default_provider,
            status=StatusEnum.RUNNING,
            is_default=True,
            is_fallback=False,
            call_count_24h=0,  # 需要从日志统计
            avg_response_time=0.0,
            error_rate=0.0,
            cost_per_1k_tokens=0.0
        ))
        
        # Fallback 模型
        if fallback_model != default_model:
            models.append(ModelStatus(
                name=fallback_model,
                provider=fallback_provider,
                status=StatusEnum.RUNNING,
                is_default=False,
                is_fallback=True,
                call_count_24h=0,
                avg_response_time=0.0,
                error_rate=0.0,
                cost_per_1k_tokens=0.0
            ))
        
        # 子代理模型
        if delegation_model not in [m.name for m in models]:
            models.append(ModelStatus(
                name=delegation_model,
                provider=delegation_provider,
                status=StatusEnum.RUNNING,
                is_default=False,
                is_fallback=False,
                call_count_24h=0,
                avg_response_time=0.0,
                error_rate=0.0,
                cost_per_1k_tokens=0.0
            ))
        
        return models
    
    async def get_taskflows_status(self) -> List[TaskFlowStatus]:
        """获取 TaskFlow 状态"""
        taskflows = []
        
        # 从 YAML 配置文件读取
        configs_dir = os.path.join(self.data_path, "skills", "openclaw-imports", "harness-init", "references", "taskflow-configs")
        
        if os.path.exists(configs_dir):
            for filename in os.listdir(configs_dir):
                if filename.endswith(".yaml"):
                    filepath = os.path.join(configs_dir, filename)
                    try:
                        with open(filepath, "r") as f:
                            config = yaml.safe_load(f)
                        
                        taskflow_id = filename.replace(".yaml", "")
                        taskflows.append(TaskFlowStatus(
                            id=taskflow_id,
                            name=config.get("name", taskflow_id),
                            type=taskflow_id,
                            status=StatusEnum.PENDING,
                            current_stage=None,
                            stages=[],
                            created_at=datetime.now(),
                            updated_at=datetime.now(),
                            progress_percentage=0.0
                        ))
                    except Exception:
                        pass
        
        return taskflows
    
    async def get_agent_nodes(self) -> List[AgentNode]:
        """获取 Agent 节点拓扑"""
        agents = []
        
        # 从 Kanban 数据库获取任务信息
        try:
            kanban_db = os.path.join(self.data_path, "kanban.db")
            if os.path.exists(kanban_db):
                conn = sqlite3.connect(kanban_db)
                cursor = conn.cursor()
                
                # 获取活跃任务
                cursor.execute("""
                    SELECT id, title, status, assignee, created_at 
                    FROM tasks 
                    WHERE status IN ('in_progress', 'pending')
                    ORDER BY created_at DESC
                """)
                
                for row in cursor.fetchall():
                    agents.append(AgentNode(
                        id=str(row[0]),
                        name=row[1],
                        type="worker",
                        status=StatusEnum.RUNNING if row[2] == "in_progress" else StatusEnum.PENDING,
                        current_task=row[1],
                        start_time=datetime.fromisoformat(row[4]) if row[4] else None
                    ))
                
                conn.close()
        except Exception:
            pass
        
        # 如果没有数据，返回示例
        if not agents:
            agents = [
                AgentNode(
                    id="manager-1",
                    name="Manager",
                    type="manager",
                    status=StatusEnum.RUNNING,
                    children_ids=["worker-1", "worker-2"]
                ),
                AgentNode(
                    id="worker-1",
                    name="Developer",
                    type="worker",
                    status=StatusEnum.RUNNING,
                    parent_id="manager-1",
                    model_used="qwen-turbo"
                ),
                AgentNode(
                    id="worker-2",
                    name="Tester",
                    type="worker",
                    status=StatusEnum.PENDING,
                    parent_id="manager-1",
                    model_used="qwen-turbo"
                )
            ]
        
        return agents
    
    async def get_execution_steps(self, limit: int = 50, offset: int = 0, status: Optional[str] = None) -> List[ExecutionStep]:
        """获取执行步骤"""
        steps = []
        
        # 从日志文件解析执行步骤
        log_files = self._get_log_files()
        
        for log_file in log_files[:limit]:
            try:
                with open(log_file, "r") as f:
                    for line in f:
                        if "Execution" in line or "Step" in line:
                            # 简化解析，实际需要更复杂的日志解析
                            steps.append(ExecutionStep(
                                id=f"step-{len(steps)}",
                                taskflow_id="default",
                                agent_id="agent-1",
                                step_type="act",
                                status=StatusEnum.COMPLETED,
                                description=line.strip(),
                                start_time=datetime.now(),
                                model_used="kimi-k2.6"
                            ))
            except Exception:
                pass
        
        return steps[offset:offset+limit]
    
    async def get_cost_metrics(self, days: int = 7, model: Optional[str] = None) -> CostMetrics:
        """获取成本指标"""
        # 模拟数据，实际需要从 API 调用日志统计
        return CostMetrics(
            total_cost_usd=0.0,
            total_tokens=0,
            total_calls=0,
            avg_cost_per_call=0.0,
            by_model={},
            by_day=[],
            trend="stable"
        )
    
    async def get_trends(self, metric: str = "executions", days: int = 30) -> List[Dict[str, Any]]:
        """获取趋势数据"""
        trends = []
        
        # 生成模拟趋势数据
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            trends.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": 0  # 实际需要从日志统计
            })
        
        return list(reversed(trends))
    
    async def get_skills_usage(self, days: int = 7, limit: int = 20) -> List[SkillUsage]:
        """获取技能使用统计"""
        skills = []
        
        # 从技能目录读取
        skills_dir = os.path.join(self.data_path, "skills")
        
        if os.path.exists(skills_dir):
            for category in os.listdir(skills_dir):
                category_path = os.path.join(skills_dir, category)
                if os.path.isdir(category_path):
                    for skill_name in os.listdir(category_path):
                        skill_path = os.path.join(category_path, skill_name)
                        if os.path.isdir(skill_path):
                            skills.append(SkillUsage(
                                skill_name=skill_name,
                                category=category,
                                call_count=0,
                                success_rate=1.0,
                                avg_duration_ms=0.0
                            ))
        
        return skills[:limit]
    
    async def get_dashboard_data(self) -> Dict[str, Any]:
        """获取完整的 Dashboard 数据"""
        if not self._cache:
            await self.refresh()
        
        return {
            "system": self._cache.get("system"),
            "models": self._cache.get("models", []),
            "taskflows": self._cache.get("taskflows", []),
            "agents": self._cache.get("agents", []),
            "recent_executions": self._cache.get("executions", []),
            "costs": self._cache.get("costs"),
            "skills": self._cache.get("skills", []),
            "alerts": []
        }
    
    def _get_log_files(self) -> List[str]:
        """获取日志文件列表"""
        log_files = []
        
        if os.path.exists(self.log_path):
            for filename in os.listdir(self.log_path):
                if filename.endswith(".log"):
                    log_files.append(os.path.join(self.log_path, filename))
        
        return sorted(log_files, key=os.path.getmtime, reverse=True)
