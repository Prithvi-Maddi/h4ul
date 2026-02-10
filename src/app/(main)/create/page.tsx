'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ChevronRight, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { TagSelector } from '@/components/TagSelector';
import { CollectionSelector } from '@/components/CollectionSelector';
import { useToast } from '@/components/ui/Toast';
import { createPost } from '@/lib/firestore';
import { uploadPostImage } from '@/lib/storage';
import { LIMITS, ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CreatePostFormData {
  caption: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch } = useForm<CreatePostFormData>();
  const caption = watch('caption', '');

  const onSubmit = async (data: CreatePostFormData) => {
    if (!user || !imageFile) {
      showToast('Please select an image', 'error');
      return;
    }

    setLoading(true);
    try {
      // Upload image
      const imageUrl = await uploadPostImage(user.uid, imageFile);

      // Create post
      await createPost(user.uid, {
        imageUrl,
        caption: data.caption,
        tags: selectedTags,
        collectionIds: selectedCollections,
        isPrivate
      });

      showToast('Post created!', 'success');
      router.push(ROUTES.WARDROBE);
    } catch (error: any) {
      console.error('Error creating post:', error);
      showToast(error.message || 'Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">New Post</h1>
        <Button
          onClick={handleSubmit(onSubmit)}
          loading={loading}
          disabled={!imageFile}
          size="sm"
        >
          Share
        </Button>
      </header>

      <form className="p-4 space-y-6">
        {/* Image Upload */}
        <ImageUpload
          onChange={setImageFile}
          onPreviewChange={setImagePreview}
          disabled={loading}
        />

        {/* Caption */}
        <Textarea
          label="Caption"
          placeholder="Tell us about this piece..."
          maxLength={LIMITS.CAPTION_MAX_LENGTH}
          showCount
          {...register('caption', {
            maxLength: LIMITS.CAPTION_MAX_LENGTH
          })}
        />

        {/* Tags */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

        {/* Collections */}
        <div>
          <button
            type="button"
            onClick={() => setShowCollectionModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">Add to Collection</span>
            <div className="flex items-center gap-2 text-gray-500">
              {selectedCollections.length > 0 && (
                <span className="text-sm">
                  {selectedCollections.length} selected
                </span>
              )}
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isPrivate ? (
              <Lock className="w-5 h-5 text-gray-600" />
            ) : (
              <Globe className="w-5 h-5 text-gray-600" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {isPrivate ? 'Private' : 'Public'}
              </p>
              <p className="text-sm text-gray-500">
                {isPrivate
                  ? 'Only you can see this post'
                  : 'Everyone can see this post'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              isPrivate ? 'bg-purple-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                isPrivate ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </form>

      {/* Collection Selector Modal */}
      <CollectionSelector
        selectedCollections={selectedCollections}
        onCollectionsChange={setSelectedCollections}
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
      />
    </div>
  );
}
