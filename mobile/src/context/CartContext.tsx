import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';

export interface CartItem extends Product {
    cartQuantity: number;
}

interface CartContextType {
    items: CartItem[];
    isCartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('fika_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('fika_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id 
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(0, item.cartQuantity + delta);
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }).filter(item => item.cartQuantity > 0));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, item) => sum + item.cartQuantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    return (
        <CartContext.Provider value={{ 
            items, 
            isCartOpen,
            setCartOpen: setIsCartOpen,
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
