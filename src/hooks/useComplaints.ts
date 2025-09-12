import { complaintService } from "@/services/complaintService";
import type { Complaint } from "@/types/complaint";
import type { DateRange } from "react-day-picker";
import { useCallback, useEffect, useState } from "react";

export const useComplaints = (dateRange?: DateRange) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = useCallback(async (currentDateRange?: DateRange) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await complaintService.getComplaints(currentDateRange);
      setComplaints(data);
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


  return { complaints, isLoading, error, refetch: () => loadComplaints(dateRange) };
};