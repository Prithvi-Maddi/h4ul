'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import {
  getUserByUsername,
  getUserByUid,
  searchUsers,
  isFollowing,
  getFollowers,
  getFollowing
} from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile(username: string) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await getUserByUsername(username);

      if (!userData) {
        setError('User not found');
        return;
      }

      setProfile(userData);

      // Check if current user is following this profile
      if (currentUser && currentUser.uid !== userData.uid) {
        const following = await isFollowing(currentUser.uid, userData.uid);
        setIsFollowingUser(following);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, isFollowingUser, setIsFollowingUser, loading, error, refresh: loadProfile };
}

export function useFollowersList(userId: string) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFollowers = useCallback(async () => {
    try {
      setLoading(true);
      const followerIds = await getFollowers(userId);

      const followerUsers = await Promise.all(
        followerIds.map((id) => getUserByUid(id))
      );

      setFollowers(followerUsers.filter((u): u is User => u !== null));
    } catch (err) {
      setError('Failed to load followers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFollowers();
  }, [loadFollowers]);

  return { followers, loading, error, refresh: loadFollowers };
}

export function useFollowingList(userId: string) {
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFollowing = useCallback(async () => {
    try {
      setLoading(true);
      const followingIds = await getFollowing(userId);

      const followingUsers = await Promise.all(
        followingIds.map((id) => getUserByUid(id))
      );

      setFollowing(followingUsers.filter((u): u is User => u !== null));
    } catch (err) {
      setError('Failed to load following');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);

  return { following, loading, error, refresh: loadFollowing };
}

export function useUserSearch(query: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const results = await searchUsers(query);
        setUsers(results);
      } catch (err) {
        setError('Failed to search users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { users, loading, error };
}
