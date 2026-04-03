import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-fika-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <span className="text-white font-bold text-3xl">F</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Bienvenue sur Fika</h1>
                    <p className="text-slate-400 text-sm mt-1">Connectez-vous pour continuer</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium">
                            {error}
                        </div>
                    )}
                    
                    <Input 
                        label="Email" 
                        type="email" 
                        placeholder="exemple@fika.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input 
                        label="Mot de passe" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" isLoading={loading} className="w-full mt-2">
                        Se connecter
                    </Button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-8">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-fika-primary font-bold hover:underline">
                        S'inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
