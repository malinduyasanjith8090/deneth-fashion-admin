import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, action, ...props }) => {
  return (
    <div className={cn("bg-surface rounded-lg border border-slate-700/50 shadow-sm overflow-hidden", className)} {...props}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};