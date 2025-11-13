import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export function AvatarUpload({ currentAvatarUrl, onFileSelect, error }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get formatted avatar URL
  const getAvatarUrl = (): string | null => {
    if (!currentAvatarUrl || currentAvatarUrl.trim() === '') {
      return null;
    }
    const avatarUrl = currentAvatarUrl.trim();
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    // Ensure the URL starts with / if it doesn't already
    const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8180'}${path}`;
  };

  // Update preview when currentAvatarUrl changes
  useEffect(() => {
    if (!fileInputRef.current?.files?.[0]) {
      // Only update if no new file is selected
      const avatarUrl = getAvatarUrl();
      setPreview(avatarUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onFileSelect(null);
      const avatarUrl = getAvatarUrl();
      setPreview(avatarUrl);
      setFileError('');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size must be less than 2MB');
      onFileSelect(null);
      return;
    }

    // Validate file type (JPEG or PNG)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFileError('File must be JPEG or PNG format');
      onFileSelect(null);
      return;
    }

    setFileError('');
    onFileSelect(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const avatarUrl = getAvatarUrl();
    setPreview(avatarUrl);
    onFileSelect(null);
    setFileError('');
  };

  const displayError = error || fileError;
  const currentAvatarUrlFormatted = getAvatarUrl();
  const isNewPreview = preview && preview !== currentAvatarUrlFormatted;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Avatar</label>
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
              onError={(e) => {
                // Hide image on error
                e.currentTarget.style.display = 'none';
              }}
            />
            {isNewPreview && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                aria-label="Remove avatar"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            JPEG or PNG, max 2MB
          </p>
        </div>
      </div>
      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
    </div>
  );
}

