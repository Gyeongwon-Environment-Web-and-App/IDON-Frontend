import { useCallback, useEffect, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { complaintService } from '@/services/complaintService';
import type { Complaint } from '@/types/complaint';

// Map English filter IDs to Korean category names for API
const mapCategoryToKorean = (categoryId: string): string => {
  const categoryMap: Record<string, string> = {
    general: '일반',
    recycle: '재활용',
    food: '음식물',
    others: '기타',
    bad: '반복민원',
    all: 'all',
  };

  return categoryMap[categoryId] || categoryId;
};

export const useComplaints = (dateRange?: DateRange, category?: string) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadComplaints = useCallback(
    async (currentDateRange?: DateRange, currentCategory?: string) => {
      setIsLoading(true);
      setFetchError(null);
      try {
        let data: Complaint[];
        if (currentCategory && currentCategory !== 'all') {
          const koreanCategory = mapCategoryToKorean(currentCategory);
          data = await complaintService.getComplaintsByCategoryAndDate(
            koreanCategory,
            currentDateRange
          );
        } else {
          data = await complaintService.getComplaints(currentDateRange);
        }

        const sortedData = data.sort((a, b) => b.id - a.id);

        console.log('Complaints fetched:', {
          complaints: sortedData,
          dateRange: currentDateRange,
        });

        setComplaints(sortedData);
      } catch (error) {
        setFetchError('민원 불러오기 실패');
        console.log('Complaint Service - load Complaints:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadComplaints(dateRange, category);
  }, [dateRange, category, loadComplaints]);

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
    refetch: () => loadComplaints(dateRange, category),
    getComplaintById,
  };
};
