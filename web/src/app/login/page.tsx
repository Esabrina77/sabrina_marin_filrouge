"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
        setError("Accès refusé. Cette interface est réservée aux administrateurs.");
        AuthService.logout();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Identifiants invalides. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Decorative Elements */}
      <div className="login-bg-decorative">
        <div className="login-bg-blob-1" />
        <div className="login-bg-blob-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card-wrapper"
      >
        <div className="login-card">
          {/* Logo Section */}
          <div className="login-header">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="login-logo-box"
            >
              <Coffee className="text-white h-8 w-8" />
            </motion.div>
            <h1 className="login-title">Fika Admin</h1>
            <p className="login-subtitle">Connectez-vous pour gérer votre établissement</p>
          </div>

          <form onSubmit={handleLogin} className="login-form-group">
            <div className="space-y-4">
              <div className="login-input-wrapper">
                <Input
                  label="Email professionnel"
                  placeholder="admin@fika.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
                <Mail className="login-input-icon" />
              </div>

              <div className="login-input-wrapper">
                <Input
                  label="Mot de passe"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11"
                  required
                />
                <Lock className="login-input-icon" />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="login-error-box"
              >
                <p className="login-error-text">{error}</p>
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full group" 
              isLoading={isLoading}
            >
              Se connecter
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              © {new Date().getFullYear()} Fika Restaurant & Coffee. Tous droits réservés.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
