'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useExplorePosts } from '@/hooks/usePosts';
import { useUserSearch } from '@/hooks/useUsers';
import { FeedPostCard } from '@/components/FeedPostCard';
import { UserCard } from '@/components/UserCard';
import { FeedPostSkeleton } from '@/components/ui/Skeleton';
import { ALL_TAGS } from '@/lib/constants';

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  const [selectedTag, setSelectedTag] = useState<string | undefined>(tagParam || undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);

  const { posts, loading, hasMore, loadMore, refresh } = useExplorePosts(selectedTag);
  const { users, loading: searchLoading } = useUserSearch(searchQuery);

  // Update URL when tag changes
  useEffect(() => {
    if (selectedTag) {
      router.push(`/explore?tag=${selectedTag}`, { scroll: false });
    } else {
      router.push('/explore', { scroll: false });
    }
  }, [selectedTag, router]);

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

  const clearTag = () => {
    setSelectedTag(undefined);
    refresh();
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Explore</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowUserSearch(e.target.value.length > 0);
            }}
            onFocus={() => searchQuery && setShowUserSearch(true)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowUserSearch(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* User search results */}
        {showUserSearch && (
          <div className="absolute left-0 right-0 top-full bg-white border-b shadow-lg max-h-64 overflow-y-auto z-20">
            <div className="px-4 py-2">
              {searchLoading ? (
                <p className="text-sm text-gray-500 py-2">Searching...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No users found</p>
              ) : (
                users.map((user) => (
                  <UserCard
                    key={user.uid}
                    user={user}
                    showFollowButton={false}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Tag filters */}
        <div className="mt-3 -mx-4 px-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 pb-1">
            {selectedTag && (
              <button
                onClick={clearTag}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium shrink-0"
              >
                {selectedTag}
                <X className="w-3 h-3" />
              </button>
            )}
            {ALL_TAGS.filter((tag) => tag !== selectedTag).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Posts */}
      <div className="divide-y" onClick={() => setShowUserSearch(false)}>
        {loading && posts.length === 0 ? (
          <>
            <FeedPostSkeleton />
            <FeedPostSkeleton />
            <FeedPostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p>No posts found</p>
            {selectedTag && (
              <button
                onClick={clearTag}
                className="mt-2 text-purple-600 hover:text-purple-700"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <FeedPostCard key={post.postId} post={post} />
          ))
        )}

        {loading && posts.length > 0 && (
          <div className="py-4">
            <FeedPostSkeleton />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="py-8 text-center text-gray-500">
            No more posts
          </div>
        )}
      </div>
    </div>
  );
}
