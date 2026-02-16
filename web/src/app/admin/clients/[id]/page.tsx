"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  ShoppingBag, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserService from '@/lib/api/users';
import OrderService from '@/lib/api/orders';
import { User as UserType } from '@/types/user';
import { Order, OrderStatus } from '@/types/order';

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [client, setClient] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Client Details
        const user = await UserService.getById(userId);
        setClient(user);

        // 2. Fetch All Orders (to filter by email)
        // Since we can't filter by userId in backend, we match by email
        const allOrders = await OrderService.getAll({ size: 1000, sort: 'createdAt,desc' });
        const clientOrders = allOrders.content.filter(o => o.userEmail === user.email);
        setOrders(clientOrders);

      } catch (error) {
        console.error('Failed to fetch client details', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Chargement des détails du client...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-500">Client introuvable.</p>
        <Button variant="outline" onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case OrderStatus.READY: return 'bg-blue-100 text-blue-700';
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return <CheckCircle className="h-4 w-4" />;
      case OrderStatus.READY: return <Clock className="h-4 w-4" />;
      case OrderStatus.PENDING: return <AlertCircle className="h-4 w-4" />;
      case OrderStatus.CANCELLED: return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl border border-gray-200 hover:bg-white hover:border-amber-500 hover:text-amber-500 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Détails Client</h1>
          <p className="text-sm text-gray-500">Informations et historique des commandes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-24 w-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-3xl mb-4">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{client.firstName} {client.lastName}</h2>
              <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-full tracking-wider">
                {client.role}
              </span>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</p>
                  <p className="text-gray-900 font-medium truncate">{client.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">ID Client</p>
                  <p className="text-gray-900 font-medium truncate max-w-[200px]" title={client.id}>{client.id}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <p className="text-amber-600 text-xs font-bold uppercase mb-1">Commandes</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-green-600 text-xs font-bold uppercase mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSpent.toFixed(2)}€</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                Historique des commandes
              </h3>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Aucune commande passée par ce client.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                      <th className="px-6 py-4">Référence</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm font-bold text-gray-900">
                          #{order.orderReference}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {order.total.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* Note: This assumes /admin/orders has a way to view details, typically via modal or page. 
                              Since OrdersPage is modal-based or list-based, linking to it might not highlight the specific order.
                              However, for now, we just list them. Detailed view is usually on Orders page. 
                           */}
                           <span className="text-xs text-gray-400">ID: {order.id.slice(0,6)}...</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
