import React from 'react';
import { Bell, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  message: string;
  severity: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertPanelProps {
  alerts: Alert[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-red-50 border-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-3">
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">暂无告警</p>
          <p className="text-sm text-gray-400 mt-1">系统运行正常</p>
        </div>
      ) : (
        alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(alert.timestamp)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AlertPanel;
