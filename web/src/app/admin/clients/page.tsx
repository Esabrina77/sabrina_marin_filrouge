"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UserService from '@/lib/api/users';
import OrderService from '@/lib/api/orders';
import { User, Role } from '@/types/user';
import { Order } from '@/types/order';

interface ClientWithStats extends User {
  orderCount: number;
  totalSpent: number; // Optional: Total spent could be interesting too
}

type SortOption = 'name-asc' | 'name-desc' | 'orders-desc' | 'orders-asc';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users (Large page size to get all relevant users)
      // Note: In a real app with 10k+ users, this should be server-side.
      // Given constraints (no backend mods + fil rouge), we fetch a large batch.
      const usersResponse = await UserService.getAll({ size: 1000 }); 
      
      // 2. Fetch Orders (Large page size to aggregate stats)
      const ordersResponse = await OrderService.getAll({ size: 1000 });

      // 3. Filter for CLIENTS only
      const clientUsers = usersResponse.content.filter(u => u.role === Role.CLIENT);

      // 4. Map Orders to Clients (via Email since ID is missing in OrderResponse)
      const clientsWithStats = clientUsers.map(client => {
        const clientOrders = ordersResponse.content.filter(o => o.userEmail === client.email);
        const orderCount = clientOrders.length;
        const totalSpent = clientOrders.reduce((acc, order) => acc + order.total, 0);

        return {
          ...client,
          orderCount,
          totalSpent
        };
      });

      setClients(clientsWithStats);
    } catch (error) {
      console.error('Failed to fetch clients data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedClients = React.useMemo(() => {
    let result = [...clients];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.firstName.toLowerCase().includes(q) || 
        c.lastName.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
        case 'name-desc':
          return b.lastName.localeCompare(a.lastName) || b.firstName.localeCompare(a.firstName);
        case 'orders-desc':
          return b.orderCount - a.orderCount; // Most orders first
        case 'orders-asc':
          return a.orderCount - b.orderCount;
        default:
          return 0;
      }
    });

    return result;
  }, [clients, sortBy, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">
            {clients.length} clients enregistrés.
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <select 
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
            <option value="orders-desc">⭐ Meilleur client (Commandes max)</option>
            <option value="orders-asc">Commandes min</option>
          </select>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement des données clients...</div>
        ) : filteredAndSortedClients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
             <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-400" />
             </div>
             <p className="text-gray-500 font-medium">Aucun client trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Commandes</th>
                  <th className="px-6 py-4 text-center">Total Dépensé</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAndSortedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{client.firstName} {client.lastName}</p>
                          <p className="text-xs text-gray-400">ID: {client.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.orderCount > 5 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {client.totalSpent.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/clients/${client.id}`} passHref>
                        <Button variant="ghost" className="h-8 gap-2 hover:text-blue-600 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                          Détails
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Simple Footer/Pagination Note */}
        {!loading && filteredAndSortedClients.length > 0 && (
           <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 text-center">
             Affichage de {filteredAndSortedClients.length} clients.
           </div>
        )}
      </div>
    </div>
  );
}
