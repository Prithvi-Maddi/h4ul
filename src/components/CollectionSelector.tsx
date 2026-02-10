'use client';

import { useState, useEffect } from 'react';
import { Check, Plus } from 'lucide-react';
import { Collection } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCollections, createCollection } from '@/lib/firestore';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CollectionSelectorProps {
  selectedCollections: string[];
  onCollectionsChange: (collectionIds: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CollectionSelector({
  selectedCollections,
  onCollectionsChange,
  isOpen,
  onClose
}: CollectionSelectorProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadCollections();
    }
  }, [isOpen, user]);

  const loadCollections = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userCollections = await getUserCollections(user.uid);
      // Filter out wishlist from selection
      setCollections(userCollections.filter((c) => !c.isWishlist));
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (collectionId: string) => {
    if (selectedCollections.includes(collectionId)) {
      onCollectionsChange(selectedCollections.filter((id) => id !== collectionId));
    } else {
      onCollectionsChange([...selectedCollections, collectionId]);
    }
  };

  const handleCreateCollection = async () => {
    if (!user || !newCollectionName.trim()) return;

    setCreating(true);
    try {
      const newCollection = await createCollection(user.uid, {
        name: newCollectionName.trim()
      });
      setCollections([newCollection, ...collections]);
      onCollectionsChange([...selectedCollections, newCollection.collectionId]);
      setNewCollectionName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Collection">
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Create new collection */}
        {showCreateForm ? (
          <div className="flex gap-2 mb-4">
            <Input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              maxLength={50}
              className="flex-1"
            />
            <Button
              onClick={handleCreateCollection}
              loading={creating}
              disabled={!newCollectionName.trim()}
              size="sm"
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateForm(false);
                setNewCollectionName('');
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-50 text-left mb-2"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-900">Create new collection</span>
          </button>
        )}

        {/* Collections list */}
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : collections.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No collections yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-1">
            {collections.map((collection) => (
              <button
                key={collection.collectionId}
                onClick={() => toggleCollection(collection.collectionId)}
                className={cn(
                  'flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors',
                  selectedCollections.includes(collection.collectionId) && 'bg-purple-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{collection.postIds.length}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{collection.name}</p>
                    <p className="text-xs text-gray-500">
                      {collection.postIds.length} items
                    </p>
                  </div>
                </div>
                {selectedCollections.includes(collection.collectionId) && (
                  <Check className="w-5 h-5 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Button fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
