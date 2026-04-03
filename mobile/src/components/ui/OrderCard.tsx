import React from 'react';
import { Badge } from './Badge';
import { Order, OrderStatus } from '../../types/order';
import { Package, Clock, ChevronRight } from 'lucide-react';

interface OrderCardProps {
    order: Order;
    onClick?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PREPARING': return 'info';
            case 'READY': return 'success';
            case 'COMPLETED': return 'default';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'PREPARING': return 'En préparation';
            case 'READY': return 'Prêt à servir';
            case 'COMPLETED': return 'Terminée';
            case 'CANCELLED': return 'Annulée';
            default: return status;
        }
    };

    return (
        <div 
            onClick={() => onClick?.(order)}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-fika-primary border border-slate-100">
                        <Package size={20} />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-slate-800">Commande #{order.id.slice(-6).toUpperCase()}</h4>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <Clock size={10} />
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                    {getStatusLabel(order.status)}
                </Badge>
            </div>

            <div className="h-px bg-slate-50 w-full"></div>

            <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Montant Total</p>
                    <span className="text-xl font-black text-slate-900 font-mono">
                        {order.totalAmount.toFixed(2)}€
                    </span>
                </div>
                <div className="flex items-center gap-1 text-fika-primary font-bold text-xs">
                    Détails
                    <ChevronRight size={14} strokeWidth={3} />
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
