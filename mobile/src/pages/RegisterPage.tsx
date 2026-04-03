import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation mot de passe (8+ caractères, 1 Majuscule)
        const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert("Le mot de passe doit contenir au moins 8 caractères et une majuscule.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            await register({ firstName, lastName, email, password });
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center px-6 py-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-fika-primary rounded-xl flex items-center justify-center shadow-lg mb-3">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Créer un compte</h1>
                    <p className="text-slate-400 text-xs mt-1">Rejoignez l'expérience Fika</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="Prénom" 
                            placeholder="Jean"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <Input 
                            label="Nom" 
                            placeholder="Dupont"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    
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
                    <p className="text-[10px] text-slate-400 font-medium -mt-2 ml-1">
                        * Minimum 8 caractères et une majuscule
                    </p>

                    <Input 
                        label="Confirmer le mot de passe" 
                        type="password" 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" isLoading={loading} className="w-full mt-2">
                        S'inscrire
                    </Button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-6">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-fika-primary font-bold hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
