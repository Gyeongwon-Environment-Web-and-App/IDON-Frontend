import { useCallback, useEffect, useState } from 'react';

import type { DateRange } from 'react-day-picker';

//! import { complaintService } from '@/services/complaintService';
import type { Complaint } from '@/types/complaint';

//! import { complaints } from '../data/complaintData';

export const useComplaints = (dateRange?: DateRange) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = useCallback(async (currentDateRange?: DateRange) => {
    setIsLoading(true);
    setError(null);
    try {
      //! const data = await complaintService.getComplaints(currentDateRange);
      console.log(currentDateRange);
      setComplaints(complaints);
    } catch (error) {
      setError('민원 불러오기 실패');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints(dateRange);
  }, [dateRange, loadComplaints]);

  return {
    complaints,
    isLoading,
    error,
    refetch: () => loadComplaints(dateRange),
  };
};
