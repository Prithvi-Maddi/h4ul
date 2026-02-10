'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PREDEFINED_TAGS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 10
}: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const tag = customTag.toLowerCase().trim();
    if (tag && !selectedTags.includes(tag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
      setCustomTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Categories */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.categories.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Vibes */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Vibe</p>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.vibes.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Seasons */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Season</p>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.seasons.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Custom Tag</p>
        <div className="flex gap-2">
          <Input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add custom tag..."
            className="flex-1"
          />
          <button
            onClick={addCustomTag}
            disabled={!customTag.trim() || selectedTags.length >= maxTags}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {selectedTags.length}/{maxTags} tags selected
        </p>
      </div>
    </div>
  );
}
