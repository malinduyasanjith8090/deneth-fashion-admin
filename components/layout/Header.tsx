import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-slate-800 h-16 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-background border border-slate-700 text-sm rounded-full pl-10 pr-4 py-2 w-64 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-slate-400">Super Admin</p>
          </div>
          <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};