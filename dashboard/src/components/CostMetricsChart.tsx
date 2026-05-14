import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CostMetrics } from '../types';

interface CostMetricsChartProps {
  data?: CostMetrics;
}

const CostMetricsChart: React.FC<CostMetricsChartProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>暂无成本数据</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">总成本</p>
          <p className="text-2xl font-bold text-gray-900">${data.total_cost_usd.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">总调用</p>
          <p className="text-2xl font-bold text-gray-900">{data.total_calls}</p>
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2">
        {getTrendIcon()}
        <span className="text-sm text-gray-600">
          趋势: {data.trend === 'up' ? '上升' : data.trend === 'down' ? '下降' : '稳定'}
        </span>
      </div>

      {/* Model Breakdown */}
      {Object.keys(data.by_model).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">模型成本分布</h4>
          <div className="space-y-2">
            {Object.entries(data.by_model).map(([model, metrics]) => (
              <div key={model} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{model}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(metrics.cost_usd / data.total_cost_usd * 100) || 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 w-16 text-right">
                    ${metrics.cost_usd?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      {data.by_day.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">每日成本</h4>
          <div className="space-y-2">
            {data.by_day.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{day.date}</span>
                <span className="text-gray-900">${day.cost_usd?.toFixed(2) || '0.00'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostMetricsChart;
