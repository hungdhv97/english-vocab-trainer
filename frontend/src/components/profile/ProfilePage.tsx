import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileForm } from './ProfileForm';
import { getProfile, updateProfile } from '@/lib/api';
import type { UserProfile } from '@/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await getProfile();
      setProfile(userProfile);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const updatedProfile = await updateProfile(data);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
      
      // Dispatch event to update banner and header
      window.dispatchEvent(new Event('auth-state-changed'));
      
      // If onboarding and profile is now complete, redirect to home
      if (isOnboarding && updatedProfile.is_complete) {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else if (isOnboarding) {
        // Still incomplete but saved, redirect to home
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  };

  const handleSkip = () => {
    if (isOnboarding) {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-center">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
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
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

