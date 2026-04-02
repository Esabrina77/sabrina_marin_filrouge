"use client";

import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import ProductService from '@/lib/api/products';
import { Product, Category, Allergen, CreateProductRequest, UpdateProductRequest } from '@/types/product';

interface ProductDetailsContentProps {
  product?: Product | null;
  onSaveSuccess: (p: Product) => void;
  onCancel: () => void;
}

export const ProductDetailsContent = ({ product, onSaveSuccess, onCancel }: ProductDetailsContentProps) => {
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

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        allergen: product.allergen,
        imgUrl: product.imgUrl,
        quantity: (product as any).quantity || 0,
        available: (product as any).available ?? true
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let saved: Product;
      if (product) {
        saved = await ProductService.update(product.id, formData as UpdateProductRequest);
      } else {
        saved = await ProductService.create(formData);
      }
      onSaveSuccess(saved);
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-content-inner" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with Image Preview */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'start' }}>
        <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          {formData.imgUrl ? (
            <img src={formData.imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              <Package size={32} />
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Nom du produit</label>
          <input
            required type="text" maxLength={255}
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Cheesecake aux fruits rouges"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', outlineColor: 'var(--accent)', background: 'var(--bg-card)' }}
          />
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 6 }}>URL de l'image</label>
            <input
              required type="url" maxLength={255}
              value={formData.imgUrl} onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
              placeholder="https://images..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)', outlineColor: 'var(--accent)' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Stats Cards */}
        <div style={{ padding: 16, borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Prix de vente</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>€</span>
            <input
              required type="number" step="0.01" min="0"
              value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 24, fontWeight: 900, color: 'var(--accent)', outline: 'none', padding: 0 }}
            />
          </div>
        </div>

        <div style={{ padding: 16, borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Stock actuel</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              required type="number" min="0"
              value={formData.quantity} onChange={(e) => {
                const qty = parseInt(e.target.value);
                setFormData({ ...formData, quantity: qty, available: qty > 0 });
              }}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 24, fontWeight: 900, color: formData.quantity > 0 ? '#16A34A' : '#DC2626', outline: 'none', padding: 0 }}
            />
            <Package size={20} color="var(--text-tertiary)" />
          </div>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Description</label>
          <textarea
            required maxLength={1000}
            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description détaillée du produit..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-primary)', outlineColor: 'var(--accent)', minHeight: 100, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Catégorie</label>
          <select
            value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', outlineColor: 'var(--accent)', background: 'var(--bg-card)' }}
          >
            {Object.values(Category).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Allergène principal</label>
          <select
            value={formData.allergen} onChange={(e) => setFormData({ ...formData, allergen: e.target.value as Allergen })}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', outlineColor: 'var(--accent)', background: 'var(--bg-card)' }}
          >
            {Object.values(Allergen).map((all) => <option key={all} value={all}>{all}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
        <button type="button" className="btn-outline" onClick={onCancel} style={{ padding: '10px 24px', borderRadius: 12 }}>Annuler</button>
        <button type="submit" className="btn-primary" style={{ padding: '10px 32px', borderRadius: 12, background: 'var(--text-primary)', color: '#fff' }}>
          {product ? "Mettre à jour" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
};
