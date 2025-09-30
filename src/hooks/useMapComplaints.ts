import { useCallback, useEffect, useState } from 'react';

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

export const useMapComplaints = (
  category?: string,
  onCategoryReset?: () => void
) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadComplaints = useCallback(
    async (currentCategory?: string) => {
      setIsLoading(true);
      setFetchError(null);
      try {
        let data: Complaint[];

        if (currentCategory && currentCategory !== 'all') {
          const koreanCategory = mapCategoryToKorean(currentCategory);
          data = await complaintService.getComplaintsForMap([koreanCategory]);
        } else {
          // For 'all' category, get all categories
          data = await complaintService.getComplaintsForMap([
            '일반',
            '재활용',
            '음식물',
            '기타',
            '반복민원',
          ]);
        }

        const sortedData = data.sort((a, b) => b.id - a.id);

        console.log('Map complaints fetched:', {
          complaints: sortedData,
          category: currentCategory,
        });

        // Check if no data returned for specific category
        if (
          sortedData.length === 0 &&
          currentCategory &&
          currentCategory !== 'all'
        ) {
          const koreanCategory = mapCategoryToKorean(currentCategory);
          window.alert(`${koreanCategory} 카테고리의 민원이 없습니다.`);

          // Fetch all complaints when specific category has no data
          try {
            const allData = await complaintService.getComplaintsForMap([
              '일반',
              '재활용',
              '음식물',
              '기타',
              '반복민원',
            ]);
            const sortedAllData = allData.sort((a, b) => b.id - a.id);
            setComplaints(sortedAllData);

            // Reset category state to "all" when showing all pins
            if (onCategoryReset) {
              onCategoryReset();
            }
            return;
          } catch (fallbackError) {
            console.error('Failed to fetch all complaints:', fallbackError);
            setComplaints([]);
            return;
          }
        }

        setComplaints(sortedData);
      } catch (error) {
        // Show alert for specific category errors
        if (currentCategory && currentCategory !== 'all') {
          const koreanCategory = mapCategoryToKorean(currentCategory);
          window.alert(`${koreanCategory} 카테고리의 민원이 없습니다.`);

          // Fetch all complaints when specific category fails
          try {
            const allData = await complaintService.getComplaintsForMap([
              '일반',
              '재활용',
              '음식물',
              '기타',
              '반복민원',
            ]);
            const sortedAllData = allData.sort((a, b) => b.id - a.id);
            setComplaints(sortedAllData);

            // Reset category state to "all" when showing all pins
            if (onCategoryReset) {
              onCategoryReset();
            }
          } catch (fallbackError) {
            console.error('Failed to fetch all complaints:', fallbackError);
            setComplaints([]);
          }
        } else {
          setComplaints([]);
        }

        setFetchError('지도 민원 불러오기 실패');
        console.log('Map Complaint Service - load Complaints:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [onCategoryReset]
  );

  useEffect(() => {
    loadComplaints(category);
  }, [category]);

  const getComplaintById = useCallback(async (id: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await complaintService.getComplaintById(id);
      return data;
    } catch (error) {
      console.error('Error in useMapComplaints.getComplaintById:', error);
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
    refetch: () => loadComplaints(category),
    getComplaintById,
  };
};
