'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useFeedPosts } from '@/hooks/usePosts';
import { FeedPostCard } from '@/components/FeedPostCard';
import { FeedPostSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Compass, RefreshCw } from 'lucide-react';

export default function FeedPage() {
  const { posts, loading, error, hasMore, loadMore, refresh } = useFeedPosts();

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
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-600">h4ul</h1>
        <button
          onClick={refresh}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Feed */}
      <div className="divide-y">
        {loading && posts.length === 0 ? (
          // Loading skeleton
          <>
            <FeedPostSkeleton />
            <FeedPostSkeleton />
            <FeedPostSkeleton />
          </>
        ) : posts.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Your feed is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Follow other users to see their posts here
            </p>
            <Link href="/explore">
              <Button>Explore Posts</Button>
            </Link>
          </div>
        ) : (
          // Posts
          posts.map((post) => (
            <FeedPostCard key={post.postId} post={post} />
          ))
        )}

        {/* Loading more indicator */}
        {loading && posts.length > 0 && (
          <div className="py-4">
            <FeedPostSkeleton />
          </div>
        )}

        {/* End of feed */}
        {!hasMore && posts.length > 0 && (
          <div className="py-8 text-center text-gray-500">
            You&apos;re all caught up!
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="py-8 text-center text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
