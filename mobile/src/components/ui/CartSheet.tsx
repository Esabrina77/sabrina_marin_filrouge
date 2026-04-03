import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from './Button';

export const CartSheet: React.FC = () => {
    const { items, updateQuantity, removeFromCart, totalPrice, totalItems, isCartOpen, setCartOpen } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCartOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Sheet */}
                    <motion.div 
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 top-0 bg-white rounded-b-[40px] z-[101] shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 pt-16 pb-4 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-fika-light rounded-2xl flex items-center justify-center text-fika-primary">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Mon Panier</h3>
                                    <p className="text-slate-400 text-xs font-medium">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setCartOpen(false)}
                                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                            {items.length > 0 ? (
                                <div className="flex flex-col gap-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                                <img 
                                                    src={item.imgUrl?.startsWith('http') ? item.imgUrl : `http://localhost:8080${item.imgUrl}`} 
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 leading-tight">{item.name}</h4>
                                                    <p className="text-fika-primary font-black text-sm">{item.price.toFixed(2)} €</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-500 hover:text-fika-primary shadow-sm transition-all"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-sm font-black w-4 text-center text-slate-800">{item.cartQuantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-500 hover:text-fika-primary shadow-sm transition-all"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                        <ShoppingBag size={40} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-bold">Votre panier est vide</p>
                                        <p className="text-slate-400 text-sm">Ajoutez des délices pour commencer.</p>
                                    </div>
                                    <Button variant="outline" onClick={() => setCartOpen(false)} className="mt-4">
                                        Voir le menu
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="px-6 pt-4 pb-12 bg-slate-50/50 border-t border-slate-100 rounded-b-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total à régler</span>
                                    <span className="text-3xl font-black text-slate-800 tracking-tighter">
                                        {totalPrice.toFixed(2)} <span className="text-fika-primary">€</span>
                                    </span>
                                </div>
                                <Button className="w-full py-4 rounded-2xl shadow-xl shadow-fika-primary/20 text-base font-black uppercase tracking-widest h-auto">
                                    Finaliser ma commande
                                </Button>
                            </div>
                        )}

                        {/* Bottom Handle */}
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-4 mt-2" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
