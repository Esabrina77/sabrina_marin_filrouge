"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Coffee as CoffeeIcon, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AuthService from '@/lib/api/auth';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/admin/dashboard' },
  { icon: ShoppingBag, label: 'Commandes', href: '/admin/orders' },
  { icon: CoffeeIcon, label: 'Produits', href: '/admin/products' },
  { icon: Users, label: 'Clients', href: '/admin/customers' },
  { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/5 z-50 flex flex-col">
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/40">
          <CoffeeIcon className="text-white h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Fika Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-amber-600/10 text-amber-500 border border-amber-600/20" 
                    : "text-stone-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5", isActive ? "text-amber-500" : "text-stone-500 group-hover:text-amber-500")} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <button 
          onClick={() => AuthService.logout()}
          className="flex items-center gap-3 px-4 py-3 w-full text-stone-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all group"
        >
          <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
