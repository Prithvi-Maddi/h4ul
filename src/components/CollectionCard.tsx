'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Collection } from '@/types';

interface CollectionCardProps {
  collection: Collection;
  coverImage?: string;
}

export function CollectionCard({ collection, coverImage }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.collectionId}`}
      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Cover Image */}
      <div className="relative aspect-square bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={collection.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-4xl">+</span>
          </div>
        )}

        {/* Private indicator */}
        {collection.isPrivate && (
          <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{collection.name}</h3>
        <p className="text-xs text-gray-500">
          {collection.postIds.length} {collection.postIds.length === 1 ? 'item' : 'items'}
        </p>
      </div>
    </Link>
  );
}
