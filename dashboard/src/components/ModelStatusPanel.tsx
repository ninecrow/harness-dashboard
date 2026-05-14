import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { ModelStatus } from '../types';

interface ModelStatusPanelProps {
  models: ModelStatus[];
}

const ModelStatusPanel: React.FC<ModelStatusPanelProps> = ({ models }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleBadge = (model: ModelStatus) => {
    if (model.is_default) {
      return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">默认</span>;
    }
    if (model.is_fallback) {
      return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Fallback</span>;
    }
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">子代理</span>;
  };

  return (
    <div className="space-y-4">
      {models.map((model) => (
        <div key={model.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            {getStatusIcon(model.status)}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{model.name}</h3>
                {getRoleBadge(model)}
              </div>
              <p className="text-sm text-gray-500">{model.provider}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-gray-500">24h 调用</p>
              <p className="font-medium">{model.call_count_24h}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">平均响应</p>
              <p className="font-medium">{model.avg_response_time.toFixed(0)}ms</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">错误率</p>
              <p className={`font-medium ${model.error_rate > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                {(model.error_rate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {models.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>暂无模型数据</p>
        </div>
      )}
    </div>
  );
};

export default ModelStatusPanel;