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
  ChevronRight,
  Package
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
  { icon: Package, label: 'Produits', href: '/admin/products' },
  { icon: Users, label: 'Clients', href: '/admin/clients' },
  { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 z-50 flex flex-col">
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-2">
        <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <CoffeeIcon className="text-white h-5 w-5" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          Fika<span className="text-amber-500">Admin</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-amber-500")} />
                <span className="font-semibold text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Info Card Footer */}
      <div className="p-6">
        <div className="bg-gray-900 p-5 rounded-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white font-bold text-xs mb-1">Portail Gestion</p>
            <p className="text-gray-400 text-[10px] leading-relaxed">
                Connecté en tant que Manager.<br/>Accès total au catalogue.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-white/5 rounded-full" />
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={() => AuthService.logout()}
          className="flex items-center gap-4 px-6 py-3 w-full text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group cursor-pointer"
        >
          <LogOut className="h-5 w-5 group-hover:rotate-6 transition-transform" />
          <span className="font-semibold text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
