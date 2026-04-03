import React, { useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { OrderCard } from '../components/ui/OrderCard';
import { useOrders } from '../hooks/useOrders';
import { ClipboardList, History } from 'lucide-react';

export const OrdersPage: React.FC = () => {
    const { orders, fetchHistory, loading, error } = useOrders();

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <MainLayout>
            <div className="flex flex-col gap-8 pb-10">
                {/* Header */}
                <div className="flex flex-col gap-2 px-2">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                        Mes <span className="text-fika-primary underline decoration-fika-light decoration-8 underline-offset-1">Commandes</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Historique de vos achats chez Fika.</p>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 h-32 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    onClick={(o) => console.log('Clicked order:', o.id)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white rounded-3xl border border-slate-50 shadow-sm border-dashed">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                   <History size={32} />
                                </div>
                                <div className="flex flex-col gap-1 mx-8">
                                    <p className="text-slate-800 text-sm font-bold uppercase tracking-wider">Aucune commande</p>
                                    <p className="text-slate-400 text-xs font-medium">Votre historique est vide. Commandez dès maintenant !</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-4 rounded-2xl border border-red-100 text-center font-medium">
                        {error}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default OrdersPage;
