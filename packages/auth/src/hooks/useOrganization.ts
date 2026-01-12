import { useCallback } from 'react';
import { useAuthContext } from '../AuthProvider';
import { 
  UseOrganizationReturn, 
  Organization 
} from '../types/auth.types';
import { AuthUtils } from '../utils/session';

/**
 * Hook for organization management functionality
 * Provides access to organization context and management
 */
export function useOrganization(): UseOrganizationReturn {
  const { user, organization } = useAuthContext();

  const switchOrganization = useCallback(async (organizationId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to switch organizations');
    }

    try {
      const newOrganization = await AuthUtils.switchOrganization(user.id, organizationId);
      // This would typically update the context through a dispatch action
      // For now, we'll rely on the AuthProvider to handle this
      window.location.reload(); // Simple approach for now
    } catch (error) {
      throw error;
    }
  }, [user]);

  const updateOrganization = useCallback(async (updates: Partial<Organization>): Promise<void> => {
    if (!organization) {
      throw new Error('No active organization');
    }

    // This would typically update the organization in the database
    // and then update the context
    console.log('Updating organization:', updates);
  }, [organization]);

  return {
    organization,
    switchOrganization,
    updateOrganization,
    isLoading: false,
    error: null
  };
}
