"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AuthService from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

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
    <div className="flex min-h-screen items-center justify-center p-4 coffee-gradient">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl border-white/5 relative overflow-hidden">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="h-16 w-16 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/40 mb-4"
            >
              <Coffee className="text-white h-8 w-8" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Fika Admin</h1>
            <p className="text-stone-400 text-sm text-center">Connectez-vous pour gérer votre établissement</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Email professionnel"
                  placeholder="admin@fika.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
                <Mail className="absolute left-4 top-[3.1rem] h-5 w-5 text-stone-500" />
              </div>

              <div className="relative">
                <Input
                  label="Mot de passe"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11"
                  required
                />
                <Lock className="absolute left-4 top-[3.1rem] h-5 w-5 text-stone-500" />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
              >
                <p className="text-xs text-red-500 text-center font-medium leading-relaxed">{error}</p>
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

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-stone-500 text-xs">
              © {new Date().getFullYear()} Fika Restaurant & Coffee. Tous droits réservés.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
