"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import ProductService from '@/lib/api/products';
import { Product, Category, Allergen, CreateProductRequest, UpdateProductRequest, PagedResponse } from '@/types/product';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    category: '' as Category | '',
    minPrice: '',
    maxPrice: '',
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    category: Category.PLAT,
    allergen: Allergen.AUCUN,
    imgUrl: '',
    quantity: 0,
    available: true
  });

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAll({
        page: currentPage,
        size: 10,
        name: filters.name || undefined,
        category: filters.category || undefined,
        // Add other filters as needed
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

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]); // Re-fetch when page or comparison filters change

  // Auto-correct inconsistent data: If stock is 0 but available is true, switch available to false
  useEffect(() => {
    if (products.length > 0) {
      products.forEach(async (product) => {
        if (product.quantity === 0 && product.available) {
           console.log(`Auto-correcting availability for ${product.name} (Stock: 0)`);
           try {
             // We need to send the full object as per ProductRequest requirements
             const updateRequest: UpdateProductRequest = {
               name: product.name,
               description: product.description,
               price: product.price,
               category: product.category,
               allergen: product.allergen,
               imgUrl: product.imgUrl,
               quantity: product.quantity,
               available: false // Force available to false
             };
             await ProductService.update(product.id, updateRequest);
             // Verify or refresh logic could be added here, but avoiding loops
           } catch (err) {
             console.error(`Failed to auto-correct product ${product.id}`, err);
           }
        }
      });
    }
  }, [products]);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, name: e.target.value });
    setCurrentPage(0); // Reset to first page on search
  };

  // Handle Modal Open/Close
  const openModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        allergen: product.allergen,
        imgUrl: product.imgUrl,
        quantity: product.quantity,
        available: product.available
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: Category.PLAT,
        allergen: Allergen.AUCUN,
        imgUrl: '',
        quantity: 0,
        available: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await ProductService.update(selectedProduct.id, formData);
      } else {
        await ProductService.create(formData);
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      // Show error message (could use toast)
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await ProductService.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-sm text-gray-500">Gérez votre catalogue, stock et prix.</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            value={filters.name}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value as Category | '' })}
          >
            <option value="">Toutes les catégories</option>
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
             <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
             </div>
             <p className="text-gray-500 font-medium">Aucun produit trouvé.</p>
             <Button variant="outline" onClick={() => setFilters({name: '', category: '', minPrice: '', maxPrice: ''})}>
               Réinitialiser les filtres
             </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Prix</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden">
                          {product.imgUrl ? (
                            <img src={product.imgUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {product.price.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${
                        product.quantity === 0 ? 'text-red-500' : 
                        product.quantity < 5 ? 'text-amber-500' : 'text-green-500'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Logic for Status Badge */}
                      {product.quantity === 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Rupture de stock
                        </span>
                      ) : product.available ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          En stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 bg-gray-100 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          Non disponible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(product)}
                          className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Affichage de {products.length} sur {totalElements} produits
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Précédent
              </Button>
              <Button 
                variant="outline" 
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                className="h-8 px-3 text-xs"
              >
                Suivant <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedProduct ? "Modifier le produit" : "Nouveau produit"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-1 block">Nom du produit</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
              <textarea
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm min-h-[80px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Prix (€)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Quantité (Stock)</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value);
                  setFormData({
                    ...formData, 
                    quantity: qty,
                    available: qty > 0 // Automatically set to true if stock > 0, false if 0
                  });
                }}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Catégorie</label>
              <select
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Allergène</label>
              <select
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                value={formData.allergen}
                onChange={(e) => setFormData({...formData, allergen: e.target.value as Allergen})}
              >
                {Object.values(Allergen).map((all) => (
                  <option key={all} value={all}>{all}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-1 block">Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                value={formData.imgUrl}
                onChange={(e) => setFormData({...formData, imgUrl: e.target.value})}
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                disabled={formData.quantity === 0}
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-700">Produit disponible à la vente</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
