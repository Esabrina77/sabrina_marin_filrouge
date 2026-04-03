import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { Button } from './Button';

interface ProductCardProps {
    product: Product;
    onAdd?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 group active:scale-[0.98] transition-all duration-200">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-50">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {!product.available && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg">
                            Indisponible
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-0.5 px-1">
                <span className="text-[10px] text-fika-primary font-bold uppercase tracking-wider">
                    {product.category}
                </span>
                <h3 className="text-sm font-bold text-slate-800 truncate">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-black text-slate-900 font-mono">
                        {product.price.toFixed(2)}€
                    </span>
                    <Button 
                        variant="ghost" 
                        size={20}
                        onClick={() => onAdd?.(product)}
                        disabled={!product.available}
                        className="!p-1.5 !rounded-lg bg-fika-light text-fika-primary hover:bg-fika-primary hover:text-white transition-all duration-300"
                    >
                        <PlusCircle size={18} strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
