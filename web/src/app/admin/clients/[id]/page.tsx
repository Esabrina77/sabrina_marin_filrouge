"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  User,
  Mail,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import UserService from '@/lib/api/users';
import OrderService from '@/lib/api/orders';
import { User as UserType } from '@/types/user';
import { Order, OrderStatus } from '@/types/order';

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

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  PENDING:   { label: 'En attente', className: 'badge badge-pending',   dot: '#EA580C' },
  READY:     { label: 'Prête',      className: 'badge badge-ready',     dot: '#2563EB' },
  COMPLETED: { label: 'Livrée',     className: 'badge badge-completed', dot: '#16A34A' },
  CANCELLED: { label: 'Annulée',    className: 'badge badge-cancelled', dot: '#DC2626' },
};

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
        const user = await UserService.getById(userId);
        setClient(user);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)' }}>
        Chargement des détails du client...
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Client introuvable.</p>
        <button className="btn-outline" onClick={() => router.back()}>Retour</button>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}
      >
        <button
          onClick={() => router.back()}
          className="btn-outline"
          style={{ width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Détails Client
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            Informations et historique des commandes.
          </p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24 }}>
        {/* ── Client Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="card"
          style={{ padding: 24, alignSelf: 'start' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 24 }}>
             <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
               {client.firstName.charAt(0)}{client.lastName.charAt(0)}
             </div>
             <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
               {client.firstName} {client.lastName}
             </h2>
             <span style={{ marginTop: 8, padding: '4px 10px', background: 'var(--bg-surface)', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
               {client.role}
             </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24, paddingBottom: 24, borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={14} color="var(--text-secondary)" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{client.email}</p>
                </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="var(--text-secondary)" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Client</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{client.id.split('-')[0]}</p>
                </div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 24 }}>
             <div style={{ padding: 12, background: 'rgba(255,107,0,0.08)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Commandes</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{orders.length}</p>
             </div>
             <div style={{ padding: 12, background: 'rgba(22,163,74,0.08)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#16A34A' }}>{formatCurrency(totalSpent)}</p>
             </div>
          </div>
        </motion.div>

        {/* ── Orders History ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="card"
          style={{ overflow: 'hidden', alignSelf: 'start' }}
        >
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
             <ShoppingBag size={18} color="var(--accent)" />
             <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Historique des commandes</h3>
          </div>
          
          {orders.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
               <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Aucune commande pour le moment.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ background: 'var(--bg-surface)' }}>
                   {['Référence', 'Date', 'Statut', 'Total'].map((h, i) => (
                     <th key={h} style={{ padding: '12px 24px', textAlign: i === 3 ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                       {h}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                  {orders.map((order, i) => {
                     const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
                     return (
                       <motion.tr
                         key={order.id}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 0.1 + i * 0.03 }}
                         style={{ borderTop: '1px solid var(--border-subtle)' }}
                         className="table-row-hover"
                       >
                          <td style={{ padding: '14px 24px', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                             #{order.orderReference}
                          </td>
                          <td style={{ padding: '14px 24px' }}>
                             <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(order.createdAt)}</div>
                             <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{formatTime(order.createdAt)}</div>
                          </td>
                          <td style={{ padding: '14px 24px' }}>
                             <span className={sc.className}>
                               <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                               {sc.label}
                             </span>
                          </td>
                          <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                             {formatCurrency(order.total)}
                          </td>
                       </motion.tr>
                     );
                  })}
               </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}
