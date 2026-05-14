import React from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { ExecutionStep } from '../types';

interface ExecutionTimelineProps {
  executions: ExecutionStep[];
}

const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ executions }) => {
  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'plan':
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">P</div>;
      case 'act':
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">A</div>;
      case 'observe':
        return <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-xs font-bold">O</div>;
      case 'reflect':
        return <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">R</div>;
      case 'review':
        return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">Rv</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">?</div>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <RotateCcw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-0">
      {executions.map((execution, index) => (
        <div key={execution.id} className="flex gap-4 relative">
          {/* Timeline line */}
          {index < executions.length - 1 && (
            <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
          )}
          
          {/* Icon */}
          <div className="flex-shrink-0 z-10">
            {getStepIcon(execution.step_type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 capitalize">
                  {execution.step_type}
                </span>
                {getStatusIcon(execution.status)}
              </div>
              <span className="text-sm text-gray-400">
                {formatDuration(execution.duration_ms)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {execution.description}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>模型: {execution.model_used}</span>
              <span>Tokens: {execution.input_tokens + execution.output_tokens}</span>
              <span>成本: ${execution.cost_usd.toFixed(4)}</span>
            </div>
          </div>
        </div>
      ))}

      {executions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>暂无执行记录</p>
        </div>
      )}
    </div>
  );
};

export default ExecutionTimeline;
