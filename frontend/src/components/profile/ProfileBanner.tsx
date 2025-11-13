import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { checkProfileCompletion } from '@/lib/api';

export function ProfileBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBannerVisibility = async () => {
      try {
        setIsLoading(true);
        const userIdStr = localStorage.getItem('user_id');
        if (!userIdStr) {
          setShowBanner(false);
          setIsLoading(false);
          return;
        }

        // Check if banner was dismissed in this session
        const dismissed = sessionStorage.getItem('profile_banner_dismissed');
        if (dismissed === 'true') {
          setShowBanner(false);
          setIsLoading(false);
          return;
        }

        // Check profile completion status
        const status = await checkProfileCompletion();
        setShowBanner(!status.is_complete);
      } catch {
        // If error, don't show banner
        setShowBanner(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkBannerVisibility();

    // Listen for profile updates (when profile is completed or auth state changes)
    const handleProfileUpdate = () => {
      checkBannerVisibility();
    };
    window.addEventListener('auth-state-changed', handleProfileUpdate);

    return () => {
      window.removeEventListener('auth-state-changed', handleProfileUpdate);
    };
  }, []);

  const handleCompleteProfile = () => {
    navigate('/profile');
  };

  const handleSkip = () => {
    sessionStorage.setItem('profile_banner_dismissed', 'true');
    setShowBanner(false);
  };

  if (isLoading || !showBanner) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Complete your profile to personalize your experience
            </p>
            <Button
              onClick={handleCompleteProfile}
              size="sm"
              variant="outline"
              className="text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800"
            >
              Complete Profile
            </Button>
          </div>
          <Button
            onClick={handleSkip}
            size="sm"
            variant="ghost"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}

