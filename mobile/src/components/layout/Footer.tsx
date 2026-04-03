import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    const location = useLocation();

    const tabs = [
        { icon: Home, label: 'Accueil', path: '/' },
        { icon: ClipboardList, label: 'Commandes', path: '/orders' },
        { icon: User, label: 'Profil', path: '/profile' },
    ];

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around z-50 safe-area-bottom shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                const Icon = tab.icon;

                return (
                    <Link 
                        key={tab.path} 
                        to={tab.path}
                        className={`flex flex-col items-center gap-1 group transition-all duration-300 w-20 px-2.5 py-1 ${isActive ? 'text-fika-primary scale-105' : 'text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-fika-light' : 'group-active:bg-slate-50'}`}>
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </footer>
    );
};

export default Footer;
