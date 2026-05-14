import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SystemStatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: 'running' | 'normal' | 'warning' | 'error';
}

const statusStyles = {
  running: 'bg-green-50 text-green-700 border-green-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ title, value, icon, status }) => {
  return (
    <div className={`card ${statusStyles[status]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-60">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCard;
