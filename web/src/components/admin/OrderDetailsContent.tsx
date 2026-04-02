"use client";

import React from 'react';
import { ShoppingBag, User, Calendar, Clock } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import OrderService from '@/lib/api/orders';

interface OrderDetailsContentProps {
  order: Order;
  onStatusUpdate?: (id: string, newStatus: OrderStatus) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  PENDING: { label: 'En attente', className: 'badge badge-pending', dot: '#EA580C' },
  READY: { label: 'Prête', className: 'badge badge-ready', dot: '#2563EB' },
  COMPLETED: { label: 'Livrée', className: 'badge badge-completed', dot: '#16A34A' },
  CANCELLED: { label: 'Annulée', className: 'badge badge-cancelled', dot: '#DC2626' },
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

export const OrderDetailsContent = ({ order, onStatusUpdate }: OrderDetailsContentProps) => {
  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];

  const handleUpdate = async (newStatus: OrderStatus) => {
    try {
      await OrderService.updateStatus(order.id, newStatus);
      if (onStatusUpdate) {
        onStatusUpdate(order.id, newStatus);
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="modal-content-inner">
      {/* Status & Actions */}
      <div className="top-bar-admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>Statut</span>
          <span className={sc.className}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
            {sc.label}
          </span>
        </div>

        <div className="actions" style={{ display: 'flex', gap: 8 }}>
          {order.status === OrderStatus.PENDING && (
            <button onClick={() => handleUpdate(OrderStatus.READY)} className="btn-outline" style={{ borderColor: '#2563EB', color: '#2563EB', padding: '6px 14px' }}>
              Prête
            </button>
          )}
          {order.status === OrderStatus.READY && (
            <button onClick={() => handleUpdate(OrderStatus.COMPLETED)} className="btn-outline" style={{ borderColor: '#16A34A', color: '#16A34A', padding: '6px 14px' }}>
              Livrer
            </button>
          )}
          {(order.status === OrderStatus.PENDING || order.status === OrderStatus.READY) && (
            <button onClick={() => handleUpdate(OrderStatus.CANCELLED)} className="btn-outline" style={{ borderColor: '#DC2626', color: '#DC2626', padding: '6px 14px' }}>
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <User size={14} color="var(--text-tertiary)" /> Client
          </h4>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{order.userFirstName} {order.userLastName}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{order.userEmail}</p>
        </div>
        <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Calendar size={14} color="var(--text-tertiary)" /> Commande
          </h4>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(order.createdAt)}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{formatTime(order.createdAt)}</p>
        </div>
      </div>

      {/* Items */}
      <div>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Contenu de la commande</h4>

        {/* Desktop View */}
        <div className="desktop-only">
          <div className="table-container" style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-surface)' }}>
                <tr>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produit</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qté</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>P.U.</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.productName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>x{item.quantity}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>{formatCurrency(item.priceAtReservation)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>{formatCurrency(item.priceAtReservation * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
                <tr>
                  <td colSpan={3} style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Payé</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="mobile-only">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 12, background: 'var(--bg-card)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{item.productName}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.quantity} x {formatCurrency(item.priceAtReservation)}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(item.priceAtReservation * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
