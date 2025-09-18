import { useCallback, useEffect, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { complaintService } from '@/services/complaintService';
import type { Complaint } from '@/types/complaint';

export const useComplaints = (dateRange?: DateRange) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadComplaints = useCallback(async (currentDateRange?: DateRange) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await complaintService.getComplaints(currentDateRange);
      setComplaints(data);
    } catch (error) {
      setFetchError('민원 불러오기 실패');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints(dateRange);
  }, [dateRange, loadComplaints]);

  const getComplaintById = useCallback(async (id: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await complaintService.getComplaintById(id);
      return data;
    } catch (error) {
      console.error('Error in useComplaints.getComplaintById:', error);
      setFetchError('민원 불러오기 실패');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    complaints,
    isLoading,
    fetchError,
    refetch: () => loadComplaints(dateRange),
    getComplaintById,
  };
};
