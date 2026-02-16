"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Calendar,
  User,
  MoreVertical,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import OrderService from '@/lib/api/orders';
import { Order, OrderStatus, OrderFilters } from '@/types/order';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch all orders for client-side filtering
      const response = await OrderService.getAll({
        size: 1000,
        sort: 'createdAt,desc'
      });
      setAllOrders(response.content);
      setFilteredOrders(response.content);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = allOrders;

    // 1. Filter by Status
    if (currentStatus !== 'ALL') {
      result = result.filter(order => order.status === currentStatus);
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.orderReference.toLowerCase().includes(query) ||
        order.userFirstName?.toLowerCase().includes(query) ||
        order.userLastName?.toLowerCase().includes(query) ||
        order.userEmail?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(result);
    setCurrentPage(0); // Reset to first page
  }, [allOrders, currentStatus, searchQuery]);

  // Pagination Logic
  useEffect(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedOrders(filteredOrders.slice(start, end));
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle Status Update
  const handleStatusUpdate = async (id: string, newStatus: OrderStatus) => {
    try {
      await OrderService.updateStatus(id, newStatus);
      // Update local state without refetching everything for speed
      setAllOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      
      if (selectedOrder && selectedOrder.id === id) {
         setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  // Status Badge Logic
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-bold uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> En attente</span>;
      case OrderStatus.READY:
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Prêt</span>;
      case OrderStatus.COMPLETED:
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Terminé</span>;
      case OrderStatus.CANCELLED:
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase flex items-center gap-1"><XCircle className="h-3 w-3" /> Annulé</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-sm text-gray-500">Suivez et gérez les commandes clients en temps réel.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Rechercher une commande, un client..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-500 text-gray-900 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={currentStatus === 'ALL' ? 'primary' : 'ghost'} 
          onClick={() => setCurrentStatus('ALL')}
          className="rounded-full px-4 h-9 text-xs"
        >
          Toutes
        </Button>
        {Object.values(OrderStatus).map((status) => (
          <Button 
            key={status}
            variant={currentStatus === status ? 'primary' : 'ghost'} 
            onClick={() => setCurrentStatus(status)}
            className="rounded-full px-4 h-9 text-xs"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
             <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-gray-500" />
             </div>
             <p className="text-gray-500 font-medium">Aucune commande trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-600 font-bold border-b border-gray-200">
                  <th className="px-6 py-4">Référence</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 w-[1%] whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right w-[1%] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {order.orderReference}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                          {order.userFirstName?.[0]}{order.userLastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.userFirstName} {order.userLastName}</p>
                          <p className="text-xs text-gray-500">{order.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {order.total?.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Button className="h-8 w-8 p-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsModalOpen(true); }}>
                         <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Affichage de {displayedOrders.length} sur {filteredOrders.length} commandes
            </p>
            <div className="flex gap-2">
               <Button 
                variant="outline" 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Précédent
              </Button>
              <Button 
                variant="outline" 
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                className="h-8 px-3 text-xs"
              >
                Suivant <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Commande ${selectedOrder?.orderReference}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
               <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-medium">Statut actuel:</span>
                  {getStatusBadge(selectedOrder.status)}
               </div>
               
               {/* Quick Actions */}
               <div className="flex gap-2">
                  {selectedOrder.status === OrderStatus.PENDING && (
                    <Button onClick={() => handleStatusUpdate(selectedOrder.id, OrderStatus.READY)} className="bg-blue-600 hover:bg-blue-700 h-8 text-xs px-3">
                       Marquer comme Prêt
                    </Button>
                  )}
                  {selectedOrder.status === OrderStatus.READY && (
                    <Button onClick={() => handleStatusUpdate(selectedOrder.id, OrderStatus.COMPLETED)} className="bg-green-600 hover:bg-green-700 h-8 text-xs px-3">
                       Terminer la commande
                    </Button>
                  )}
                  {(selectedOrder.status === OrderStatus.PENDING || selectedOrder.status === OrderStatus.READY) && (
                    <Button variant="outline" onClick={() => handleStatusUpdate(selectedOrder.id, OrderStatus.CANCELLED)} className="text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs px-3">
                       Annuler
                    </Button>
                  )}
               </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 border border-gray-100 rounded-xl space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                     <User className="h-4 w-4 text-amber-500" /> Client
                  </h4>
                  <p className="text-sm text-gray-600">{selectedOrder.userFirstName} {selectedOrder.userLastName}</p>
                  <p className="text-xs text-gray-400">{selectedOrder.userEmail}</p>
               </div>
               <div className="p-4 border border-gray-100 rounded-xl space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                     <Calendar className="h-4 w-4 text-amber-500" /> Date
                  </h4>
                  <p className="text-sm text-gray-600">{format(new Date(selectedOrder.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                  <p className="text-xs text-gray-400">{format(new Date(selectedOrder.createdAt), 'HH:mm', { locale: fr })}</p>
               </div>
            </div>

            {/* Items List */}
            <div>
               <h4 className="text-sm font-bold text-gray-900 mb-3">Détails de la commande</h4>
               <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-left">
                     <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                           <th className="px-4 py-3">Produit</th>
                           <th className="px-4 py-3 text-center">Qté</th>
                           <th className="px-4 py-3 text-right">Prix Unit.</th>
                           <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                           <tr key={item.id}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                              <td className="px-4 py-3 text-sm text-center text-gray-600">x{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-600">{item.priceAtReservation.toFixed(2)}€</td>
                              <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{(item.priceAtReservation * item.quantity).toFixed(2)}€</td>
                           </tr>
                        ))}
                     </tbody>
                     <tfoot className="bg-white border-t border-gray-200">
                        <tr>
                           <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total Commande</td>
                           <td className="px-4 py-3 text-right text-lg font-black text-amber-600">{selectedOrder.total.toFixed(2)}€</td>
                        </tr>
                     </tfoot>
                  </table>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
