"use client";

import React, { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/admin/Sidebar';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/api/auth';
import { Menu, UtensilsCrossed } from 'lucide-react';
import { BottomNav } from '@/components/admin/BottomNav';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Optimized auth check
  useLayoutEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push('/login');
      } else {
        setIsReady(true);
      }
    };
    checkAuth();
  }, [router]);

  if (!isReady) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-base)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 20
      }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 48, height: 48, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px var(--accent-glow)' }}
        >
          <UtensilsCrossed size={24} color="#fff" />
        </motion.div>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header */}
        <header className="mobile-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UtensilsCrossed size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Fika</span>
          </div>
        </header>

        <main className="admin-main">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
