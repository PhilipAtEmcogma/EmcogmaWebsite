'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Comment {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export default function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [formData, setFormData] = useState<Partial<Comment>>({
    author_name: '',
    content: '',
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;
      await fetchComments();
    } catch (error: any) {
      console.error('Error approving comment:', error);
      alert('Error: ' + (error.message || 'Failed to approve comment'));
    }
  }

  async function handleUnapprove(id: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: false })
        .eq('id', id);

      if (error) throw error;
      await fetchComments();
    } catch (error: any) {
      console.error('Error unapproving comment:', error);
      alert('Error: ' + (error.message || 'Failed to unapprove comment'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);

      if (error) throw error;
      await fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      alert('Error: ' + (error.message || 'Failed to delete comment'));
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!editingComment) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          author_name: formData.author_name,
          content: formData.content,
        })
        .eq('id', editingComment.id);

      if (error) throw error;
      await fetchComments();
      setEditingComment(null);
    } catch (error: any) {
      console.error('Error updating comment:', error);
      alert('Error: ' + (error.message || 'Failed to update comment'));
    }
  }

  function startEdit(comment: Comment) {
    setEditingComment(comment);
    setFormData({
      author_name: comment.author_name,
      content: comment.content,
    });
  }

  const filteredComments = comments.filter((comment) => {
    if (filter === 'pending') return !comment.approved;
    if (filter === 'approved') return comment.approved;
    return true;
  });

  const pendingCount = comments.filter((c) => !c.approved).length;

  if (loading) {
    return <div className="text-center text-gray-400">Loading comments...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyber-primary">
          Comments ({comments.length})
          {pendingCount > 0 && (
            <span className="ml-2 text-lg text-yellow-400">
              • {pendingCount} pending
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'all'
                ? 'bg-cyber-primary text-cyber-darker'
                : 'bg-cyber-darker/50 text-gray-400 hover:bg-cyber-darker'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'pending'
                ? 'bg-cyber-primary text-cyber-darker'
                : 'bg-cyber-darker/50 text-gray-400 hover:bg-cyber-darker'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'approved'
                ? 'bg-cyber-primary text-cyber-darker'
                : 'bg-cyber-darker/50 text-gray-400 hover:bg-cyber-darker'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {editingComment && (
        <div className="mb-8 p-6 bg-cyber-darker/50 rounded-lg border border-cyber-primary/30">
          <h3 className="text-xl font-bold text-cyber-secondary mb-4">Edit Comment</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Author Name</label>
              <input
                type="text"
                required
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="input-cyber w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input-cyber w-full h-32"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-cyber px-6 py-2">
                Update Comment
              </button>
              <button
                type="button"
                onClick={() => setEditingComment(null)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div
            key={comment.id}
            className={`p-4 rounded-lg border transition-colors ${
              comment.approved
                ? 'bg-cyber-darker/30 border-cyber-primary/20 hover:border-cyber-primary/40'
                : 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-cyber-primary">{comment.author_name}</span>
                  {comment.approved ? (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      ⏳ Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {comment.author_email} • {new Date(comment.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Post: {comment.post_slug}</p>
              </div>
              <div className="flex gap-2">
                {!comment.approved ? (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm transition-colors"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnapprove(comment.id)}
                    className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded text-sm transition-colors"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  onClick={() => startEdit(comment)}
                  className="px-3 py-1 bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          {filter === 'pending' && 'No pending comments.'}
          {filter === 'approved' && 'No approved comments yet.'}
          {filter === 'all' && 'No comments yet.'}
        </div>
      )}
    </div>
  );
}
