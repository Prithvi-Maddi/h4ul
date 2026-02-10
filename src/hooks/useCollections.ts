'use client';

import { useState, useEffect, useCallback } from 'react';
import { Collection, Post } from '@/types';
import {
  getUserCollections,
  getCollection,
  getPost,
  createCollection,
  updateCollection,
  deleteCollection,
  addPostToCollection,
  removePostFromCollection
} from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export function useUserCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userCollections = await getUserCollections(user.uid);
      setCollections(userCollections);
    } catch (err) {
      setError('Failed to load collections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return { collections, loading, error, refresh: loadCollections };
}

export function useCollection(collectionId: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      const collectionData = await getCollection(collectionId);

      if (!collectionData) {
        setError('Collection not found');
        return;
      }

      setCollection(collectionData);

      // Load posts in collection
      const collectionPosts = await Promise.all(
        collectionData.postIds.map(async (postId) => {
          const post = await getPost(postId);
          return post;
        })
      );

      setPosts(collectionPosts.filter((p): p is Post => p !== null));
    } catch (err) {
      setError('Failed to load collection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  return { collection, posts, loading, error, refresh: loadCollection };
}

export function useCollectionMutations() {
  const { user } = useAuth();

  const create = async (name: string, isPrivate: boolean = false) => {
    if (!user) throw new Error('Not authenticated');
    return createCollection(user.uid, { name, isPrivate });
  };

  const update = async (collectionId: string, updates: Partial<Collection>) => {
    return updateCollection(collectionId, updates);
  };

  const remove = async (collectionId: string) => {
    return deleteCollection(collectionId);
  };

  const addPost = async (collectionId: string, postId: string) => {
    return addPostToCollection(collectionId, postId);
  };

  const removePost = async (collectionId: string, postId: string) => {
    return removePostFromCollection(collectionId, postId);
  };

  return { create, update, remove, addPost, removePost };
}
