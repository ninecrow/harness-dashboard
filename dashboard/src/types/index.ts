export interface SystemStatus {
  status: string;
  uptime: string;
  version: string;
  last_refresh: string;
  active_sessions: number;
  total_messages: number;
  pending_tasks: number;
}

export interface ModelStatus {
  name: string;
  provider: string;
  status: string;
  is_default: boolean;
  is_fallback: boolean;
  last_used?: string;
  call_count_24h: number;
  avg_response_time: number;
  error_rate: number;
  cost_per_1k_tokens: number;
}

export interface TaskFlowStage {
  name: string;
  status: string;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  model_used?: string;
  logs: string[];
}

export interface TaskFlowStatus {
  id: string;
  name: string;
  type: string;
  status: string;
  current_stage?: string;
  stages: TaskFlowStage[];
  created_at: string;
  updated_at: string;
  progress_percentage: number;
}

export interface AgentNode {
  id: string;
  name: string;
  type: 'manager' | 'worker' | 'reviewer';
  status: string;
  parent_id?: string;
  children_ids: string[];
  current_task?: string;
  model_used?: string;
  start_time?: string;
  tasks_completed: number;
  tasks_failed: number;
}

export interface ExecutionStep {
  id: string;
  taskflow_id: string;
  agent_id: string;
  step_type: string;
  status: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  input_tokens: number;
  output_tokens: number;
  model_used: string;
  cost_usd: number;
}

export interface CostMetrics {
  total_cost_usd: number;
  total_tokens: number;
  total_calls: number;
  avg_cost_per_call: number;
  by_model: Record<string, Record<string, number>>;
  by_day: Array<Record<string, any>>;
  trend: string;
}

export interface SkillUsage {
  skill_name: string;
  category: string;
  call_count: number;
  success_rate: number;
  avg_duration_ms: number;
  last_used?: string;
}

export interface DashboardData {
  system: SystemStatus;
  models: ModelStatus[];
  taskflows: TaskFlowStatus[];
  agents: AgentNode[];
  recent_executions: ExecutionStep[];
  costs: CostMetrics;
  skills: SkillUsage[];
  alerts: Array<Record<string, any>>;
}
