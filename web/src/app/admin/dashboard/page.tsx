"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { 
    label: 'Chiffre d\'affaires', 
    value: '12,845 €', 
    trend: '+12.5%', 
    isPositive: true, 
    icon: DollarSign, 
    color: 'bg-green-500/10 text-green-500' 
  },
  { 
    label: 'Commandes', 
    value: '156', 
    trend: '+8.2%', 
    isPositive: true, 
    icon: ShoppingBag, 
    color: 'bg-amber-500/10 text-amber-500' 
  },
  { 
    label: 'Nouveaux Clients', 
    value: '42', 
    trend: '-3.1%', 
    isPositive: false, 
    icon: Users, 
    color: 'bg-blue-500/10 text-blue-500' 
  },
  { 
    label: 'Taux de Conversion', 
    value: '3.2%', 
    trend: '+2.4%', 
    isPositive: true, 
    icon: TrendingUp, 
    color: 'bg-purple-500/10 text-purple-500' 
  },
];

const recentOrders = [
  { id: '#ORD-7241', customer: 'Jean Dupont', product: 'Espresso + Croissant', status: 'Terminé', amount: '8.50€', time: 'Il y a 5 min' },
  { id: '#ORD-7240', customer: 'Marie Larue', product: 'Cappuccino XL', status: 'En préparation', amount: '4.80€', time: 'Il y a 12 min' },
  { id: '#ORD-7239', customer: 'Thomas Petit', product: 'Latte Machiatto', status: 'En attente', amount: '5.20€', time: 'Il y a 18 min' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, Admin 👋</h1>
          <p className="text-stone-500 text-sm mt-1">Voici ce qui se passe dans votre établissement aujourd'hui.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" className="h-10 text-xs">Aujourd'hui</Button>
          <Button className="h-10 text-xs">Exporter le rapport</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={stat.color + " p-3 rounded-xl"}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className={stat.isPositive ? "text-green-500" : "text-red-500" + " flex items-center text-xs font-bold"}>
                {stat.trend}
                {stat.isPositive ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
              </div>
            </div>
            <div>
              <p className="text-stone-500 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
            {/* Hover Decor */}
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Orders & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass rounded-2xl border-white/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white tracking-tight">Dernières Commandes</h2>
            <Button variant="ghost" className="h-8 text-xs underline decoration-amber-600/50">Voir tout</Button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-stone-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Commande</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-white font-medium">{order.id}</td>
                    <td className="px-6 py-4 text-stone-400">{order.customer}</td>
                    <td className="px-6 py-4 text-stone-400">{order.product}</td>
                    <td className="px-6 py-4 text-white font-bold">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={
                        order.status === 'Terminé' ? "text-green-500 bg-green-500/10 px-2 py-1 rounded-md text-[10px] font-bold" :
                        order.status === 'En préparation' ? "text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md text-[10px] font-bold" :
                        "text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md text-[10px] font-bold"
                      }>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="glass rounded-2xl border-white/5 flex flex-col">
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="text-lg font-bold text-white tracking-tight">Activité en direct</h2>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {recentOrders.map((order, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== recentOrders.length - 1 && <div className="absolute left-[11px] top-7 bottom-0 w-px bg-white/5" />}
                <div className="h-6 w-6 rounded-full bg-amber-600/20 border border-amber-600/30 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Nouvelle commande {order.id}</p>
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-amber-600/5 mt-auto">
             <Button variant="ghost" className="w-full text-xs text-amber-500 hover:text-amber-400">
               Consulter tout l'historique
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
