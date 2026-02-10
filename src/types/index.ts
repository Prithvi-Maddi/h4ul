import { Timestamp } from 'firebase/firestore';

// User types
export interface User {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  profilePhotoUrl: string;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isAdmin?: boolean;
  isBanned?: boolean;
}

export interface UserInput {
  username: string;
  displayName: string;
  bio?: string;
  profilePhotoUrl?: string;
  isPrivate?: boolean;
}

// Post types
export interface Post {
  postId: string;
  userId: string;
  imageUrl: string;
  caption: string;
  tags: string[];
  collectionIds: string[];
  isPrivate: boolean;
  likeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PostInput {
  imageUrl: string;
  caption?: string;
  tags?: string[];
  collectionIds?: string[];
  isPrivate?: boolean;
}

// Collection types
export interface Collection {
  collectionId: string;
  userId: string;
  name: string;
  isPrivate: boolean;
  isWishlist: boolean;
  postIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CollectionInput {
  name: string;
  isPrivate?: boolean;
}

// Like types
export interface Like {
  likeId: string;
  userId: string;
  postId: string;
  createdAt: Timestamp;
}

// Follow types
export interface Follow {
  followId: string;
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

// Report types
export type ReportReason = 'inappropriate' | 'spam' | 'harassment';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned';

export interface Report {
  reportId: string;
  reporterId: string;
  postId: string;
  reason: ReportReason;
  status: ReportStatus;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

// UI Types
export interface PostWithUser extends Post {
  user: User;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface CollectionWithPosts extends Collection {
  posts: Post[];
  coverImageUrl?: string;
}
