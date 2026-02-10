import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserInput, Post, PostInput, Collection, CollectionInput, Like, Follow } from '@/types';
import { generateId } from './utils';

// ============ USER OPERATIONS ============

export async function getUserByUid(uid: string): Promise<User | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as User;
  }
  return null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return user === null;
}

export async function createUser(uid: string, email: string, input: UserInput): Promise<User> {
  const now = Timestamp.now();
  const user: User = {
    uid,
    email,
    username: input.username.toLowerCase(),
    displayName: input.displayName,
    bio: input.bio || '',
    profilePhotoUrl: input.profilePhotoUrl || '',
    isPrivate: input.isPrivate || false,
    followerCount: 0,
    followingCount: 0,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'users', uid), user);
  return user;
}

export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

// ============ POST OPERATIONS ============

export async function createPost(userId: string, input: PostInput): Promise<Post> {
  const postId = generateId();
  const now = Timestamp.now();
  const post: Post = {
    postId,
    userId,
    imageUrl: input.imageUrl,
    caption: input.caption || '',
    tags: input.tags || [],
    collectionIds: input.collectionIds || [],
    isPrivate: input.isPrivate || false,
    likeCount: 0,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'posts', postId), post);

  // Add post to collections if any
  for (const collectionId of post.collectionIds) {
    await addPostToCollection(collectionId, postId);
  }

  return post;
}

export async function getPost(postId: string): Promise<Post | null> {
  const docRef = doc(db, 'posts', postId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Post;
  }
  return null;
}

export async function getUserPosts(
  userId: string,
  lastDoc?: DocumentSnapshot,
  pageSize: number = 20
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  ];

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, 'posts'), ...constraints);
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => doc.data() as Post);
  const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { posts, lastDoc: newLastDoc };
}

export async function getPublicPosts(
  lastDoc?: DocumentSnapshot,
  pageSize: number = 20,
  tagFilter?: string
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where('isPrivate', '==', false),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  ];

  if (tagFilter) {
    constraints.unshift(where('tags', 'array-contains', tagFilter));
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, 'posts'), ...constraints);
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => doc.data() as Post);
  const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { posts, lastDoc: newLastDoc };
}

export async function getFeedPosts(
  userId: string,
  followingIds: string[],
  lastDoc?: DocumentSnapshot,
  pageSize: number = 20
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  if (followingIds.length === 0) {
    return { posts: [], lastDoc: null };
  }

  // Firestore 'in' query is limited to 30 items
  const limitedFollowingIds = followingIds.slice(0, 30);

  const constraints: QueryConstraint[] = [
    where('userId', 'in', limitedFollowingIds),
    where('isPrivate', '==', false),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  ];

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, 'posts'), ...constraints);
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => doc.data() as Post);
  const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { posts, lastDoc: newLastDoc };
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', postId));
}

// ============ COLLECTION OPERATIONS ============

export async function createCollection(userId: string, input: CollectionInput, isWishlist: boolean = false): Promise<Collection> {
  const collectionId = generateId();
  const now = Timestamp.now();
  const coll: Collection = {
    collectionId,
    userId,
    name: input.name,
    isPrivate: input.isPrivate || false,
    isWishlist,
    postIds: [],
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'collections', collectionId), coll);
  return coll;
}

export async function createWishlistCollection(userId: string): Promise<Collection> {
  return createCollection(userId, { name: 'My Wishlist', isPrivate: true }, true);
}

export async function getCollection(collectionId: string): Promise<Collection | null> {
  const docRef = doc(db, 'collections', collectionId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Collection;
  }
  return null;
}

export async function getUserCollections(userId: string): Promise<Collection[]> {
  const q = query(
    collection(db, 'collections'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as Collection);
}

export async function getUserWishlist(userId: string): Promise<Collection | null> {
  const q = query(
    collection(db, 'collections'),
    where('userId', '==', userId),
    where('isWishlist', '==', true)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Collection;
  }
  return null;
}

export async function addPostToCollection(collectionId: string, postId: string): Promise<void> {
  const collectionRef = doc(db, 'collections', collectionId);
  await updateDoc(collectionRef, {
    postIds: arrayUnion(postId),
    updatedAt: Timestamp.now()
  });
}

export async function removePostFromCollection(collectionId: string, postId: string): Promise<void> {
  const collectionRef = doc(db, 'collections', collectionId);
  await updateDoc(collectionRef, {
    postIds: arrayRemove(postId),
    updatedAt: Timestamp.now()
  });
}

export async function updateCollection(collectionId: string, updates: Partial<Collection>): Promise<void> {
  const collectionRef = doc(db, 'collections', collectionId);
  await updateDoc(collectionRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await deleteDoc(doc(db, 'collections', collectionId));
}

// ============ LIKE OPERATIONS ============

export function getLikeId(userId: string, postId: string): string {
  return `${userId}_${postId}`;
}

export async function likePost(userId: string, postId: string): Promise<void> {
  const likeId = `${userId}_${postId}`;
  const like: Like = {
    likeId,
    userId,
    postId,
    createdAt: Timestamp.now()
  };

  await setDoc(doc(db, 'likes', likeId), like);
  await updateDoc(doc(db, 'posts', postId), {
    likeCount: increment(1)
  });
}

export async function unlikePost(userId: string, postId: string): Promise<void> {
  const likeId = `${userId}_${postId}`;
  await deleteDoc(doc(db, 'likes', likeId));
  await updateDoc(doc(db, 'posts', postId), {
    likeCount: increment(-1)
  });
}

export async function isPostLiked(userId: string, postId: string): Promise<boolean> {
  const likeId = `${userId}_${postId}`;
  const docRef = doc(db, 'likes', likeId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function getPostLikes(postId: string): Promise<string[]> {
  const q = query(collection(db, 'likes'), where('postId', '==', postId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => (doc.data() as Like).userId);
}

// ============ FOLLOW OPERATIONS ============

export function getFollowId(followerId: string, followingId: string): string {
  return `${followerId}_${followingId}`;
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  const followId = `${followerId}_${followingId}`;
  const follow: Follow = {
    followId,
    followerId,
    followingId,
    createdAt: Timestamp.now()
  };

  await setDoc(doc(db, 'follows', followId), follow);

  // Update counts
  await updateDoc(doc(db, 'users', followerId), {
    followingCount: increment(1)
  });
  await updateDoc(doc(db, 'users', followingId), {
    followerCount: increment(1)
  });
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const followId = `${followerId}_${followingId}`;
  await deleteDoc(doc(db, 'follows', followId));

  // Update counts
  await updateDoc(doc(db, 'users', followerId), {
    followingCount: increment(-1)
  });
  await updateDoc(doc(db, 'users', followingId), {
    followerCount: increment(-1)
  });
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const followId = `${followerId}_${followingId}`;
  const docRef = doc(db, 'follows', followId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function getFollowers(userId: string): Promise<string[]> {
  const q = query(collection(db, 'follows'), where('followingId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => (doc.data() as Follow).followerId);
}

export async function getFollowing(userId: string): Promise<string[]> {
  const q = query(collection(db, 'follows'), where('followerId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => (doc.data() as Follow).followingId);
}

// ============ SEARCH OPERATIONS ============

export async function searchUsers(searchTerm: string, limitResults: number = 20): Promise<User[]> {
  const searchLower = searchTerm.toLowerCase();
  const q = query(
    collection(db, 'users'),
    where('username', '>=', searchLower),
    where('username', '<=', searchLower + '\uf8ff'),
    limit(limitResults)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as User);
}

// ============ REPORT OPERATIONS ============

export async function createReport(
  reporterId: string,
  postId: string,
  reason: 'inappropriate' | 'spam' | 'harassment'
): Promise<void> {
  const reportId = generateId();
  await setDoc(doc(db, 'reports', reportId), {
    reportId,
    reporterId,
    postId,
    reason,
    status: 'pending',
    createdAt: Timestamp.now()
  });
}
