"use client";

import React, { useLayoutEffect, useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/api/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        padding: '32px 36px',
        minHeight: '100vh',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  );
}
