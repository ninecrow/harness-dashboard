import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  GitBranch, 
  Users, 
  DollarSign, 
  Zap,
  Settings,
  Bell,
  Download
} from 'lucide-react';
import SystemStatusCard from './components/SystemStatusCard';
import ModelStatusPanel from './components/ModelStatusPanel';
import TaskFlowVisualizer from './components/TaskFlowVisualizer';
import AgentTopology from './components/AgentTopology';
import CostMetricsChart from './components/CostMetricsChart';
import ExecutionTimeline from './components/ExecutionTimeline';
import SkillsUsageChart from './components/SkillsUsageChart';
import AlertPanel from './components/AlertPanel';
import { DashboardData } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const REFRESH_INTERVAL = parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '30000');

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/dashboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">加载失败</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Harness Engineering</h1>
                <p className="text-xs text-gray-500">Dashboard v1.0.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                上次更新: {lastUpdate.toLocaleTimeString()}
              </span>
              <button 
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SystemStatusCard 
            title="系统状态"
            value={data?.system.status || '未知'}
            icon={<Activity className="w-6 h-6" />}
            status="running"
          />
          <SystemStatusCard 
            title="活跃会话"
            value={data?.system.active_sessions.toString() || '0'}
            icon={<Users className="w-6 h-6" />}
            status="normal"
          />
          <SystemStatusCard 
            title="待处理任务"
            value={data?.system.pending_tasks.toString() || '0'}
            icon={<GitBranch className="w-6 h-6" />}
            status={data?.system.pending_tasks && data.system.pending_tasks > 5 ? 'warning' : 'normal'}
          />
          <SystemStatusCard 
            title="今日成本"
            value={`$${data?.costs.total_cost_usd.toFixed(2) || '0.00'}`}
            icon={<DollarSign className="w-6 h-6" />}
            status="normal"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Model Status */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  模型状态
                </h2>
              </div>
              <ModelStatusPanel models={data?.models || []} />
            </section>

            {/* TaskFlow Visualization */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-600" />
                  TaskFlow 执行流
                </h2>
              </div>
              <TaskFlowVisualizer taskflows={data?.taskflows || []} />
            </section>

            {/* Agent Topology */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Agent 协作拓扑
                </h2>
              </div>
              <AgentTopology agents={data?.agents || []} />
            </section>

            {/* Execution Timeline */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  执行时间线
                </h2>
              </div>
              <ExecutionTimeline executions={data?.recent_executions || []} />
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Cost Metrics */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  成本分析
                </h2>
              </div>
              <CostMetricsChart data={data?.costs} />
            </section>

            {/* Skills Usage */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  技能使用统计
                </h2>
              </div>
              <SkillsUsageChart skills={data?.skills || []} />
            </section>

            {/* Alerts */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600" />
                  告警信息
                </h2>
              </div>
              <AlertPanel alerts={data?.alerts || []} />
            </section>

            {/* Quick Actions */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title">快捷操作</h2>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>导出到 Obsidian</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>配置告警规则</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
