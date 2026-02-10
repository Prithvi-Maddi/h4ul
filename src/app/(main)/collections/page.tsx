'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUserCollections, useCollectionMutations } from '@/hooks/useCollections';
import { CollectionCard } from '@/components/CollectionCard';
import { CollectionCardSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getPost } from '@/lib/firestore';
import { useEffect } from 'react';

export default function CollectionsPage() {
  const { collections, loading, refresh } = useUserCollections();
  const { create } = useCollectionMutations();
  const { showToast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});

  // Load cover images
  useEffect(() => {
    const loadCoverImages = async () => {
      const images: Record<string, string> = {};
      for (const collection of collections) {
        if (collection.postIds.length > 0) {
          const post = await getPost(collection.postIds[0]);
          if (post) {
            images[collection.collectionId] = post.imageUrl;
          }
        }
      }
      setCoverImages(images);
    };

    if (collections.length > 0) {
      loadCoverImages();
    }
  }, [collections]);

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      await create(newCollectionName.trim());
      showToast('Collection created!', 'success');
      setNewCollectionName('');
      setShowCreateModal(false);
      refresh();
    } catch (error) {
      showToast('Failed to create collection', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Separate wishlist from other collections
  const wishlist = collections.find((c) => c.isWishlist);
  const otherCollections = collections.filter((c) => !c.isWishlist);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Collections</h1>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <CollectionCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Wishlist section */}
            {wishlist && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-3">Saved Items</h2>
                <div className="grid grid-cols-2 gap-4">
                  <CollectionCard
                    collection={wishlist}
                    coverImage={coverImages[wishlist.collectionId]}
                  />
                </div>
              </div>
            )}

            {/* Other collections */}
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-3">My Collections</h2>
              {otherCollections.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600 mb-4">No collections yet</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create your first collection
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {otherCollections.map((collection) => (
                    <CollectionCard
                      key={collection.collectionId}
                      collection={collection}
                      coverImage={coverImages[collection.collectionId]}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Collection"
      >
        <div className="p-4 space-y-4">
          <Input
            label="Collection Name"
            placeholder="e.g., Summer Fits"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            maxLength={50}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleCreate}
              loading={creating}
              disabled={!newCollectionName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
