'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  postSlug: string;
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ author_name: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch approved comments on component mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        // Only log error details in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching comments:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postSlug,
          author: newComment.author_name,
          content: newComment.content,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setNewComment({ author_name: '', content: '' });
        // Note: New comment won't appear immediately as it needs admin approval
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit comment. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold font-mono neon-text-green mb-8">
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="card-cyber mb-8">
        <h3 className="font-mono text-cyber-primary mb-4">Leave a Comment</h3>

        <div className="mb-4">
          <label htmlFor="author_name" className="block text-sm font-mono text-foreground/60 mb-2">
            Name
          </label>
          <input
            type="text"
            id="author_name"
            value={newComment.author_name}
            onChange={(e) => setNewComment({ ...newComment, author_name: e.target.value })}
            required
            className="w-full input-cyber"
            placeholder="Your name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-mono text-foreground/60 mb-2">
            Comment
          </label>
          <textarea
            id="content"
            value={newComment.content}
            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
            required
            rows={4}
            className="w-full input-cyber resize-none"
            placeholder="Share your thoughts..."
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="mb-4 p-4 bg-cyber-accent/10 border border-cyber-accent rounded-lg">
            <p className="text-cyber-accent text-sm">
              ✓ Comment submitted! It will appear after admin approval.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-cyber disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-foreground/60">Loading comments...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="card-cyber">
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center font-mono font-bold text-cyber-dark mr-3 flex-shrink-0">
                  {comment.author_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">{comment.author_name}</span>
                    <time className="text-xs text-foreground/40 font-mono">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="text-foreground/80">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12 text-foreground/40">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
