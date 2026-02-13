"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Clock,
  ChevronRight,
  MoreVertical,
  Activity
} from 'lucide-react';

const stats = [
  { label: 'Revenu Total', value: '4,560.00 €', trend: '+12%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Commandes', value: '124', trend: '+5%', icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Nouveaux Clients', value: '18', trend: '+22%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Articles en Rupture', value: '3', trend: '-2', icon: Package, color: 'text-red-500', bg: 'bg-red-50' },
];

const topSelling = [
  { name: 'Espresso Fika', orders: '156', revenue: '312.00€', rating: '5.0', image: 'https://images.unsplash.com/photo-1510707513152-3d606fd22164?w=200&h=200&fit=crop' },
  { name: 'Croissant Beurre', orders: '98', revenue: '245.00€', rating: '4.8', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop' },
  { name: 'Salmon Bagel', orders: '76', revenue: '684.00€', rating: '4.9', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&h=200&fit=crop' },
];

const liveOrders = [
  { id: '#ORD-001', customer: 'Alice Martin', total: '12.50€', status: 'En préparation', time: '2 min ago' },
  { id: '#ORD-002', customer: 'Robert Durand', total: '8.40€', status: 'En attente', time: '5 min ago' },
  { id: '#ORD-003', customer: 'Julie Leroy', total: '24.90€', status: 'Prêt', time: '10 min ago' },
];

export default function DashboardPage() {
  return (
    <div className="flex gap-8">
      {/* Left Column: Manager Overview */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Gestion</h1>
            <p className="text-sm text-gray-500">Supervision de l'activité en temps réel</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher une commande, un client..."
              className="w-full bg-white border-transparent focus:border-amber-500 rounded-2xl py-3 pl-12 pr-4 text-sm card-shadow focus:ring-0 transition-all font-medium"
            />
          </div>
        </div>

        {/* Operational Stats */}
        <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-50 group transition-all hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                            {stat.trend} <ArrowUpRight className="h-3 w-3" />
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <h3 className="text-xl font-black text-gray-900">{stat.value}</h3>
                </div>
            ))}
        </div>

        {/* Section: Best Sellers (Performance) */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Produits les plus vendus</h2>
                <button className="text-amber-500 text-sm font-bold flex items-center gap-1 group">
                    Historique complet <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
                {topSelling.map((item, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-4 rounded-[2rem] card-shadow space-y-4 relative">
                        <div className="h-32 w-full rounded-2xl overflow-hidden bg-gray-50">
                            <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <div className="flex items-center justify-between mt-2">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400">COMMANDES</p>
                                    <p className="font-black text-sm">{item.orders}</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400">REVENU</p>
                                    <p className="font-black text-sm text-amber-500">{item.revenue}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Section: Real-time Kitchen Load / Orders Queue */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">File d'attente des commandes</h2>
            <div className="bg-white rounded-[2rem] card-shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Attente</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {liveOrders.map((order, i) => (
                            <tr key={i} className="text-sm hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                                <td className="px-6 py-4 font-semibold text-gray-600">{order.customer}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight
                                        ${order.status === 'Prêt' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-black">{order.total}</td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> {order.time}
                                </td>
                                <td className="px-6 py-4">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Right Column: Key Metrics & Quick Controls */}
      <div className="w-80 space-y-8">
        {/* Daily Summary Card */}
        <div className="bg-white p-6 rounded-[2rem] card-shadow space-y-6">
            <h2 className="text-lg font-bold">Résumé Journalier</h2>
            <div className="bg-orange-gradient p-6 rounded-3xl space-y-4 shadow-xl shadow-amber-100 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">C.A du jour</p>
                        <p className="text-white text-2xl font-black">1,245.80€</p>
                    </div>
                </div>
                <div className="relative z-10 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        className="h-full bg-white rounded-full" 
                    />
                </div>
                <p className="relative z-10 text-white/80 text-[10px] font-bold">Objectif quotidien : 75% atteint</p>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="space-y-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Ventes sur site</span>
                    </div>
                    <span className="text-gray-900">845€</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Ventes en ligne</span>
                    </div>
                    <span className="text-gray-900">400€</span>
                </div>
            </div>
        </div>

        {/* Quick Management Actions */}
        <div className="bg-white p-6 rounded-[2rem] card-shadow space-y-6">
            <h2 className="text-lg font-bold">Actions de Gestion</h2>
            <div className="grid gap-3">
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 transition-colors group">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500 group-hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-gray-700">Ajouter un produit</span>
                </button>
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                        <Activity className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-gray-700">Gérer l'inventaire</span>
                </button>
            </div>
            <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-[1.5rem] hover:bg-gray-800 transition-colors mt-4">
                Imprimer le rapport
            </button>
        </div>
      </div>
    </div>
  );
}
