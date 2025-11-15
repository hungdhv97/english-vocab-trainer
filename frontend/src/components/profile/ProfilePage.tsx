import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './ProfileForm';
import { useProfile, useUpdateProfile } from '@/hooks/queries';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useProfile({ enabled: isAuthenticated });
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Failed to load profile';
      toast.error(message);
    }
  }, [error]);

  const handleSubmit = async (data: FormData) => {
    try {
      const updatedProfile = await updateProfileMutation.mutateAsync(data);
      toast.success('Profile updated successfully!');

      // Dispatch event to update banner and header
      window.dispatchEvent(new Event('auth-state-changed'));

      if (isOnboarding) {
        setTimeout(() => {
          if (updatedProfile.is_complete) {
            navigate('/');
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Failed to update profile';
      toast.error(message);
      throw mutationError;
    }
  };

  const handleSkip = () => {
    if (isOnboarding) {
      navigate('/');
    }
  };

  if (isLoading || (!isAuthenticated && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-center">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unable to load profile. Please try again.';
    const needsRelogin = errorMessage.toLowerCase().includes('invalid user_id');

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Unable to load profile</CardTitle>
            <CardDescription>
              {needsRelogin
                ? 'Your session looks out of sync. Please log in again.'
                : 'Please try again in a few moments.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {needsRelogin ? (
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            ) : (
              <Button onClick={() => refetch()} className="w-full">
                Retry
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isOnboarding ? 'Complete Your Profile' : 'Edit Profile'}
          </CardTitle>
          <CardDescription>
            {isOnboarding
              ? 'Tell us a bit about yourself to personalize your experience (optional)'
              : 'Update your profile information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={profile}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            isOnboarding={isOnboarding}
            isLoading={isLoading || updateProfileMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

