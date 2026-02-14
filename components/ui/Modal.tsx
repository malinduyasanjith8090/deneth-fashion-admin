import React, { Fragment } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-black/75 transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        />

        <div className={`relative transform overflow-hidden rounded-lg bg-surface text-left shadow-xl transition-all sm:my-8 w-full ${sizes[size]} border border-slate-700`}>
          <div className="px-4 py-4 sm:px-6 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-md text-slate-400 hover:text-white focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-4 py-5 sm:p-6 text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};