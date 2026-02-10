'use client';

import { useState, useEffect, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { Post, PostWithUser, User } from '@/types';
import {
  getUserPosts,
  getPublicPosts,
  getFeedPosts,
  getPost,
  getUserByUid,
  isPostLiked,
  getUserWishlist,
  getFollowing
} from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (refresh = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      const result = await getUserPosts(userId, refresh ? undefined : lastDoc || undefined);

      if (refresh) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 20);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, lastDoc]);

  useEffect(() => {
    loadPosts(true);
  }, [userId]);

  return { posts, loading, error, hasMore, loadMore: () => loadPosts() };
}

export function useExplorePosts(tagFilter?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      const result = await getPublicPosts(
        refresh ? undefined : lastDoc || undefined,
        20,
        tagFilter
      );

      // Enrich with user data
      const enrichedPosts = await Promise.all(
        result.posts.map(async (post) => {
          const postUser = await getUserByUid(post.userId);
          const isLiked = user ? await isPostLiked(user.uid, post.postId) : false;

          let isSaved = false;
          if (user) {
            const wishlist = await getUserWishlist(user.uid);
            isSaved = wishlist?.postIds.includes(post.postId) || false;
          }

          return {
            ...post,
            user: postUser as User,
            isLiked,
            isSaved
          };
        })
      );

      if (refresh) {
        setPosts(enrichedPosts);
      } else {
        setPosts((prev) => [...prev, ...enrichedPosts]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 20);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [lastDoc, tagFilter, user]);

  useEffect(() => {
    setPosts([]);
    setLastDoc(null);
    loadPosts(true);
  }, [tagFilter]);

  return { posts, loading, error, hasMore, loadMore: () => loadPosts(), refresh: () => loadPosts(true) };
}

export function useFeedPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (refresh = false) => {
    if (!user) return;

    try {
      setLoading(true);

      // Get following list
      const followingIds = await getFollowing(user.uid);

      if (followingIds.length === 0) {
        setPosts([]);
        setHasMore(false);
        return;
      }

      const result = await getFeedPosts(
        user.uid,
        followingIds,
        refresh ? undefined : lastDoc || undefined
      );

      // Enrich with user data
      const enrichedPosts = await Promise.all(
        result.posts.map(async (post) => {
          const postUser = await getUserByUid(post.userId);
          const isLiked = await isPostLiked(user.uid, post.postId);
          const wishlist = await getUserWishlist(user.uid);
          const isSaved = wishlist?.postIds.includes(post.postId) || false;

          return {
            ...post,
            user: postUser as User,
            isLiked,
            isSaved
          };
        })
      );

      if (refresh) {
        setPosts(enrichedPosts);
      } else {
        setPosts((prev) => [...prev, ...enrichedPosts]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 20);
    } catch (err) {
      setError('Failed to load feed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, lastDoc]);

  useEffect(() => {
    if (user) {
      loadPosts(true);
    }
  }, [user]);

  return { posts, loading, error, hasMore, loadMore: () => loadPosts(), refresh: () => loadPosts(true) };
}

export function usePost(postId: string) {
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const postData = await getPost(postId);

        if (!postData) {
          setError('Post not found');
          return;
        }

        const postUser = await getUserByUid(postData.userId);
        const isLiked = user ? await isPostLiked(user.uid, postId) : false;

        let isSaved = false;
        if (user) {
          const wishlist = await getUserWishlist(user.uid);
          isSaved = wishlist?.postIds.includes(postId) || false;
        }

        setPost({
          ...postData,
          user: postUser as User,
          isLiked,
          isSaved
        });
      } catch (err) {
        setError('Failed to load post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId, user]);

  return { post, loading, error };
}
