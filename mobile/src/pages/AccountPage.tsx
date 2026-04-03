import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { OrderCard } from '../components/ui/OrderCard';
import { User, LogOut, Settings, History, ChevronRight } from 'lucide-react';

export const AccountPage: React.FC = () => {
    const { user, logout } = useAuth();
    const { orders, fetchHistory, loading, error } = useOrders();
    const [page, setPage] = useState(1);
    const ordersPerPage = 5;

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const paginatedOrders = orders.slice(0, page * ordersPerPage);
    const hasMore = orders.length > paginatedOrders.length;

    return (
        <MainLayout>
            <div className="flex flex-col gap-8 pb-10">
                {/* Profile Header */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-fika-light rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-fika-primary" />
                            )}
                        </div>
                        <div className="absolute bottom-1 right-1 w-7 h-7 bg-fika-primary rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-fika-accent transition-colors">
                            <Settings size={14} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user ? `${user.firstName} ${user.lastName}` : 'Fika Enthusiast'}</h2>
                        <p className="text-slate-400 text-sm font-medium">{user?.email || 'fika@example.com'}</p>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="flex flex-col gap-2 !bg-fika-primary text-white border-none shadow-md">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Commandes</span>
                        <span className="text-2xl font-black">{orders.length}</span>
                    </Card>
                    <Card className="flex flex-col gap-2 !bg-fika-light text-fika-primary border-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Points Fika</span>
                        <span className="text-2xl font-black">{user?.points || 0}</span>
                    </Card>
                </div>

                {/* Order History Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Mes Commandes</h3>
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-400">
                             <History size={16} />
                        </div>
                    </div>

                    {loading && orders.length === 0 ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 h-24 animate-pulse"></div>
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        <>
                            <div className="flex flex-col gap-4">
                                {paginatedOrders.map((order) => (
                                    <OrderCard 
                                        key={order.id} 
                                        order={order} 
                                        onClick={(o) => console.log('Clicked order:', o.id)}
                                    />
                                ))}
                            </div>
                            
                            {hasMore && (
                                <Button 
                                    variant="link" 
                                    onClick={() => setPage(p => p + 1)}
                                    className="text-fika-primary font-bold text-sm"
                                >
                                    Voir plus de commandes
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                               <History size={24} />
                            </div>
                            <div className="flex flex-col gap-1 px-8">
                                <p className="text-slate-800 text-xs font-bold uppercase tracking-wider">Aucune commande</p>
                                <p className="text-slate-400 text-[10px] font-medium leading-tight">Votre historique est vide. Commandez dès maintenant !</p>
                            </div>
                        </div>
                    )}
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

export default AccountPage;

