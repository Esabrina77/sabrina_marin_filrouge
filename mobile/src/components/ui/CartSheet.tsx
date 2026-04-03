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

                    {/* Sheet (Compact Version) */}
                    <motion.div 
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed inset-x-0 top-0 bg-white/95 backdrop-blur-md rounded-b-[32px] z-[101] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col h-auto max-h-[85vh] border-b border-slate-100"
                    >
                        {/* Header */}
                        <div className="px-6 pt-16 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-fika-light rounded-xl flex items-center justify-center text-fika-primary">
                                    <ShoppingBag size={16} />
                                </div>
                                <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">Mon Panier</h3>
                            </div>
                            <button 
                                onClick={() => setCartOpen(false)}
                                className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Items List - Scrollable only if needed */}
                        <div className="overflow-y-auto px-6 py-2 no-scrollbar">
                            {items.length > 0 ? (
                                <div className="flex flex-col gap-4 mb-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3 py-3 border-b border-slate-50 last:border-0">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                                <img 
                                                    src={item.imgUrl?.startsWith('http') ? item.imgUrl : `http://localhost:8080${item.imgUrl}`} 
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-800 text-sm leading-tight leading-4 line-clamp-1">{item.name}</h4>
                                                    <p className="text-fika-primary font-black text-sm ml-2">{(item.price * item.cartQuantity).toFixed(2)}€</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-slate-500 shadow-sm"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-[11px] font-black w-3 text-center text-slate-800">{item.cartQuantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-slate-500 shadow-sm"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <p className="text-slate-400 text-xs font-medium">Votre panier est vide</p>
                                </div>
                            )}
                        </div>

                        {/* Footer (Compact) */}
                        {items.length > 0 && (
                            <div className="px-6 pb-6 pt-2">
                                <div className="flex items-center justify-between mb-4 mt-2">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Total</span>
                                    <span className="text-2xl font-black text-slate-800 tracking-tighter">
                                        {totalPrice.toFixed(2)} <span className="text-fika-primary">€</span>
                                    </span>
                                </div>
                                <Button className="w-full py-3.5 rounded-xl shadow-lg shadow-fika-primary/10 text-xs font-black uppercase tracking-widest h-auto">
                                    Valider ma commande
                                </Button>
                            </div>
                        )}

                        {/* Bottom Handle */}
                        <div className="w-10 h-1 bg-slate-100 rounded-full mx-auto mb-3" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
