"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import UserService from '@/lib/api/users';
import OrderService from '@/lib/api/orders';
import { User, Role } from '@/types/user';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

interface ClientWithStats extends User {
  orderCount: number;
  totalSpent: number;
}

type SortOption = 'name-asc' | 'name-desc' | 'orders-desc' | 'orders-asc';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersResponse = await UserService.getAll({ size: 1000 });
      const ordersResponse = await OrderService.getAll({ size: 1000 });
      const clientUsers = usersResponse.content.filter(u => u.role === Role.CLIENT);

      const clientsWithStats = clientUsers.map(client => {
        const clientOrders = ordersResponse.content.filter(o => o.userEmail === client.email);
        const orderCount = clientOrders.length;
        const totalSpent = clientOrders.reduce((acc, order) => acc + order.total, 0);
        return { ...client, orderCount, totalSpent };
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

  const filteredAndSortedClients = React.useMemo(() => {
    let result = [...clients];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
        case 'name-desc': return b.lastName.localeCompare(a.lastName) || b.firstName.localeCompare(a.firstName);
        case 'orders-desc': return b.orderCount - a.orderCount;
        case 'orders-asc': return a.orderCount - b.orderCount;
        default: return 0;
      }
    });
    return result;
  }, [clients, sortBy, searchQuery]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* ── Top Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="top-bar-admin"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div className="top-bar-title">
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Clients
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            {clients.length} clients enregistrés.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="search-container" style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Rechercher un client..."
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
        </div>
      </motion.div>

      {/* ── Tabs (Sorting) ── */}
      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="filter-container"
      >
        {[
          { id: 'name-asc', label: 'Nom (A-Z)' },
          { id: 'name-desc', label: 'Nom (Z-A)' },
          { id: 'orders-desc', label: 'Meilleurs Clients' },
          { id: 'orders-asc', label: 'Moins de Commandes' }
        ].map((sortOption) => {
          const isActive = sortBy === sortOption.id;
          return (
            <button
              key={sortOption.id}
              onClick={() => setSortBy(sortOption.id as SortOption)}
              className={`filter-btn ${isActive ? 'active' : ''}`}
            >
              {sortOption.label}
            </button>
          );
        })}
      </motion.nav>

      {/* ── Table Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="card"
        style={{ overflow: 'hidden' }}
      >
        <div className="desktop-only">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Client', 'Email', 'Commandes', 'Total Dépensé', 'Actions'].map((h, index) => (
                  <th key={h} style={{ padding: '12px 22px', textAlign: index === 2 || index === 3 ? 'center' : (index === 4 ? 'right' : 'left'), fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
                    Chargement...
                  </td>
                </tr>
              ) : filteredAndSortedClients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: 16, background: 'var(--bg-surface)', borderRadius: '50%', marginBottom: 12 }}>
                      <Users size={24} color="var(--text-tertiary)" />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Aucun client</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedClients.map((client, i) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row-hover"
                    style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                  >
                    <td style={{ padding: '14px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {client.firstName} {client.lastName}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>ID: {client.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 22px' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{client.email}</span>
                    </td>
                    <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        background: client.orderCount > 5 ? 'rgba(255,107,0,0.1)' : 'var(--bg-surface)',
                        color: client.orderCount > 5 ? 'var(--accent)' : 'var(--text-secondary)',
                        padding: '4px 10px', borderRadius: 999
                      }}>
                        {client.orderCount}
                      </span>
                    </td>
                    <td style={{ padding: '14px 22px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(client.totalSpent)}
                    </td>
                    <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                      <Link href={`/admin/clients/${client.id}`} style={{ textDecoration: 'none' }}>
                        <button
                          className="btn-outline"
                          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12 }}
                        >
                          <Eye size={14} /> Détails
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-only" style={{ paddingBottom: 16, marginTop: 12 }}>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>Chargement...</div>
          ) : filteredAndSortedClients.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
               <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Aucun client</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 12px' }}>
              {filteredAndSortedClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                  style={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                      {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.firstName} {client.lastName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                           <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commandes</p>
                           <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{client.orderCount}</p>
                        </div>
                        <div>
                           <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dépensé</p>
                           <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(client.totalSpent)}</p>
                        </div>
                     </div>
                     <Link href={`/admin/clients/${client.id}`}>
                        <button className="btn-outline" style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12 }}>Détails</button>
                     </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

         {/* ── Pagination / Footer Note ── */}
        {!loading && filteredAndSortedClients.length > 0 && (
          <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-base)', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Affichage de {filteredAndSortedClients.length} clients
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
