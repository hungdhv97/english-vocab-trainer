import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from './AvatarUpload';
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
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ displayName?: string; bio?: string; avatar?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const validate = (): boolean => {
    const newErrors: { displayName?: string; bio?: string; avatar?: string } = {};

    if (displayName.trim().length > 50) {
      newErrors.displayName = 'Display name must be 50 characters or less';
    }

    if (bio.trim().length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      if (displayName.trim()) {
        formData.append('display_name', displayName.trim());
      }
      if (bio.trim()) {
        formData.append('bio', bio.trim());
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="display_name" className="text-sm font-medium">
          Display Name
        </label>
        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name (optional)"
          maxLength={50}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {displayName.length}/50 characters
        </p>
        {errors.displayName && (
          <p className="text-sm text-red-500 mt-1">{errors.displayName}</p>
        )}
      </div>

      <AvatarUpload
        currentAvatarUrl={profile?.avatar_url || null}
        onFileSelect={setAvatarFile}
        error={errors.avatar}
      />

      <div>
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself (optional)"
          maxLength={500}
          rows={4}
          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {bio.length}/500 characters
        </p>
        {errors.bio && (
          <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
        )}
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

