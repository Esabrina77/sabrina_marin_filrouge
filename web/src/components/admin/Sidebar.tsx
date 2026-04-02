"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  UtensilsCrossed,
} from 'lucide-react';
import AuthService from '@/lib/api/auth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/admin/dashboard', section: 'main' },
  { icon: ShoppingBag,    label: 'Commandes',   href: '/admin/orders',    section: 'main' },
  { icon: Package,        label: 'Produits',    href: '/admin/products',  section: 'main' },
  { icon: Users,          label: 'Clients',     href: '/admin/clients',   section: 'main' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        width: 'var(--sidebar-width)',
        background: '#fff',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* ── Brand ── */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--accent)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-accent)',
            flexShrink: 0,
          }}>
            <UtensilsCrossed size={17} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Fika
            </p>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 8px 6px' }}>
          Menu
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: isActive ? 0 : 3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    boxShadow: isActive ? 'var(--shadow-accent)' : 'none',
                    position: 'relative',
                  }}
                  className={isActive ? '' : 'sidebar-nav-item'}
                >
                  <item.icon
                    size={17}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{ color: isActive ? '#fff' : 'currentColor', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500 }}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── User Footer ── */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => AuthService.logout()}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 12px',
            borderRadius: 12, border: 'none', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 500,
            transition: 'background 0.15s, color 0.15s',
          }}
          className="sidebar-logout-btn"
        >
          <LogOut size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>Déconnexion</span>
        </button>
      </div>

      <style>{`
        .sidebar-nav-item:hover {
          background: var(--accent-subtle) !important;
          color: var(--accent) !important;
        }
        .sidebar-logout-btn:hover {
          background: #FEF2F2 !important;
          color: #DC2626 !important;
        }
      `}</style>
    </aside>
  );
};
