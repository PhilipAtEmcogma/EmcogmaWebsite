'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  image_url: string;
  demo_url: string;
  documentation_url: string;
  category: string;
  featured: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    slug: '',
    name: '',
    tagline: '',
    description: '',
    long_description: '',
    price_monthly: 0,
    price_yearly: 0,
    features: [],
    image_url: '',
    demo_url: '',
    documentation_url: '',
    category: '',
    featured: false,
    active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([formData]);

        if (error) throw error;
      }

      await fetchProducts();
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Error: ' + (error.message || 'Failed to save product'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      await fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert('Error: ' + (error.message || 'Failed to delete product'));
    }
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    setFormData(product);
    setIsCreating(true);
  }

  function resetForm() {
    setEditingProduct(null);
    setIsCreating(false);
    setFormData({
      slug: '',
      name: '',
      tagline: '',
      description: '',
      long_description: '',
      price_monthly: 0,
      price_yearly: 0,
      features: [],
      image_url: '',
      demo_url: '',
      documentation_url: '',
      category: '',
      featured: false,
      active: true,
      display_order: 0,
    });
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyber-primary">Products ({products.length})</h2>
        <button onClick={() => setIsCreating(true)} className="btn-cyber px-6 py-2">
          + New Product
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 bg-cyber-darker/50 rounded-lg border border-cyber-primary/30 max-h-[70vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-cyber-secondary mb-4">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-cyber w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="input-cyber w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-cyber w-full h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Long Description
              </label>
              <textarea
                value={formData.long_description}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                className="input-cyber w-full h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Monthly ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_monthly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })
                  }
                  className="input-cyber w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Yearly ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_yearly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_yearly: parseFloat(e.target.value) })
                  }
                  className="input-cyber w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Features (comma-separated)
              </label>
              <textarea
                value={formData.features?.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    features: e.target.value.split(',').map((f) => f.trim()),
                  })
                }
                className="input-cyber w-full h-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Demo URL</label>
                <input
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Docs URL</label>
                <input
                  type="url"
                  value={formData.documentation_url}
                  onChange={(e) =>
                    setFormData({ ...formData, documentation_url: e.target.value })
                  }
                  className="input-cyber w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm text-gray-300">
                  Featured
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm text-gray-300">
                  Active
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) })
                  }
                  className="input-cyber w-full"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-cyber px-6 py-2">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 bg-cyber-darker/30 rounded-lg border border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-cyber-primary mb-1">{product.name}</h3>
                {product.tagline && (
                  <p className="text-sm text-cyber-secondary mb-1">{product.tagline}</p>
                )}
                <p className="text-sm text-gray-400 mb-2">{product.description}</p>
                <div className="flex flex-wrap gap-2">
                  {product.price_monthly > 0 && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      ${product.price_monthly}/mo
                    </span>
                  )}
                  {product.featured && (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      ⭐ Featured
                    </span>
                  )}
                  {product.active ? (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => startEdit(product)}
                  className="px-3 py-1 bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No products yet. Create your first one!
        </div>
      )}
    </div>
  );
}
