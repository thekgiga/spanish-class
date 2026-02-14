import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPrivateInvitation,
  listPrivateInvitations,
  cancelPrivateInvitation,
} from '../services/api/private-invitations';
import type { CreatePrivateInvitationInput, CancelPrivateInvitationInput } from '@spanish-class/shared';
import { toast } from 'react-hot-toast';

// T015: useCreatePrivateInvitation hook
export function useCreatePrivateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrivateInvitation,
    onSuccess: (data) => {
      toast.success(data.message || 'Private invitation created successfully!');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['privateInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || 'Failed to create private invitation';
      toast.error(message);
    },
  });
}

// T016: usePrivateInvitations list hook
export function usePrivateInvitations(params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['privateInvitations', params],
    queryFn: () => listPrivateInvitations(params),
  });
}

// Cancel private invitation hook
export function useCancelPrivateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelPrivateInvitationInput }) =>
      cancelPrivateInvitation(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Private invitation cancelled');
      queryClient.invalidateQueries({ queryKey: ['privateInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || 'Failed to cancel invitation';
      toast.error(message);
    },
  });
}
