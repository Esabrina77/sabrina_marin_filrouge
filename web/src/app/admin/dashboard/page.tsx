"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  ArrowUpRight,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import OrderService from '@/lib/api/orders';
import ProductService from '@/lib/api/products';
import UserService from '@/lib/api/users';
import { Order, OrderStatus } from '@/types/order';
import { Product } from '@/types/product';
import { User, Role } from '@/types/user';

/* ─── Helpers ────────────────────────────────────────────── */
function formatCurrency(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
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

/* ─── Sparkline SVG ──────────────────────────────────────── */
function Sparkline({ data, color = '#FF6B00' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const W = 80, H = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 4);
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `0,${H} ${polyline} ${W},${H}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── KPI Card ───────────────────────────────────────────── */
function KPICard({
  label, value, icon: Icon, iconColor, iconBg, trend, sparkData, delay = 0
}: {
  label: string; value: string; icon: any; iconColor: string; iconBg: string;
  trend?: { value: string; up: boolean }; sparkData?: number[]; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="card kpi-card"
      style={{ padding: '20px 22px', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38,
          background: iconBg, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} color={iconColor} strokeWidth={2.2} />
        </div>
        {sparkData && <Sparkline data={sparkData} />}
      </div>

      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </p>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            {trend.up
              ? <TrendingUp size={13} color="#16A34A" />
              : <TrendingDown size={13} color="#DC2626" />}
            <span style={{ fontSize: 12, fontWeight: 600, color: trend.up ? '#16A34A' : '#DC2626' }}>
              {trend.value}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>vs hier</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalClients: 0, outOfStockItems: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          OrderService.getAll({ size: 1000, sort: 'createdAt,desc' }),
          ProductService.getAll({ size: 1000 }),
          UserService.getAll({ size: 1000 }),
        ]);
        const orders = ordersRes.content;
        const products = productsRes.content;
        const users = usersRes.content;

        const totalRevenue = orders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((a, o) => a + o.total, 0);
        const outOfStock = products.filter((p: Product) => (p as any).quantity < 5);

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalClients: users.filter((u: User) => u.role === Role.CLIENT).length,
          outOfStockItems: outOfStock.length,
        });
        setRecentOrders(orders.slice(0, 8));
        setOutOfStockProducts(outOfStock.slice(0, 5));

        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        orders.forEach(order => {
          if (order.status !== OrderStatus.CANCELLED) {
            order.items.forEach((item: any) => {
              if (!productSales[item.productName]) {
                productSales[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
              }
              productSales[item.productName].quantity += item.quantity;
              productSales[item.productName].revenue += item.priceAtReservation * item.quantity;
            });
          }
        });
        setTopSelling(Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = recentOrders.filter(o =>
    search === '' ||
    o.orderReference.toLowerCase().includes(search.toLowerCase()) ||
    `${o.userFirstName} ${o.userLastName}`.toLowerCase().includes(search.toLowerCase())
  );

  /* Mock sparkline data */
  const revenueSpark = [40, 55, 48, 70, 62, 85, 78, 92, 88, stats.totalRevenue > 0 ? 100 : 60];
  const orderSpark   = [3, 5, 4, 8, 6, 10, 9, 12, 11, stats.totalOrders % 15 || 8];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, color: 'var(--text-tertiary)' }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Chargement du tableau de bord…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Top Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {greeting} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Référence, client…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: 220, padding: '9px 12px 9px 36px',
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 12, fontSize: 13, color: 'var(--text-primary)',
                outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* CTA */}
          <Link href="/admin/products">
            <button className="btn-primary">
              <Plus size={15} strokeWidth={2.5} />
              Nouveau produit
            </button>
          </Link>
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

        {/* ═══ LEFT COLUMN ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <KPICard
              label="Revenu total" value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign} iconColor="#FF6B00" iconBg="rgba(255,107,0,0.1)"
              trend={{ value: '+12.4%', up: true }} sparkData={revenueSpark} delay={0}
            />
            <KPICard
              label="Commandes" value={stats.totalOrders.toString()}
              icon={ShoppingBag} iconColor="#2563EB" iconBg="rgba(37,99,235,0.1)"
              trend={{ value: '+5.1%', up: true }} sparkData={orderSpark} delay={0.05}
            />
            <KPICard
              label="Clients" value={stats.totalClients.toString()}
              icon={Users} iconColor="#16A34A" iconBg="rgba(22,163,74,0.1)"
              trend={{ value: '+3.2%', up: true }} delay={0.1}
            />
            <KPICard
              label="Rupture stock" value={stats.outOfStockItems.toString()}
              icon={AlertTriangle} iconColor={stats.outOfStockItems > 0 ? '#DC2626' : '#9CA3AF'}
              iconBg={stats.outOfStockItems > 0 ? 'rgba(220,38,38,0.1)' : 'rgba(156,163,175,0.1)'}
              delay={0.15}
            />
          </div>

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.23,1,0.32,1] }}
            className="card"
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Dernières commandes</h2>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} affichée{filteredOrders.length > 1 ? 's' : ''}</p>
              </div>
              <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ fontSize: 12, padding: '6px 14px' }}>
                  Voir tout <ArrowUpRight size={13} />
                </button>
              </Link>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  {['Référence', 'Client', 'Date', 'Statut', 'Total'].map(h => (
                    <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, i) => {
                    const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 + i * 0.03 }}
                        className="table-row-hover"
                        style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                      >
                        <td style={{ padding: '13px 22px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            #{order.orderReference}
                          </span>
                        </td>
                        <td style={{ padding: '13px 22px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {order.userFirstName} {order.userLastName}
                          </div>
                        </td>
                        <td style={{ padding: '13px 22px' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {formatDate(order.createdAt)}
                            <br />
                            <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{formatTime(order.createdAt)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '13px 22px' }}>
                          <span className={sc.className}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                            {sc.label}
                          </span>
                        </td>
                        <td style={{ padding: '13px 22px' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            {formatCurrency(order.total)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Top Sellers */}
          {topSelling.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                Meilleures ventes
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {topSelling.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3, boxShadow: 'var(--shadow-card-hover)' }}
                    className="card"
                    style={{ padding: '18px 20px', cursor: 'default', transition: 'all 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: i === 0 ? 'rgba(255,107,0,0.1)' : 'var(--bg-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800,
                        color: i === 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                      }}>
                        #{i + 1}
                      </div>
                      {i === 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '2px 7px', borderRadius: 999, letterSpacing: '0.04em' }}>
                          TOP
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3 }}>
                      {item.name}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ventes</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{item.quantity}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Revenu</p>
                        <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{formatCurrency(item.revenue)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="card"
            style={{ padding: '18px 20px' }}
          >
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Actions rapides</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: '/admin/products', icon: Package, label: 'Gérer les produits', color: '#FF6B00', bg: 'rgba(255,107,0,0.08)' },
                { href: '/admin/orders',   icon: ShoppingBag, label: 'Voir les commandes', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
                { href: '/admin/clients',  icon: Users, label: 'Gérer les clients', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
              ].map(action => (
                <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: '#fff',
                    }}
                    className="quick-action-card"
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <action.icon size={15} color={action.color} strokeWidth={2.2} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</span>
                    <ArrowUpRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Stock Alerts */}
          {outOfStockProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="card"
              style={{ padding: '18px 20px', borderColor: '#FECACA' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, background: 'rgba(220,38,38,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={14} color="#DC2626" />
                </div>
                <div>
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>Alertes stock</h2>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{outOfStockProducts.length} produit{outOfStockProducts.length > 1 ? 's' : ''} en tension</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {outOfStockProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                      background: (p as any).quantity === 0 ? 'rgba(220,38,38,0.12)' : 'rgba(234,88,12,0.1)',
                      color: (p as any).quantity === 0 ? '#DC2626' : '#EA580C',
                      marginLeft: 8, flexShrink: 0,
                    }}>
                      {(p as any).quantity === 0 ? 'Épuisé' : `${(p as any).quantity} restants`}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/admin/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12, fontWeight: 600, color: '#DC2626', textDecoration: 'none', opacity: 0.8 }}>
                Gérer l'inventaire →
              </Link>
            </motion.div>
          )}

          {/* Activity Summary */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="card"
            style={{ padding: '18px 20px' }}
          >
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Répartition statuts</h2>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = recentOrders.filter(o => o.status === key).length;
              const total = recentOrders.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{cfg.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-surface)', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', background: cfg.dot, borderRadius: 999 }}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <style>{`
        .quick-action-card:hover {
          border-color: var(--accent) !important;
          background: var(--accent-subtle) !important;
        }
      `}</style>
    </div>
  );
}
