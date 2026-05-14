from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Literal
from datetime import datetime
from enum import Enum

class StatusEnum(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PENDING = "pending"
    WARNING = "warning"

class ModelProvider(str, Enum):
    KIMI = "kimi-coding"
    DASHSCOPE = "dashscope"
    OPENROUTER = "openrouter"
    DEEPSEEK = "deepseek"

class SystemStatus(BaseModel):
    status: StatusEnum
    uptime: str
    version: str
    last_refresh: datetime
    active_sessions: int
    total_messages: int
    pending_tasks: int

class ModelStatus(BaseModel):
    name: str
    provider: ModelProvider
    status: StatusEnum
    is_default: bool = False
    is_fallback: bool = False
    last_used: Optional[datetime] = None
    call_count_24h: int = 0
    avg_response_time: float = 0.0
    error_rate: float = 0.0
    cost_per_1k_tokens: float = 0.0

class TaskFlowStage(BaseModel):
    name: str
    status: StatusEnum
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    model_used: Optional[str] = None
    logs: List[str] = []

class TaskFlowStatus(BaseModel):
    id: str
    name: str
    type: str  # new-module, auth-module, hotfix, refactor
    status: StatusEnum
    current_stage: Optional[str] = None
    stages: List[TaskFlowStage] = []
    created_at: datetime
    updated_at: datetime
    progress_percentage: float = 0.0

class AgentNode(BaseModel):
    id: str
    name: str
    type: Literal["manager", "worker", "reviewer"]
    status: StatusEnum
    parent_id: Optional[str] = None
    children_ids: List[str] = []
    current_task: Optional[str] = None
    model_used: Optional[str] = None
    start_time: Optional[datetime] = None
    tasks_completed: int = 0
    tasks_failed: int = 0

class ExecutionStep(BaseModel):
    id: str
    taskflow_id: str
    agent_id: str
    step_type: Literal["plan", "act", "observe", "reflect", "review"]
    status: StatusEnum
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_ms: Optional[int] = None
    input_tokens: int = 0
    output_tokens: int = 0
    model_used: str
    cost_usd: float = 0.0
    metadata: Dict[str, Any] = {}

class CostMetrics(BaseModel):
    total_cost_usd: float
    total_tokens: int
    total_calls: int
    avg_cost_per_call: float
    by_model: Dict[str, Dict[str, float]]
    by_day: List[Dict[str, Any]]
    trend: Literal["up", "down", "stable"]

class SkillUsage(BaseModel):
    skill_name: str
    category: str
    call_count: int
    success_rate: float
    avg_duration_ms: float
    last_used: Optional[datetime] = None

class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AlertConfig(BaseModel):
    enabled: bool = True
    feishu_webhook: Optional[str] = None
    email_recipients: List[str] = []
    thresholds: Dict[str, float] = Field(default_factory=lambda: {
        "error_rate": 0.1,
        "cost_daily_usd": 10.0,
        "response_time_ms": 30000,
        "failed_tasks": 5
    })

class ExportRequest(BaseModel):
    export_type: Literal["markdown", "json", "csv"]
    data_type: Literal["executions", "costs", "skills", "full"]
    date_range: Optional[Dict[str, str]] = None
    obsidian_vault_path: Optional[str] = None

class DashboardData(BaseModel):
    system: SystemStatus
    models: List[ModelStatus]
    taskflows: List[TaskFlowStatus]
    agents: List[AgentNode]
    recent_executions: List[ExecutionStep]
    costs: CostMetrics
    skills: List[SkillUsage]
    alerts: List[Dict[str, Any]]
