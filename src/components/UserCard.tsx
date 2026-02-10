'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { followUser, unfollowUser } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface UserCardProps {
  user: User;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  onFollowChange?: (userId: string, following: boolean) => void;
}

export function UserCard({
  user,
  isFollowing: initialFollowing = false,
  showFollowButton = true,
  onFollowChange
}: UserCardProps) {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const isOwnProfile = currentUser?.uid === user.uid;

  const handleFollow = async () => {
    if (!currentUser || isLoading) return;

    setIsLoading(true);
    const newFollowing = !isFollowing;

    // Optimistic update
    setIsFollowing(newFollowing);

    try {
      if (newFollowing) {
        await followUser(currentUser.uid, user.uid);
      } else {
        await unfollowUser(currentUser.uid, user.uid);
      }
      onFollowChange?.(user.uid, newFollowing);
    } catch (error) {
      // Revert on error
      setIsFollowing(!newFollowing);
      showToast('Failed to update follow status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <Link href={`/profile/${user.username}`}>
        <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden">
          {user.profilePhotoUrl ? (
            <Image
              src={user.profilePhotoUrl}
              alt={user.username}
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-medium">
                {user.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.username}`}>
          <p className="font-semibold text-sm truncate">{user.username}</p>
        </Link>
        <p className="text-sm text-gray-500 truncate">{user.displayName}</p>
      </div>

      {showFollowButton && !isOwnProfile && (
        <Button
          variant={isFollowing ? 'outline' : 'primary'}
          size="sm"
          onClick={handleFollow}
          loading={isLoading}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
}
