import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, LogOut, Settings, CreditCard, Bell, MapPin, ChevronRight, Share2 } from 'lucide-react';

export const AccountPage: React.FC = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: User, label: 'Informations personnelles', color: 'text-blue-500' },
        { icon: CreditCard, label: 'Moyens de paiement', color: 'text-purple-500' },
        { icon: MapPin, label: 'Mes adresses', color: 'text-red-500' },
        { icon: Bell, label: 'Notifications', color: 'text-fika-primary' },
        { icon: Shield, label: 'Sécurité & Confidentialité', color: 'text-slate-500' },
        { icon: Share2, label: 'Parrainer un ami', color: 'text-orange-500' },
    ];

    return (
        <MainLayout>
            <div className="flex flex-col gap-8 pb-10">
                {/* Profile Header */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-fika-light rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-fika-primary" />
                            )}
                        </div>
                        <div className="absolute bottom-1 right-1 w-7 h-7 bg-fika-primary rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-fika-accent transition-colors">
                            <Settings size={14} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name || 'Fika Enthusiast'}</h2>
                        <p className="text-slate-400 text-sm font-medium">{user?.email || 'fika@example.com'}</p>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="flex flex-col gap-2 !bg-fika-primary text-white border-none shadow-md">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Commandes</span>
                        <span className="text-2xl font-black">12</span>
                    </Card>
                    <Card className="flex flex-col gap-2 !bg-fika-light text-fika-primary border-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Points Fika</span>
                        <span className="text-2xl font-black">450</span>
                    </Card>
                </div>

                {/* Settings List */}
                <div className="flex flex-col gap-3">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button 
                                key={idx}
                                className="flex items-center justify-between bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm active:bg-slate-50 active:scale-[0.99] transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-2xl bg-opacity-10 ${item.color.replace('text-', 'bg-')} ${item.color}`}>
                                        <Icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <Button 
                    variant="outline" 
                    onClick={logout}
                    className="w-full mt-4 !rounded-3xl !py-4 !border-slate-100 !text-red-500 hover:!bg-red-50 hover:!border-red-100 transition-all duration-300 gap-3"
                >
                    <LogOut size={18} strokeWidth={2.5} />
                    Déconnexion
                </Button>

                <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-10">
                    Fika Mobile App v1.0.0
                </p>
            </div>
        </MainLayout>
    );
};

// Simple Mock Shield component as it was missing from original Imports
const Shield: React.FC<any> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
);

export default AccountPage;
