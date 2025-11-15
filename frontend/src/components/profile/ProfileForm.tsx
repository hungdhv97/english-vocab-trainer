import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from './AvatarUpload';
import { profileSchema, type ProfileFormData } from '@/schemas';
import type { UserProfile } from '@/types';

interface ProfileFormProps {
  profile?: UserProfile | null;
  onSubmit: (data: FormData) => Promise<void>;
  onSkip?: () => void;
  isOnboarding?: boolean;
  isLoading?: boolean;
}

export function ProfileForm({
  profile,
  onSubmit,
  onSkip,
  isOnboarding = false,
  isLoading = false,
}: ProfileFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
    },
  });

  const displayNameValue = watch('display_name') ?? '';
  const bioValue = watch('bio') ?? '';

  useEffect(() => {
    reset({
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
    });
  }, [profile, reset]);

  const onFormSubmit = async (values: ProfileFormData) => {
    const formData = new FormData();

    if (values.display_name?.trim()) {
      formData.append('display_name', values.display_name.trim());
    }

    if (values.bio?.trim()) {
      formData.append('bio', values.bio.trim());
    }

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="display_name" className="text-sm font-medium">
          Display Name
        </label>
        <Input
          id="display_name"
          placeholder="Enter your display name (optional)"
          maxLength={50}
          className="mt-1"
          {...register('display_name')}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {displayNameValue.length}/50 characters
        </p>
        {errors.display_name && (
          <p className="text-sm text-red-500 mt-1">{errors.display_name.message}</p>
        )}
      </div>

      <AvatarUpload
        currentAvatarUrl={profile?.avatar_url || null}
        onFileSelect={setAvatarFile}
      />

      <div>
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          placeholder="Tell us about yourself (optional)"
          maxLength={500}
          rows={4}
          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('bio')}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {bioValue.length}/500 characters
        </p>
        {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting || isLoading} className="flex-1">
          {isSubmitting ? 'Saving...' : isOnboarding ? 'Complete Profile' : 'Save Changes'}
        </Button>
        {isOnboarding && onSkip && (
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isSubmitting || isLoading}
            className="flex-1"
          >
            Skip
          </Button>
        )}
      </div>
    </form>
  );
}

