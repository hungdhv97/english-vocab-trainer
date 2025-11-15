import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface UseProfileOptions {
  enabled?: boolean;
}

export function useProfile(options?: UseProfileOptions) {
  const userId = useAuthStore((state) => state.user?.user_id);
  const isEnabled = (options?.enabled ?? true) && Boolean(userId);

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isEnabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateProfileInStore = useAuthStore((state) => state.updateProfile);
  const userId = useAuthStore((state) => state.user?.user_id);

  return useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData, userId ?? undefined),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateProfileInStore(data);
    },
  });
}

