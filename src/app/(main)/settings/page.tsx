'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Lock, Globe, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { updateUser } from '@/lib/firestore';
import { uploadProfilePhoto } from '@/lib/storage';
import { LIMITS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SettingsFormData {
  displayName: string;
  bio: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<SettingsFormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      bio: user?.bio || ''
    }
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const photoUrl = await uploadProfilePhoto(user.uid, file);
      await updateUser(user.uid, { profilePhotoUrl: photoUrl });
      await refreshUser();
      showToast('Profile photo updated', 'success');
    } catch (error) {
      showToast('Failed to update photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUser(user.uid, {
        displayName: data.displayName,
        bio: data.bio,
        isPrivate
      });
      await refreshUser();
      showToast('Settings saved', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      showToast('Failed to log out', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full md:hidden"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
        <Button
          size="sm"
          onClick={handleSubmit(onSubmit)}
          loading={saving}
          disabled={!isDirty && isPrivate === user.isPrivate}
        >
          Save
        </Button>
      </header>

      <form className="p-4 space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              {user.profilePhotoUrl ? (
                <Image
                  src={user.profilePhotoUrl}
                  alt={user.username}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-3xl">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">@{user.username}</p>
          {uploadingPhoto && (
            <p className="text-sm text-purple-600">Uploading...</p>
          )}
        </div>

        {/* Display Name */}
        <Input
          label="Display Name"
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
          maxLength={LIMITS.BIO_MAX_LENGTH}
          showCount
          {...register('bio', {
            maxLength: {
              value: LIMITS.BIO_MAX_LENGTH,
              message: `Bio must be ${LIMITS.BIO_MAX_LENGTH} characters or less`
            }
          })}
        />

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
                {isPrivate ? 'Private Account' : 'Public Account'}
              </p>
              <p className="text-sm text-gray-500">
                {isPrivate
                  ? 'Only approved followers can see your posts'
                  : 'Anyone can see your posts'}
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

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 w-full p-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </form>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log Out"
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-600">Are you sure you want to log out?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
