"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, UtensilsCrossed, AlertCircle } from 'lucide-react';
import AuthService from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login({ email, password });
      if (response.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        await AuthService.logout(false);
        setError("Accès refusé. Cette interface est réservée aux administrateurs.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Identifiants invalides. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* ── Decorative Background ── */}
      <div className="login-bg-decorative">
        <div className="login-bg-blob-1" />
        <div className="login-bg-blob-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="login-card-wrapper"
      >
        <div className="login-card">
          {/* Logo Section */}
          <div className="login-header">
            <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="login-logo-box"
            >
              <UtensilsCrossed size={32} strokeWidth={2.5} />
            </motion.div>
            <h1 className="login-title">Fika Admin</h1>
            <p className="login-subtitle">Connectez-vous pour accéder à votre interface de gestion</p>
          </div>

          <form onSubmit={handleLogin} className="login-form-group">
            <div className="input-container">
               <label className="input-label">Email professionnel</label>
               <div className="input-field-wrapper">
                 <Mail size={16} className="input-icon" />
                 <input
                   type="email"
                   placeholder="admin@fika.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="login-field"
                   required
                 />
               </div>
            </div>

            <div className="input-container">
               <label className="input-label">Mot de passe</label>
               <div className="input-field-wrapper">
                 <Lock size={16} className="input-icon" />
                 <input
                   type="password"
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="login-field"
                   required
                 />
               </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="login-error-box"
              >
                <AlertCircle size={16} style={{ flexShrink: 0, color: '#DC2626' }} />
                <p className="login-error-text">{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              className="btn-primary login-submit-btn" 
              disabled={isLoading}
                   style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <footer className="login-footer">
            <p className="login-footer-text">
              © {new Date().getFullYear()} Fika Restaurant • Version Admin
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
