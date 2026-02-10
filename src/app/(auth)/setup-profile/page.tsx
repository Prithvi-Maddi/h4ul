'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { useToast } from '@/components/ui/Toast';
import { ROUTES, LIMITS } from '@/lib/constants';
import { createUser, isUsernameAvailable, createWishlistCollection } from '@/lib/firestore';
import { uploadProfilePhoto } from '@/lib/storage';
import { validateUsername } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ProfileFormData {
  username: string;
  displayName: string;
  bio: string;
}

export default function SetupProfilePage() {
  const router = useRouter();
  const { firebaseUser, user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProfileFormData>();

  const username = watch('username');

  // Redirect if already has profile
  useEffect(() => {
    if (user) {
      router.push(ROUTES.FEED);
    }
  }, [user, router]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      const validation = validateUsername(username);
      if (!validation.valid) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(username);
        setUsernameAvailable(available);
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [username]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!firebaseUser) return;

    if (usernameAvailable === false) {
      showToast('Username is already taken', 'error');
      return;
    }

    setLoading(true);
    try {
      // Upload profile photo if provided
      let profilePhotoUrl = '';
      if (profilePhoto) {
        profilePhotoUrl = await uploadProfilePhoto(firebaseUser.uid, profilePhoto);
      }

      // Create user profile
      await createUser(firebaseUser.uid, firebaseUser.email || '', {
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        profilePhotoUrl
      });

      // Create default wishlist
      await createWishlistCollection(firebaseUser.uid);

      // Refresh user data
      await refreshUser();

      showToast('Profile created!', 'success');
      router.push(ROUTES.FEED);
    } catch (error) {
      console.error('Error creating profile:', error);
      showToast('Failed to create profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">Tell us a bit about yourself</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex justify-center">
                <div className="w-32">
                  <ImageUpload
                    onChange={setProfilePhoto}
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <Input
                label="Username"
                placeholder="your_username"
                error={errors.username?.message}
                helperText={
                  checkingUsername
                    ? 'Checking availability...'
                    : usernameAvailable === true
                    ? 'Username is available!'
                    : usernameAvailable === false
                    ? 'Username is already taken'
                    : 'Letters, numbers, and underscores only'
                }
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  maxLength: {
                    value: LIMITS.USERNAME_MAX_LENGTH,
                    message: `Username must be ${LIMITS.USERNAME_MAX_LENGTH} characters or less`
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores'
                  }
                })}
              />
            </div>

            {/* Display Name */}
            <Input
              label="Display Name"
              placeholder="Your Name"
              error={errors.displayName?.message}
              {...register('displayName', {
                required: 'Display name is required',
                maxLength: {
                  value: 50,
                  message: 'Display name must be 50 characters or less'
                }
              })}
            />

            {/* Bio */}
            <Textarea
              label="Bio"
              placeholder="Tell us about your style..."
              maxLength={LIMITS.BIO_MAX_LENGTH}
              showCount
              {...register('bio', {
                maxLength: {
                  value: LIMITS.BIO_MAX_LENGTH,
                  message: `Bio must be ${LIMITS.BIO_MAX_LENGTH} characters or less`
                }
              })}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={usernameAvailable === false || checkingUsername}
            >
              Complete Setup
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
