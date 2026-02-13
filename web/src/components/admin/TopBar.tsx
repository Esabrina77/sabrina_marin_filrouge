"use client";

import React from 'react';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import AuthService from '@/lib/api/auth';

export const TopBar = () => {
  const user = AuthService.getCurrentUser();

  return (
    <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="relative w-96 max-w-lg hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
        <input 
          type="text" 
          placeholder="Rechercher une commande, un produit..."
          className="w-full bg-stone-900/50 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-white placeholder:text-stone-600"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-stone-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-600 rounded-full border-2 border-background" />
        </button>

        <div className="h-8 w-px bg-white/5 mx-2" />

        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none mb-1">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-stone-500 font-medium tracking-tight uppercase">Administrateur</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-amber-600/50 transition-colors">
             <UserIcon className="h-6 w-6 text-stone-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
