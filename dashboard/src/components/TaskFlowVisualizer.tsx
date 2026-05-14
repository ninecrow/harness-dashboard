import React from 'react';
import { Play, Pause, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { TaskFlowStatus } from '../types';

interface TaskFlowVisualizerProps {
  taskflows: TaskFlowStatus[];
}

const TaskFlowVisualizer: React.FC<TaskFlowVisualizerProps> = ({ taskflows }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {taskflows.map((taskflow) => (
        <div 
          key={taskflow.id} 
          className={`border rounded-lg p-4 ${getStatusColor(taskflow.status)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(taskflow.status)}
              <div>
                <h3 className="font-medium text-gray-900">{taskflow.name}</h3>
                <p className="text-sm text-gray-500">{taskflow.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {taskflow.progress_percentage.toFixed(0)}%
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${taskflow.progress_percentage}%` }}
            />
          </div>

          {/* Stages */}
          {taskflow.stages.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {taskflow.stages.map((stage, index) => (
                <React.Fragment key={stage.name}>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                    stage.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {getStatusIcon(stage.status)}
                    <span>{stage.name}</span>
                  </div>
                  {index < taskflow.stages.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {taskflow.stages.length === 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>clarify</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>design</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>implement</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>test</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>review</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {taskflows.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>暂无 TaskFlow 数据</p>
        </div>
      )}
    </div>
  );
};

export default TaskFlowVisualizer;
