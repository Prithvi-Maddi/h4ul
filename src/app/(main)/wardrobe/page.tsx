'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Filter, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ALL_TAGS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function WardrobePage() {
  const { user } = useAuth();
  const { posts, loading, hasMore, loadMore } = useUserPosts(user?.uid);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort posts
  const filteredPosts = posts
    .filter((post) => !selectedTag || post.tags.includes(selectedTag))
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      } else if (sortBy === 'oldest') {
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      } else {
        return b.likeCount - a.likeCount;
      }
    });

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 500
    ) {
      if (hasMore && !loading) {
        loadMore();
      }
    }
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">My Wardrobe</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2 rounded-full transition-colors',
                showFilters ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
            <Link href="/create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="py-3 space-y-3 border-t">
            {/* Sort */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Sort by</p>
              <div className="flex gap-2">
                {(['newest', 'oldest', 'likes'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                      sortBy === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {option === 'likes' ? 'Most liked' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Filter by tag</p>
              <div className="flex flex-wrap gap-2">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium"
                  >
                    {selectedTag}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {ALL_TAGS.filter((tag) => tag !== selectedTag).slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Posts Grid */}
      <div className="p-2">
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            {posts.length === 0 ? (
              <>
                <p className="text-gray-600 mb-4">
                  You haven&apos;t posted anything yet
                </p>
                <Link href="/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-1" />
                    Add your first item
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">No posts match this filter</p>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Clear filter
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1">
              {filteredPosts.map((post) => (
                <PostCard key={post.postId} post={post} showOverlay />
              ))}
            </div>

            {loading && (
              <div className="grid grid-cols-3 gap-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!hasMore && filteredPosts.length > 0 && (
              <p className="py-8 text-center text-gray-500 text-sm">
                {filteredPosts.length} items in your wardrobe
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
