"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, User, UtensilsCrossed, ExternalLink } from 'lucide-react';
import AuthService from '@/lib/api/auth';
import './home.css';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
    setUser(AuthService.getCurrentUser());
  }, []);

  return (
    <div className="home-container">
      {/* ── Decorative Background ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'rgba(255,107,0,0.04)', filter: 'blur(100px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '40%', background: 'rgba(37,99,235,0.04)', filter: 'blur(100px)', borderRadius: '50%' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="home-content"
      >
        <div className="home-logo-box">
          <UtensilsCrossed size={36} strokeWidth={2.5} />
        </div>

        <h1 className="home-title">
          Portail Administrateur<br /><span>Fika Restaurant</span>
        </h1>
        
        <p className="home-description">
          Une plateforme premium conçue pour la gestion complète de votre établissement, 
          le suivi opérationnel en temps réel et le pilotage du catalogue.
        </p>

        <div className="home-actions">
          {isAuthenticated ? (
            <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '14px 28px', fontSize: 16, fontWeight: 700, borderRadius: 14 }}>
                <User size={18} strokeWidth={2.5} />
                Tableau de bord
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </Link>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 16, fontWeight: 700, borderRadius: 14 }}>
                Accès Administrateur
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </Link>
          )}
          
          <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
            <button className="btn-outline" style={{ padding: '14px 28px', fontSize: 16, borderStyle: 'dashed', borderRadius: 14 }}>
               <ExternalLink size={18} />
               Commandes Directes
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Footer bar */}
      <footer className="home-footer">
        <span>Fika Management System v2.0</span>
        <span>© {new Date().getFullYear()} — Premium Professional Hub</span>
      </footer>
    </div>
  );
}
