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
  X,
} from 'lucide-react';
import AuthService from '@/lib/api/auth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord',  href: '/admin/dashboard', section: 'main' },
  { icon: ShoppingBag,    label: 'Commandes',   href: '/admin/orders',    section: 'main' },
  { icon: Package,        label: 'Produits',    href: '/admin/products',  section: 'main' },
  { icon: Users,          label: 'Clients',     href: '/admin/clients',   section: 'main' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="sidebar-overlay active"
            style={{ display: 'block' }}
          />
        )}
      </AnimatePresence>

      <aside
        className={`admin-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          height: '100vh',
          width: 'var(--sidebar-width)',
          background: '#fff',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 200,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── Brand ── */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                Portail Admin
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 32, height: 32,
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            className="mobile-close-btn"
          >
            <X size={18} />
          </button>
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
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={onClose}>
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
            onClick={() => {
              onClose();
              AuthService.logout();
            }}
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
          @media screen and (min-width: 769px) {
            .mobile-close-btn, .sidebar-overlay { 
              display: none !important; 
            }
            .admin-sidebar {
              transform: none !important;
            }
          }
          @media screen and (max-width: 768px) {
             .admin-sidebar {
                transform: translateX(-100%);
             }
             .admin-sidebar.open {
                transform: translateX(0);
             }
          }
        `}</style>
      </aside>
    </>
  );
};
