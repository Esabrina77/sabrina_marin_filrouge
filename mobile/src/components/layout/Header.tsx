import React from 'react';
import { Bell, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { totalItems, setCartOpen } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-[60] safe-area-top shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-fika-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fika</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-fika-primary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button 
          onClick={() => setCartOpen(true)}
          className="p-2 text-slate-400 hover:text-fika-primary transition-colors relative"
        >
          <ShoppingCart size={20} />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1 right-1 w-4 h-4 bg-fika-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
};

export default Header;
