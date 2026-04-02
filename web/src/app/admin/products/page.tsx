"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import ProductService from '@/lib/api/products';
import { Product, Category, Allergen, CreateProductRequest, UpdateProductRequest } from '@/types/product';
import { useSearchParams } from 'next/navigation';
import { ProductDetailsContent } from '@/components/admin/ProductDetailsContent';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    category: '' as Category | '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAll({
        page: currentPage,
        size: 20,
        name: filters.name || undefined,
        category: filters.category || undefined,
      });
      setProducts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const queryParam = searchParams.get('search');

  // Initial load and parameter handling
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      // 1. Set initial search from URL if present
      if (queryParam && queryParam !== searchTerm) {
        setSearchTerm(queryParam);
        setFilters(prev => ({ ...prev, name: queryParam }));
      }

      // 2. Fetch products (this will also be triggered by the main effect below, 
      // but we ensure it runs once correctly on mount)
      await fetchProducts();

      // 3. Load specific product if ID is in URL
      if (idParam && isMounted) {
        try {
          const p = await ProductService.getById(idParam);
          openModal(p);
        } catch (e) {
          console.error("Failed to load product from URL", e);
        }
      }
    };

    initialize();
    return () => { isMounted = false; };
  }, []); // Only on mount

  // Main fetch effect for filter changes
  useEffect(() => {
    // Skip initial fetch as it's handled by initialize
    const isInitial = products.length === 0 && loading;
    if (!isInitial) {
      fetchProducts();
    }
  }, [currentPage, filters.name, filters.category]);

  // Search debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => {
        if (prev.name === searchTerm) return prev;
        return { ...prev, name: searchTerm };
      });
      setCurrentPage(0);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openModal = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await ProductService.delete(productToDelete.id);
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="top-bar-admin"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div className="top-bar-title">
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Produits
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            Gérez votre catalogue, stock et prix.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="search-container" style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: 260, padding: '9px 12px 9px 36px',
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 12, fontSize: 13, color: 'var(--text-primary)',
                outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={15} strokeWidth={2.5} /> Nouveau produit
          </button>
        </div>
      </motion.div>

      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="filter-container"
      >
        <button
          onClick={() => setFilters({ ...filters, category: '' })}
          className={`filter-btn ${filters.category === '' ? 'active' : ''}`}
        >
          Tous
        </button>
        {Object.values(Category).map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setFilters({ ...filters, category: cat });
                setCurrentPage(0);
              }}
              className={`filter-btn ${isActive ? 'active' : ''}`}
            >
              {cat}
            </button>
          );
        })}
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="card"
        style={{ overflow: 'hidden' }}
      >
        <div className="desktop-only">
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  {['Produit', 'Catégorie', 'Prix', 'Stock', 'Status', 'Actions'].map((h, index) => (
                    <th key={h} style={{ padding: '12px 22px', textAlign: index === 5 ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <TableSkeleton rows={8} cols={6} />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', padding: 16, background: 'var(--bg-surface)', borderRadius: '50%', marginBottom: 12 }}>
                        <Package size={24} color="var(--text-tertiary)" />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Aucun produit</p>
                      <button onClick={() => setFilters({ name: '', category: '' })} className="btn-outline" style={{ marginTop: 12 }}>Réinitialiser filtres</button>
                    </td>
                  </tr>
                ) : (
                  products.map((product, i) => {
                    const isOutOfStock = product.quantity === 0;
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="table-row-hover"
                        style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                      >
                        <td style={{ padding: '14px 22px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-surface)', flexShrink: 0 }}>
                              {product.imgUrl ? (
                                <img src={product.imgUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Package size={20} color="var(--border)" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {product.name}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 22px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                            {product.category}
                          </span>
                        </td>
                        <td style={{ padding: '14px 22px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatCurrency(product.price)}
                        </td>
                        <td style={{ padding: '14px 22px' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: isOutOfStock ? '#DC2626' : (product.quantity < 5 ? '#EA580C' : '#16A34A') }}>
                            {product.quantity}
                          </span>
                        </td>
                        <td style={{ padding: '14px 22px' }}>
                          {isOutOfStock ? (
                            <span className="badge badge-cancelled">
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#DC2626' }} /> Rupture
                            </span>
                          ) : (
                            <span className="badge badge-completed">
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A' }} /> En stock
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn-outline"
                              style={{ padding: '6px', borderRadius: 8, borderColor: 'transparent' }}
                              onClick={() => openModal(product)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-outline"
                              style={{ padding: '6px', borderRadius: 8, color: '#DC2626', borderColor: 'transparent' }}
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-only" style={{ paddingBottom: 16, marginTop: 12 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 12px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card" style={{ padding: 16, height: 120, display: 'flex', gap: 12 }}>
                  <Skeleton width={48} height={48} borderRadius={10} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                    <Skeleton width="40%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Aucun produit</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 12px' }}>
              {products.map((product, i) => {
                const isOutOfStock = product.quantity === 0;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{ padding: 16 }}
                  >
                    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-surface)', flexShrink: 0 }}>
                        {product.imgUrl ? (
                          <img src={product.imgUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={24} color="var(--border)" />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', marginLeft: 8 }}>{formatCurrency(product.price)}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginTop: 2, display: 'block' }}>{product.category}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: isOutOfStock ? '#DC2626' : (product.quantity < 5 ? '#EA580C' : '#16A34A') }}>
                          Stock: {product.quantity}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-outline" style={{ padding: '8px', borderRadius: 10 }} onClick={() => openModal(product)}><Edit size={14} /></button>
                        <button className="btn-outline" style={{ padding: '8px', borderRadius: 10, color: '#DC2626' }} onClick={() => handleDelete(product)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Affichage de {products.length} sur {totalElements}
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn-outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                style={{ padding: '6px 12px', opacity: currentPage === 0 ? 0.5 : 1, cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} /> Précédent
              </button>
              <button
                className="btn-outline"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                style={{ padding: '6px 12px', opacity: currentPage >= totalPages - 1 ? 0.5 : 1, cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
              >
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedProduct ? "Détails du produit" : "Nouveau produit"}
        size="lg"
      >
        <ProductDetailsContent 
          product={selectedProduct} 
          onSaveSuccess={() => {
            closeModal();
            fetchProducts();
          }} 
          onCancel={closeModal} 
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', marginBottom: 16 }}>
            <AlertTriangle size={24} />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Supprimer ce produit ?
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
            Êtes-vous sûr de vouloir supprimer le produit <strong style={{ color: 'var(--text-primary)' }}>{productToDelete?.name}</strong> ? Cette action est irréversible et retirera immédiatement le produit du catalogue.
          </p>
          <div style={{ display: 'flex', width: '100%', gap: 12 }}>
            <button
              className="btn-outline"
              onClick={() => setIsDeleteModalOpen(false)}
              style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
            >
              Annuler
            </button>
            <button
              className="btn-primary"
              onClick={confirmDelete}
              style={{ flex: 1, padding: '10px', justifyContent: 'center', background: '#DC2626', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)' }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
