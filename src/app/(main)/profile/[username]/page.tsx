'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Grid, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useFollowersList, useFollowingList } from '@/hooks/useUsers';
import { useUserPosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/PostCard';
import { UserCard } from '@/components/UserCard';
import { PostCardSkeleton, ProfileSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { followUser, unfollowUser } from '@/lib/firestore';
import { formatNumber } from '@/lib/utils';

interface ProfilePageProps {
  params: { username: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const { profile, isFollowingUser, setIsFollowingUser, loading: profileLoading } = useProfile(params.username);
  const { posts, loading: postsLoading } = useUserPosts(profile?.uid);
  const { followers } = useFollowersList(profile?.uid || '');
  const { following } = useFollowingList(profile?.uid || '');

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.uid === profile?.uid;

  const handleFollow = async () => {
    if (!currentUser || !profile || followLoading) return;

    setFollowLoading(true);
    const newFollowing = !isFollowingUser;

    // Optimistic update
    setIsFollowingUser(newFollowing);

    try {
      if (newFollowing) {
        await followUser(currentUser.uid, profile.uid);
      } else {
        await unfollowUser(currentUser.uid, profile.uid);
      }
    } catch (error) {
      // Revert on error
      setIsFollowingUser(!newFollowing);
      showToast('Failed to update follow status', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-gray-600 mb-4">User not found</p>
        <Button onClick={() => router.push('/explore')}>
          Back to Explore
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full md:hidden"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">{profile.username}</h1>
          {profile.isPrivate && <Lock className="w-4 h-4 text-gray-400" />}
        </div>
        {isOwnProfile && (
          <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5" />
          </Link>
        )}
      </header>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {profile.profilePhotoUrl ? (
              <Image
                src={profile.profilePhotoUrl}
                alt={profile.username}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-2xl">
                  {profile.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex gap-6 mb-3">
              <div className="text-center">
                <p className="font-semibold">{posts.length}</p>
                <p className="text-sm text-gray-500">posts</p>
              </div>
              <button
                onClick={() => setShowFollowers(true)}
                className="text-center"
              >
                <p className="font-semibold">{formatNumber(profile.followerCount)}</p>
                <p className="text-sm text-gray-500">followers</p>
              </button>
              <button
                onClick={() => setShowFollowing(true)}
                className="text-center"
              >
                <p className="font-semibold">{formatNumber(profile.followingCount)}</p>
                <p className="text-sm text-gray-500">following</p>
              </button>
            </div>

            {/* Action button */}
            {!isOwnProfile && (
              <Button
                variant={isFollowingUser ? 'outline' : 'primary'}
                size="sm"
                onClick={handleFollow}
                loading={followLoading}
                fullWidth
              >
                {isFollowingUser ? 'Following' : 'Follow'}
              </Button>
            )}
            {isOwnProfile && (
              <Link href="/settings">
                <Button variant="outline" size="sm" fullWidth>
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <p className="font-semibold">{profile.displayName}</p>
          {profile.bio && <p className="text-sm text-gray-600">{profile.bio}</p>}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="border-t">
        <div className="flex justify-center border-b">
          <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-purple-600 border-b-2 border-purple-600">
            <Grid className="w-4 h-4" />
            Posts
          </button>
        </div>

        <div className="p-1">
          {postsLoading ? (
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              {isOwnProfile ? (
                <>
                  <p className="mb-4">You haven&apos;t posted anything yet</p>
                  <Link href="/create">
                    <Button>Create your first post</Button>
                  </Link>
                </>
              ) : (
                <p>No posts yet</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <PostCard key={post.postId} post={post} showOverlay />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      <Modal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
      >
        <div className="p-4 max-h-96 overflow-y-auto">
          {followers.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No followers yet</p>
          ) : (
            followers.map((follower) => (
              <UserCard key={follower.uid} user={follower} />
            ))
          )}
        </div>
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
      >
        <div className="p-4 max-h-96 overflow-y-auto">
          {following.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Not following anyone yet</p>
          ) : (
            following.map((followedUser) => (
              <UserCard key={followedUser.uid} user={followedUser} />
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
