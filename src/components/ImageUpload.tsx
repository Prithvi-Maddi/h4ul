'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIMITS } from '@/lib/constants';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  onPreviewChange?: (previewUrl: string | null) => void;
  disabled?: boolean;
  error?: string;
}

export function ImageUpload({
  value,
  onChange,
  onPreviewChange,
  disabled = false,
  error
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > LIMITS.IMAGE_MAX_SIZE_MB * 1024 * 1024) {
      return `Image too large. Maximum size is ${LIMITS.IMAGE_MAX_SIZE_MB}MB.`;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return 'Unsupported file type. Please use JPG, PNG, or HEIC.';
    }

    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      setValidationError(null);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onPreviewChange?.(previewUrl);
      onChange(file);
    },
    [onChange, onPreviewChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = () => {
    setPreview(null);
    onPreviewChange?.(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayError = validationError || error;

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="relative aspect-square w-full max-w-md mx-auto">
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover rounded-lg"
          />
          <button
            onClick={removeImage}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'aspect-square w-full max-w-md mx-auto border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors',
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed',
            displayError && 'border-red-300'
          )}
        >
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 text-center px-4">
            <span className="font-medium text-purple-600">Click to upload</span>
            <br />
            or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, or HEIC (max {LIMITS.IMAGE_MAX_SIZE_MB}MB)
          </p>
        </div>
      )}

      {displayError && (
        <p className="mt-2 text-sm text-red-600 text-center">{displayError}</p>
      )}
    </div>
  );
}
