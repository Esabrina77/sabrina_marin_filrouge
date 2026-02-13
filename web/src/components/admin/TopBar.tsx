"use client";

import React from 'react';
import { Bell, Search, Settings, Grid } from 'lucide-react';
import AuthService from '@/lib/api/auth';

export const TopBar = () => {
  const user = AuthService.getCurrentUser();

  return (
    <header className="h-20 bg-transparent px-8 flex items-center justify-between">
      {/* Page Title - Not in TopBar for this design, but good to have some space */}
      <div className="flex-1" />

      {/* Actions Area */}
      <div className="flex items-center gap-6">
        {/* Notifications & Settings Icons */}
        <div className="flex items-center gap-4 text-gray-400">
           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <div className="bg-amber-500 p-1.5 rounded-lg">
                <Grid className="h-5 w-5 text-white" />
            </div>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-amber-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div className="h-10 w-10 rounded-xl bg-gray-100 overflow-hidden shadow-sm">
                 <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                    alt="User" 
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
      </div>
    </header>
  );
};
