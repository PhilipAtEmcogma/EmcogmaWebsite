'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import BlogPostsManager from '@/components/admin/BlogPostsManager';
import ProjectsManager from '@/components/admin/ProjectsManager';
import ArticlesManager from '@/components/admin/ArticlesManager';
import ProductsManager from '@/components/admin/ProductsManager';
import DemosManager from '@/components/admin/DemosManager';
import CommentsManager from '@/components/admin/CommentsManager';

type Tab = 'blogs' | 'projects' | 'articles' | 'products' | 'demos' | 'comments';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('blogs');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-darker flex items-center justify-center">
        <div className="text-cyber-primary text-xl">Loading...</div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'blogs', label: 'Blog Posts', icon: '📝' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'articles', label: 'Articles', icon: '📄' },
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'demos', label: 'Demos', icon: '🎮' },
    { id: 'comments', label: 'Comments', icon: '💬' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-darker">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cyber-darker/95 backdrop-blur-sm border-b border-cyber-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-primary hover:text-cyber-secondary transition-colors text-sm"
              >
                View Site →
              </a>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm border border-red-500/30"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyber-primary text-cyber-darker shadow-lg shadow-cyber-primary/50'
                  : 'bg-cyber-darker/50 text-gray-400 hover:bg-cyber-darker hover:text-cyber-primary border border-cyber-primary/20'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card-cyber p-6">
          {activeTab === 'blogs' && <BlogPostsManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'articles' && <ArticlesManager />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'demos' && <DemosManager />}
          {activeTab === 'comments' && <CommentsManager />}
        </div>
      </div>
    </div>
  );
}
