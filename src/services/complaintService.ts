import type { DateRange } from 'react-day-picker';

import apiClient from '@/lib/api';
import type {
  Complaint,
  ComplaintApiResponse,
  ComplaintExtended,
} from '@/types/complaint';

const formatDate = (date: Date): string => {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  // Return full ISO string format with timezone (e.g., "2025-09-12T05:31:22.827Z")
  return dateObj.toISOString();
};

// Helper function to get date range
const getDateRangeFromPicker = (dateRange: DateRange | undefined) => {
  const today = new Date();

  if (!dateRange?.from || !dateRange?.to) {
    // Default: one month before to today
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      startDate: formatDate(oneMonthAgo),
      endDate: formatDate(today),
    };
  }

  return {
    startDate: formatDate(dateRange.from),
    endDate: formatDate(dateRange.to),
  };
};

// Helper function to convert ComplaintExtended to Complaint
const convertComplaintExtendedToComplaint = (
  complaintExtended: ComplaintExtended
): Complaint => {
  return {
    id: complaintExtended.id,
    address: complaintExtended.address.address,
    datetime: complaintExtended.datetime,
    category: complaintExtended.category,
    type: complaintExtended.type,
    content: complaintExtended.content,
    route: complaintExtended.route,
    source: complaintExtended.source,
    notify: {
      usernames: complaintExtended.teams.flatMap((team) =>
        team.drivers.map((driver) => driver.name)
      ),
    },
    uploadedFiles: [], // Not provided in API response
    status: complaintExtended.status,
    user: complaintExtended.user,
    teams: complaintExtended.teams,
  };
};

export const complaintService = {
  async getComplaints(dateRange?: DateRange): Promise<Complaint[]> {
    const dateRangeRequest = getDateRangeFromPicker(dateRange);

    console.log('Request body (ISO format):', {
      startDate: dateRangeRequest.startDate,
      endDate: dateRangeRequest.endDate,
    });

    const response = await apiClient.post<ComplaintApiResponse>(
      '/complaint/getByDates',
      {
        startDate: dateRangeRequest.startDate,
        endDate: dateRangeRequest.endDate,
      }
    );

    // Convert the API response to the expected format
    const complaints = response.data.complaints_extended.map(
      convertComplaintExtendedToComplaint
    );

    console.log('API Response:', response.data);
    console.log('Converted Complaints:', complaints);

    return complaints;
  },

  async updateComplaintStatus(id: string, status: string): Promise<Complaint> {
    const response = await apiClient.patch(`/complaints/${id}`, { status });
    return response.data;
  },
};
