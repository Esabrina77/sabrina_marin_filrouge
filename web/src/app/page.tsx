"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coffee, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      {/* Background Image */}
      <img 
        src="/images/bg-home.png" 
        alt="Fika Coffee Shop" 
        className="home-bg-image"
      />
      <div className="home-overlay" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="home-content"
      >
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-xl">
            <Coffee className="text-white h-6 w-6" />
          </div>
        </div>

        <h1 className="home-title">
          Gestion du portail <span className="text-amber-500">Fika Admin</span>
        </h1>
        
        <p className="home-description">
          Plateforme centralisée pour la gestion de votre établissement, 
          suivi des commandes et contrôle du catalogue en temps réel.
        </p>

        <div className="home-actions">
          {isAuthenticated ? (
            <Link href="/admin/dashboard">
              <Button className="px-8 flex items-center gap-2">
                <User className="h-4 w-4" />
                Tableau de bord
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="px-8 flex items-center gap-2">
                Connexion Admin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <Link href="/admin/orders">
            <Button variant="glass" className="px-8">
              Commandes en cours
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Footer / Info bar */}
      <div className="absolute bottom-8 w-full px-8 flex justify-between items-center text-stone-400 text-xs tracking-widest uppercase">
        <span>Fika Restaurant & Coffee Shop</span>
        <span>© {new Date().getFullYear()} — Premium Experience</span>
      </div>
    </div>
  );
}
