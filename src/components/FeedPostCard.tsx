'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bookmark, MoreHorizontal } from 'lucide-react';
import { PostWithUser } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { likePost, unlikePost, addPostToCollection, removePostFromCollection, getUserWishlist } from '@/lib/firestore';
import { formatRelativeTime, truncateText, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface FeedPostCardProps {
  post: PostWithUser;
  onLikeChange?: (postId: string, liked: boolean) => void;
}

export function FeedPostCard({ post, onLikeChange }: FeedPostCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    const newLiked = !isLiked;

    // Optimistic update
    setIsLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));

    try {
      if (newLiked) {
        await likePost(user.uid, post.postId);
      } else {
        await unlikePost(user.uid, post.postId);
      }
      onLikeChange?.(post.postId, newLiked);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikeCount((prev) => prev + (newLiked ? -1 : 1));
      showToast('Failed to update like', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    const newSaved = !isSaved;

    // Optimistic update
    setIsSaved(newSaved);

    try {
      const wishlist = await getUserWishlist(user.uid);
      if (wishlist) {
        if (newSaved) {
          await addPostToCollection(wishlist.collectionId, post.postId);
          showToast('Saved to wishlist', 'success');
        } else {
          await removePostFromCollection(wishlist.collectionId, post.postId);
          showToast('Removed from wishlist', 'success');
        }
      }
    } catch (error) {
      // Revert on error
      setIsSaved(!newSaved);
      showToast('Failed to update wishlist', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const captionTruncated = post.caption && post.caption.length > 150;
  const displayCaption = showFullCaption
    ? post.caption
    : truncateText(post.caption, 150);

  return (
    <article className="bg-white border-b">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <Link
          href={`/profile/${post.user.username}`}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            {post.user.profilePhotoUrl ? (
              <Image
                src={post.user.profilePhotoUrl}
                alt={post.user.username}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-medium text-sm">
                  {post.user.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <span className="font-medium text-sm">{post.user.username}</span>
        </Link>

        <button className="p-1 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Image */}
      <Link href={`/post/${post.postId}`} className="block">
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
            priority
          />
        </div>
      </Link>

      {/* Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="p-1 -ml-1 transition-transform active:scale-125"
            >
              <Heart
                className={cn(
                  'w-6 h-6 transition-colors',
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-800'
                )}
              />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 -mr-1 transition-transform active:scale-110"
          >
            <Bookmark
              className={cn(
                'w-6 h-6 transition-colors',
                isSaved ? 'fill-gray-800 text-gray-800' : 'text-gray-800'
              )}
            />
          </button>
        </div>

        {/* Like count */}
        <p className="font-semibold text-sm mt-1">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mt-1">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-semibold mr-1"
            >
              {post.user.username}
            </Link>
            {displayCaption}
            {captionTruncated && !showFullCaption && (
              <button
                onClick={() => setShowFullCaption(true)}
                className="text-gray-500 ml-1"
              >
                more
              </button>
            )}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${tag}`}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-1">
          {formatRelativeTime(post.createdAt)}
        </p>
      </div>
    </article>
  );
}
