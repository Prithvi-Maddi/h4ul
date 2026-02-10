'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
  showOverlay?: boolean;
}

export function PostCard({ post, showOverlay = false }: PostCardProps) {
  return (
    <Link
      href={`/post/${post.postId}`}
      className="block relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
    >
      <Image
        src={post.imageUrl}
        alt={post.caption || 'Post image'}
        fill
        className="object-cover transition-transform group-hover:scale-105"
        sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
      />

      {/* Hover overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-4 text-white">
            <span className="flex items-center gap-1">
              <span className="font-semibold">{post.likeCount}</span>
              likes
            </span>
          </div>
        </div>
      )}

      {/* Tags preview */}
      {post.tags.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-black/60 text-white rounded-full"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-black/60 text-white rounded-full">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
