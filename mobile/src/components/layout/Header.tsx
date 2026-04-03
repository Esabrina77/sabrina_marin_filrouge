import React from 'react';
import { Bell, ShoppingCart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-50 safe-area-top shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-fika-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fika</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-fika-primary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-fika-primary transition-colors">
          <ShoppingCart size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
