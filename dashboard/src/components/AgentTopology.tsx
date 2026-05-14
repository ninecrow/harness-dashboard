import React from 'react';
import { User, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AgentNode } from '../types';

interface AgentTopologyProps {
  agents: AgentNode[];
}

const AgentTopology: React.FC<AgentTopologyProps> = ({ agents }) => {
  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'manager':
        return <Users className="w-6 h-6 text-purple-600" />;
      case 'worker':
        return <User className="w-6 h-6 text-blue-600" />;
      default:
        return <User className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // 构建树形结构
  const buildTree = (agents: AgentNode[]): AgentNode[] => {
    const agentMap = new Map(agents.map(a => [a.id, { ...a, children: [] as AgentNode[] }]));
    const roots: AgentNode[] = [];

    agents.forEach(agent => {
      const node = agentMap.get(agent.id);
      if (node) {
        if (agent.parent_id && agentMap.has(agent.parent_id)) {
          const parent = agentMap.get(agent.parent_id);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  };

  const renderNode = (node: AgentNode & { children?: AgentNode[] }, level: number = 0) => {
    return (
      <div key={node.id} className={`${level > 0 ? 'ml-8 mt-2' : ''}`}>
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          {getAgentIcon(node.type)}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{node.name}</h4>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {node.type}
              </span>
            </div>
            {node.current_task && (
              <p className="text-sm text-gray-500 mt-1">{node.current_task}</p>
            )}
            {node.model_used && (
              <p className="text-xs text-gray-400 mt-1">模型: {node.model_used}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(node.status)}
            <span className="text-sm text-gray-500">
              {node.tasks_completed}/{node.tasks_completed + node.tasks_failed}
            </span>
          </div>
        </div>
        {node.children && node.children.map(child => renderNode(child as AgentNode & { children?: AgentNode[] }, level + 1))}
      </div>
    );
  };

  const tree = buildTree(agents);

  return (
    <div className="space-y-2">
      {tree.map(node => renderNode(node as AgentNode & { children?: AgentNode[] }))}
      {agents.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>暂无 Agent 数据</p>
        </div>
      )}
    </div>
  );
};

export default AgentTopology;