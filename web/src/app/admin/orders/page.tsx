"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import OrderService from '@/lib/api/orders';
import { Order, OrderStatus } from '@/types/order';
import { useSearchParams } from 'next/navigation';
import { OrderDetailsContent } from '@/components/admin/OrderDetailsContent';

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  PENDING:   { label: 'En attente', className: 'badge badge-pending',   dot: '#EA580C' },
  READY:     { label: 'Prête',      className: 'badge badge-ready',     dot: '#2563EB' },
  COMPLETED: { label: 'Livrée',     className: 'badge badge-completed', dot: '#16A34A' },
  CANCELLED: { label: 'Annulée',    className: 'badge badge-cancelled', dot: '#DC2626' },
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrderService.getAll({
        page: currentPage,
        size: 20,
        sort: 'createdAt,desc',
        status: currentStatus === 'ALL' ? undefined : (currentStatus as OrderStatus),
        reference: searchTerm || undefined
      });
      setOrders(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchQuery);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, currentStatus, searchTerm]);

  useEffect(() => {
    if (refParam) {
      setSearchQuery(refParam);
      const loadSpecific = async () => {
        try {
          const response = await OrderService.getAll({ reference: refParam, size: 1 });
          if (response.content.length > 0) {
            setSelectedOrder(response.content[0]);
            setIsModalOpen(true);
          }
        } catch (e) {
          console.error("Failed to load order from URL", e);
        }
      };
      loadSpecific();
    }
  }, [refParam]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="top-bar-admin"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Commandes
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            Gestion et suivi des commandes en temps réel.
          </p>
        </div>

        <div className="search-container" style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Référence, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: 260, padding: '9px 12px 9px 36px',
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 12, fontSize: 13, color: 'var(--text-primary)',
              outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </motion.div>

      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="filter-container"
      >
        <button
          onClick={() => setCurrentStatus('ALL')}
          className={`filter-btn ${currentStatus === 'ALL' ? 'active' : ''}`}
        >
          Toutes
        </button>
        {Object.values(OrderStatus).map((status) => {
          const isActive = currentStatus === status;
          const cfg = STATUS_CONFIG[status] || { label: status, dot: '#9CA3AF' };
          return (
            <button
              key={status}
              onClick={() => {
                setCurrentStatus(status);
                setCurrentPage(0);
              }}
              className={`filter-btn ${isActive ? 'active' : ''}`}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#fff' : cfg.dot }} />
              {cfg.label}
            </button>
          );
        })}
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="card"
        style={{ overflow: 'hidden' }}
      >
        <div className="desktop-only">
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Référence', 'Client', 'Date', 'Statut', 'Total', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 22px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
                    Chargement...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: 16, background: 'var(--bg-surface)', borderRadius: '50%', marginBottom: 12 }}>
                      <ShoppingBag size={24} color="var(--text-tertiary)" />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Aucune commande</p>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Essayez de modifier vos filtres.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => {
                  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="table-row-hover"
                      style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s', cursor: 'pointer' }}
                      onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                    >
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          #{order.orderReference}
                        </span>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {order.userFirstName?.charAt(0)}{order.userLastName?.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                              {order.userFirstName} {order.userLastName}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{order.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {formatDate(order.createdAt)}
                          <br />
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{formatTime(order.createdAt)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <span className={sc.className}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                        <button
                          className="btn-outline"
                          style={{ padding: '6px', borderRadius: 8 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsModalOpen(true); }}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-only" style={{ paddingBottom: 16, marginTop: 12 }}>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>Chargement...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
               <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Aucune commande</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 12px' }}>
              {orders.map((order, i) => {
                const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{ padding: 16 }}
                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        #{order.orderReference}
                      </span>
                      <span className={sc.className}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {order.userFirstName} {order.userLastName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                          {formatDate(order.createdAt)} à {formatTime(order.createdAt)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Affichage de {orders.length} sur {totalElements}
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn-outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                style={{ padding: '6px 12px', opacity: currentPage === 0 ? 0.5 : 1, cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} /> Précédent
              </button>
              <button
                className="btn-outline"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                style={{ padding: '6px 12px', opacity: currentPage >= totalPages - 1 ? 0.5 : 1, cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
              >
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedOrder ? `Commande #${selectedOrder.orderReference}` : 'Détails'}
        size="lg"
      >
        {selectedOrder && (
          <OrderDetailsContent 
            order={selectedOrder} 
            onStatusUpdate={(id, newStatus) => {
              setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
              setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }} 
          />
        )}
      </Modal>
    </div>
  );
}
