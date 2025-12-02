'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Demo {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  code_url: string;
  live_url: string;
  thumbnail_url: string;
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function DemosManager() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDemo, setEditingDemo] = useState<Demo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Demo>>({
    slug: '',
    title: '',
    description: '',
    category: '',
    tech: [],
    code_url: '',
    live_url: '',
    thumbnail_url: '',
    featured: false,
    published: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchDemos();
  }, []);

  async function fetchDemos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('demos')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDemos(data || []);
    } catch (error) {
      console.error('Error fetching demos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingDemo) {
        const { error } = await supabase
          .from('demos')
          .update(formData)
          .eq('id', editingDemo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('demos').insert([formData]);

        if (error) throw error;
      }

      await fetchDemos();
      resetForm();
    } catch (error: any) {
      console.error('Error saving demo:', error);
      alert('Error: ' + (error.message || 'Failed to save demo'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this demo?')) return;

    try {
      const { error } = await supabase.from('demos').delete().eq('id', id);

      if (error) throw error;
      await fetchDemos();
    } catch (error: any) {
      console.error('Error deleting demo:', error);
      alert('Error: ' + (error.message || 'Failed to delete demo'));
    }
  }

  function startEdit(demo: Demo) {
    setEditingDemo(demo);
    setFormData(demo);
    setIsCreating(true);
  }

  function resetForm() {
    setEditingDemo(null);
    setIsCreating(false);
    setFormData({
      slug: '',
      title: '',
      description: '',
      category: '',
      tech: [],
      code_url: '',
      live_url: '',
      thumbnail_url: '',
      featured: false,
      published: false,
      display_order: 0,
    });
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading demos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyber-primary">Demos ({demos.length})</h2>
        <button onClick={() => setIsCreating(true)} className="btn-cyber px-6 py-2">
          + New Demo
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 bg-cyber-darker/50 rounded-lg border border-cyber-primary/30">
          <h3 className="text-xl font-bold text-cyber-secondary mb-4">
            {editingDemo ? 'Edit Demo' : 'Create New Demo'}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-cyber w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-cyber w-full h-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Code URL</label>
                <input
                  type="url"
                  value={formData.code_url}
                  onChange={(e) => setFormData({ ...formData, code_url: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Live URL</label>
                <input
                  type="url"
                  value={formData.live_url}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tech?.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tech: e.target.value.split(',').map((t) => t.trim()),
                  })
                }
                className="input-cyber w-full"
              />
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
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm text-gray-300">
                  Published
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
                {editingDemo ? 'Update Demo' : 'Create Demo'}
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
        {demos.map((demo) => (
          <div
            key={demo.id}
            className="p-4 bg-cyber-darker/30 rounded-lg border border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-cyber-primary mb-1">{demo.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{demo.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-cyber-primary/20 text-cyber-primary rounded">
                    {demo.category}
                  </span>
                  {demo.featured && (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      ⭐ Featured
                    </span>
                  )}
                  {demo.published ? (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      Draft
                    </span>
                  )}
                  {demo.tech?.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 bg-cyber-secondary/20 text-cyber-secondary rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => startEdit(demo)}
                  className="px-3 py-1 bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(demo.id)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {demos.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No demos yet. Create your first one!
        </div>
      )}
    </div>
  );
}
