import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { ProductCard } from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { Badge } from '../components/ui/Badge';
import { Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
    const { products, categories, fetchAll, fetchByCategory, fetchProducts, loading } = useProducts();
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAll();
            } finally {
                setInitialLoad(false);
            }
        };
        loadData();
    }, [fetchAll]);

    const handleCategoryChange = (slug: string | null) => {
        setActiveCategory(slug);
        if (slug) {
            fetchByCategory(slug);
        } else {
            fetchProducts();
        }
    };

    return (
        <MainLayout>
            <div key="home-page-content-root" className="flex flex-col gap-8 pb-10">
                {/* Dashboard Stats / Welcome */}
                <div className="flex flex-col gap-2 px-2">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                        Bonjour, <span className="text-fika-primary">{user?.firstName || 'Fika-Lover'}</span> 👋
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Découvrez nos délices du jour.</p>
                </div>

                {/* Search Bar - Admin Style */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-fika-primary transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher un plat, une boisson..." 
                        className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-fika-primary/10 focus:border-fika-primary transition-all duration-300 text-sm"
                    />
                </div>

                {initialLoad ? (
                    <div key="loading-state-wrapper" className="flex flex-col gap-8">
                        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                            {[1, 2, 3].map((i) => (
                                <div key={`cat-skeleton-${i}`} className="w-24 h-10 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={`skeleton-${i}`} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 animate-pulse">
                                    <div className="aspect-square bg-slate-50 rounded-2xl mb-4" />
                                    <div className="h-4 bg-slate-50 rounded w-2/3 mb-2" />
                                    <div className="h-4 bg-slate-50 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div key="loaded-content-wrapper" className="flex flex-col gap-8">
                        {/* Categories Tab Bar */}
                        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                            <button 
                                key="cat-static-all"
                                onClick={() => handleCategoryChange(null)}
                                className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${!activeCategory ? 'bg-fika-primary text-white border-fika-primary' : 'bg-white text-slate-400 border-slate-100 hover:border-fika-primary/30'}`}
                            >
                                Tous
                            </button>
                            {categories.map((cat, idx) => (
                                <button 
                                    key={`cat-${cat.id || cat.slug}-${idx}`}
                                    onClick={() => handleCategoryChange(cat.slug)}
                                    className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${activeCategory === cat.slug ? 'bg-fika-primary text-white border-fika-primary' : 'bg-white text-slate-400 border-slate-100 hover:border-fika-primary/30'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Products Grid */}
                        <div key="products-active-grid" className="grid grid-cols-2 gap-4">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard 
                                        key={`product-${product.id}`} 
                                        product={product} 
                                        onAdd={(p) => console.log('Added:', p.name)}
                                    />
                                ))
                            ) : (
                                <div key="empty-results-state" className="col-span-2 flex flex-col items-center justify-center py-20 text-center gap-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                       <Search size={32} />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">Aucun produit trouvé.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default HomePage;
