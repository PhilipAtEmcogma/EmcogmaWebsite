'use client';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
        break;
    }
  };

  return (
    <div className="border-t border-b border-cyber-primary/20 py-8 mb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <span className="font-mono text-foreground/60">Share this article:</span>
        <div className="flex gap-4">
          <button
            onClick={() => handleShare('twitter')}
            className="px-4 py-2 border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded font-mono text-sm"
          >
            Twitter
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="px-4 py-2 border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded font-mono text-sm"
          >
            LinkedIn
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="px-4 py-2 border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded font-mono text-sm"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
