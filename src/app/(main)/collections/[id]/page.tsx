'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreHorizontal, Lock, Trash2, Edit2 } from 'lucide-react';
import { useCollection, useCollectionMutations } from '@/hooks/useCollections';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';

interface CollectionDetailPageProps {
  params: { id: string };
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { collection, posts, loading, error, refresh } = useCollection(params.id);
  const { update, remove } = useCollectionMutations();
  const { showToast } = useToast();

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.uid === collection?.userId;
  const canDelete = isOwner && !collection?.isWishlist;

  const handleEdit = async () => {
    if (!editName.trim() || !collection) return;

    setUpdating(true);
    try {
      await update(collection.collectionId, { name: editName.trim() });
      showToast('Collection updated', 'success');
      setShowEditModal(false);
      refresh();
    } catch (error) {
      showToast('Failed to update collection', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!collection) return;

    setDeleting(true);
    try {
      await remove(collection.collectionId);
      showToast('Collection deleted', 'success');
      router.push('/collections');
    } catch (error) {
      showToast('Failed to delete collection', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = () => {
    setEditName(collection?.name || '');
    setShowEditModal(true);
    setShowMenu(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </header>
        <div className="p-2 grid grid-cols-3 gap-1">
          {[...Array(6)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-gray-600 mb-4">{error || 'Collection not found'}</p>
        <Button onClick={() => router.push('/collections')}>
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{collection.name}</h1>
                {collection.isPrivate && (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {posts.length} {posts.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[150px] z-20">
                  <button
                    onClick={openEditModal}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  {canDelete && (
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
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Posts */}
      <div className="p-2">
        {posts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No items in this collection yet
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <PostCard key={post.postId} post={post} showOverlay />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Collection"
      >
        <div className="p-4 space-y-4">
          <Input
            label="Collection Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            maxLength={50}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleEdit}
              loading={updating}
              disabled={!editName.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Collection"
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete &ldquo;{collection.name}&rdquo;? This action cannot be undone.
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
    </div>
  );
}
