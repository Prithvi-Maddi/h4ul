'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Bookmark, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePost } from '@/hooks/usePosts';
import { FeedPostSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  likePost,
  unlikePost,
  deletePost,
  addPostToCollection,
  removePostFromCollection,
  getUserWishlist,
  createReport
} from '@/lib/firestore';
import { formatRelativeTime, cn } from '@/lib/utils';

interface PostDetailPageProps {
  params: { id: string };
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { post, loading, error } = usePost(params.id);
  const { showToast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when post loads
  useState(() => {
    if (post) {
      setIsLiked(post.isLiked || false);
      setIsSaved(post.isSaved || false);
      setLikeCount(post.likeCount);
    }
  });

  const isOwner = user?.uid === post?.userId;

  const handleLike = async () => {
    if (!user || !post || isLiking) return;

    setIsLiking(true);
    const newLiked = !isLiked;

    setIsLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));

    try {
      if (newLiked) {
        await likePost(user.uid, post.postId);
      } else {
        await unlikePost(user.uid, post.postId);
      }
    } catch (error) {
      setIsLiked(!newLiked);
      setLikeCount((prev) => prev + (newLiked ? -1 : 1));
      showToast('Failed to update like', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!user || !post || isSaving) return;

    setIsSaving(true);
    const newSaved = !isSaved;
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
      setIsSaved(!newSaved);
      showToast('Failed to update wishlist', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    setDeleting(true);
    try {
      await deletePost(post.postId);
      showToast('Post deleted', 'success');
      router.push('/wardrobe');
    } catch (error) {
      showToast('Failed to delete post', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleReport = async (reason: 'inappropriate' | 'spam' | 'harassment') => {
    if (!user || !post) return;

    try {
      await createReport(user.uid, post.postId, reason);
      showToast('Report submitted', 'success');
      setShowReportModal(false);
    } catch (error) {
      showToast('Failed to submit report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <header className="sticky top-0 bg-white border-b px-4 py-3 z-10">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>
        <FeedPostSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <p className="text-gray-600 mb-4">{error || 'Post not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Post</h1>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 -mr-1 hover:bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[150px] z-20">
              {isOwner ? (
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/${post.user.username}`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {post.user.profilePhotoUrl ? (
              <Image
                src={post.user.profilePhotoUrl}
                alt={post.user.username}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-medium">
                  {post.user.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </Link>
        <Link href={`/profile/${post.user.username}`}>
          <p className="font-semibold">{post.user.username}</p>
        </Link>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={post.imageUrl}
          alt={post.caption || 'Post image'}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="p-1 -ml-1 transition-transform active:scale-125"
            >
              <Heart
                className={cn(
                  'w-7 h-7 transition-colors',
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-800'
                )}
              />
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 -mr-1"
          >
            <Bookmark
              className={cn(
                'w-7 h-7 transition-colors',
                isSaved ? 'fill-gray-800 text-gray-800' : 'text-gray-800'
              )}
            />
          </button>
        </div>

        <p className="font-semibold">{likeCount} likes</p>

        {/* Caption */}
        {post.caption && (
          <p className="mt-2">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-semibold mr-1"
            >
              {post.user.username}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${tag}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-3">
          {formatRelativeTime(post.createdAt)}
        </p>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post"
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Post"
      >
        <div className="py-2">
          <p className="px-4 pb-3 text-sm text-gray-600">
            Why are you reporting this post?
          </p>
          <button
            onClick={() => handleReport('inappropriate')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t"
          >
            Inappropriate content
          </button>
          <button
            onClick={() => handleReport('spam')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t"
          >
            Spam
          </button>
          <button
            onClick={() => handleReport('harassment')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t"
          >
            Harassment
          </button>
        </div>
      </Modal>
    </div>
  );
}
