'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  read_time: string;
  tags: string[];
  category: string;
  image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Article>>({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    author: 'Emcogma',
    read_time: '',
    tags: [],
    category: '',
    image_url: '',
    published: false,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update(formData)
          .eq('id', editingArticle.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').insert([formData]);

        if (error) throw error;
      }

      await fetchArticles();
      resetForm();
    } catch (error: any) {
      console.error('Error saving article:', error);
      alert('Error: ' + (error.message || 'Failed to save article'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);

      if (error) throw error;
      await fetchArticles();
    } catch (error: any) {
      console.error('Error deleting article:', error);
      alert('Error: ' + (error.message || 'Failed to delete article'));
    }
  }

  function startEdit(article: Article) {
    setEditingArticle(article);
    setFormData(article);
    setIsCreating(true);
  }

  function resetForm() {
    setEditingArticle(null);
    setIsCreating(false);
    setFormData({
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      author: 'Emcogma',
      read_time: '',
      tags: [],
      category: '',
      image_url: '',
      published: false,
    });
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading articles...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyber-primary">Articles ({articles.length})</h2>
        <button onClick={() => setIsCreating(true)} className="btn-cyber px-6 py-2">
          + New Article
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 bg-cyber-darker/50 rounded-lg border border-cyber-primary/30">
          <h3 className="text-xl font-bold text-cyber-secondary mb-4">
            {editingArticle ? 'Edit Article' : 'Create New Article'}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="input-cyber w-full h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content (Markdown) *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input-cyber w-full h-64 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Read Time</label>
                <input
                  type="text"
                  value={formData.read_time}
                  onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                  className="input-cyber w-full"
                  placeholder="5 min read"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-cyber w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map((t) => t.trim()),
                  })
                }
                className="input-cyber w-full"
              />
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

            <div className="flex gap-3">
              <button type="submit" className="btn-cyber px-6 py-2">
                {editingArticle ? 'Update Article' : 'Create Article'}
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
        {articles.map((article) => (
          <div
            key={article.id}
            className="p-4 bg-cyber-darker/30 rounded-lg border border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-cyber-primary mb-1">{article.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{article.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {article.category && (
                    <span className="text-xs px-2 py-1 bg-cyber-primary/20 text-cyber-primary rounded">
                      {article.category}
                    </span>
                  )}
                  {article.published ? (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      Draft
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => startEdit(article)}
                  className="px-3 py-1 bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No articles yet. Create your first one!
        </div>
      )}
    </div>
  );
}
