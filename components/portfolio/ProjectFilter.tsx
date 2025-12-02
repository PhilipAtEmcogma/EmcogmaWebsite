'use client';

import { useState } from 'react';

interface ProjectFilterProps {
  categories: string[];
}

export default function ProjectFilter({ categories }: ProjectFilterProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="mb-12 flex flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-4 py-2 font-mono text-sm transition-all duration-300 rounded ${
            activeCategory === category
              ? 'bg-cyber-primary text-cyber-dark border border-cyber-primary'
              : 'text-cyber-primary border border-cyber-primary/30 hover:border-cyber-primary'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
