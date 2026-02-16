"use client";

import React, { useState, useEffect } from 'react';
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
  Activity,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import OrderService from '@/lib/api/orders';
import ProductService from '@/lib/api/products';
import UserService from '@/lib/api/users';
import { Order, OrderStatus } from '@/types/order';
import { Product } from '@/types/product';
import { User, Role } from '@/types/user';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  // State for Dashboard Data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalClients: 0,
    outOfStockItems: 0
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch All Data (Parallel)
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          OrderService.getAll({ size: 1000, sort: 'createdAt,desc' }), // Get latest orders
          ProductService.getAll({ size: 1000 }),
          UserService.getAll({ size: 1000 })
        ]);

        const orders = ordersRes.content;
        const products = productsRes.content;
        const users = usersRes.content;

        // 2. Calculate Stats
        const totalRevenue = orders
          .filter(o => o.status !== OrderStatus.CANCELLED)
          .reduce((acc, order) => acc + order.total, 0);
        
        const totalOrders = orders.length;
        const totalClients = users.filter(u => u.role === Role.CLIENT).length;
        const outOfStock = products.filter(p => p.quantity <= 0);

        setStats({
          totalRevenue,
          totalOrders,
          totalClients,
          outOfStockItems: outOfStock.length
        });

        // 3. Process Recent Orders
        setRecentOrders(orders.slice(0, 5)); // First 5 orders

        // 4. Process Top Selling Products (Aggregation)
        const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
        
        orders.forEach(order => {
          if (order.status !== OrderStatus.CANCELLED) {
            order.items.forEach(item => {
              if (!productSales[item.productName]) {
                productSales[item.productName] = { 
                  name: item.productName, 
                  quantity: 0, 
                  revenue: 0 
                };
              }
              productSales[item.productName].quantity += item.quantity;
              productSales[item.productName].revenue += (item.priceAtReservation * item.quantity);
            });
          }
        });

        const sortedTopSelling = Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 3);

        setTopSelling(sortedTopSelling);
        setOutOfStockProducts(outOfStock.slice(0, 5)); // Show up to 5 out of stock items

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Revenu Total', value: `${stats.totalRevenue.toFixed(2)} €`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Commandes', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Clients', value: stats.totalClients.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Rupture de Stock', value: stats.outOfStockItems.toString(), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  if (loading) {
     return <div className="p-12 text-center text-gray-500">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="flex gap-8">
      {/* Left Column: Manager Overview */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
            <p className="text-sm text-gray-500">Aperçu en temps réel de votre activité.</p>
          </div>
        </div>

        {/* Operational Stats */}
        <div className="grid grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-50 group transition-all hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <h3 className="text-xl font-black text-gray-900">{stat.value}</h3>
                </div>
            ))}
        </div>

        {/* Section: Best Sellers */}
        {topSelling.length > 0 && (
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Meilleures Ventes</h2>
              </div>
              <div className="grid grid-cols-3 gap-6">
                  {topSelling.map((item, i) => (
                      <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-4 rounded-[2rem] card-shadow space-y-4 relative border border-gray-50">
                          <div>
                              <h3 className="font-bold text-gray-900">{item.name}</h3>
                              <div className="flex items-center justify-between mt-2">
                                  <div className="space-y-0.5">
                                      <p className="text-[10px] font-bold text-gray-400">VENTES</p>
                                      <p className="font-black text-sm">{item.quantity}</p>
                                  </div>
                                  <div className="text-right space-y-0.5">
                                      <p className="text-[10px] font-bold text-gray-400">REVENU</p>
                                      <p className="font-black text-sm text-amber-500">{item.revenue.toFixed(2)}€</p>
                                  </div>
                              </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
        )}

        {/* Section: Recent Orders */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Dernières Commandes</h2>
            <div className="bg-white rounded-[2rem] card-shadow overflow-hidden border border-gray-50">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Réf</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">#{order.orderReference}</td>
                                <td className="px-6 py-4 font-semibold text-gray-600">{order.userFirstName} {order.userLastName}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight
                                        ${order.status === 'READY' ? 'bg-blue-100 text-blue-600' : 
                                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 
                                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                          'bg-amber-100 text-amber-600'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-black">{order.total.toFixed(2)}€</td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end">
               <Link href="/admin/orders" className="text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
                 Voir toutes les commandes <ArrowUpRight className="h-4 w-4" />
               </Link>
            </div>
        </div>
      </div>

      {/* Right Column: Key Metrics & Quick Controls */}
      <div className="w-80 space-y-8">
        {/* Alerts: Out of Stock */}
        {outOfStockProducts.length > 0 && (
          <div className="bg-white p-6 rounded-[2rem] card-shadow space-y-4 border border-red-100">
             <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-lg font-bold">Attention Stock</h2>
             </div>
             <ul className="space-y-3">
                {outOfStockProducts.map(product => (
                  <li key={product.id} className="flex items-center justify-between text-sm">
                     <span className="font-semibold text-gray-700 truncate max-w-[150px]">{product.name}</span>
                     <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">0</span>
                  </li>
                ))}
             </ul>
             <Link href="/admin/products" className="block text-center text-xs font-bold text-gray-400 hover:text-gray-600 mt-2">
                Gérer l'inventaire
             </Link>
          </div>
        )}

        {/* Quick Management Actions */}
        <div className="bg-white p-6 rounded-[2rem] card-shadow space-y-6">
            <h2 className="text-lg font-bold">Actions Rapides</h2>
            <div className="grid gap-3">
                <Link href="/admin/products" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 transition-colors group">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500 group-hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-gray-700">Nouveau Produit</span>
                </Link>
                <Link href="/admin/clients" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-gray-700">Gérer Clients</span>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
