import type { DateRange } from 'react-day-picker';

import apiClient from '@/lib/api';
import {
  type Complaint,
  type ComplaintApiResponse,
  type ComplaintByCategoryApiResponse,
  type ComplaintByIdApiResponse,
  type ComplaintExtended,
  type ComplaintForCategory,
} from '@/types/complaint';

const formatDate = (date: Date): string => {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  return dateObj.toISOString();
};

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
  if (!complaintExtended) {
    throw new Error('complaintExtended is null or undefined');
  }

  if (!complaintExtended.address) {
    throw new Error('complaintExtended.address is null or undefined');
  }

  return {
    id: complaintExtended.id,
    address: complaintExtended.address.address,
    datetime: complaintExtended.datetime,
    categories:
      complaintExtended.categories ||
      complaintExtended.teams.map((team) => team.category),
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

const convertComplaintForCategoryToComplaint = (
  complaintForCategory: ComplaintForCategory
): Complaint => {
  if (!complaintForCategory) {
    throw new Error('complaintForCategory is null or undefined');
  }

  if (!complaintForCategory.address) {
    throw new Error('complaintForCategory.address is null or undefined');
  }

  return {
    id: complaintForCategory.id,
    address: complaintForCategory.address.address,
    datetime: complaintForCategory.datetime,
    categories: complaintForCategory.teams.map((team) => team.category),
    type: complaintForCategory.type,
    content: complaintForCategory.content,
    route: complaintForCategory.route,
    source: complaintForCategory.source,
    notify: {
      usernames: [],
    },
    uploadedFiles: [],
    status: complaintForCategory.status,
    user: {
      name: complaintForCategory.user.name,
      serial_no: complaintForCategory.user.serial_no,
      phone_no: '',
    },
    teams: complaintForCategory.teams.map((team) => ({
      ...team,
      drivers: [],
    })),
  };
};

export const complaintService = {
  async getComplaints(dateRange?: DateRange): Promise<Complaint[]> {
    try {
      const dateRangeRequest = getDateRangeFromPicker(dateRange);

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

      return complaints;
    } catch (error) {
      console.error('Error fetching complaints by date range:', error);
      throw error;
    }
  },

  async getComplaintById(id: string): Promise<Complaint> {
    try {
      const response = await apiClient.get<ComplaintByIdApiResponse>(
        `/complaint/getById/${id}`
      );

      if (!response.data) {
        throw new Error('API response data is null or undefined');
      }

      if (!response.data.complaint_extended) {
        throw new Error('API response missing complaint_extended property');
      }

      return convertComplaintExtendedToComplaint(
        response.data.complaint_extended
      );
    } catch (error) {
      console.error('Error in getComplaintById:', error);
      throw error;
    }
  },

  async updateComplaint(
    id: number,
    updates: {
      phone_no?: string;
      content?: string;
      type?: string;
      route?: string;
      status?: boolean | null;
    }
  ): Promise<void> {
    try {
      await apiClient.patch(`/complaint/edit/${id}`, updates);
    } catch (error) {
      console.error(`Error updating complaint ${id}:`, error);
      throw error;
    }
  },

  async deleteComplaints(ids: number[]): Promise<void> {
    try {
      await apiClient.delete('/complaint/deleteOneOrMany', {
        data: { ids },
      });
    } catch (error) {
      console.error(`Error deleting complaints [${ids.join(', ')}]:`, error);
      throw error;
    }
  },

  async getComplaintsByCategory(category: string): Promise<Complaint[]> {
    try {
      const response = await apiClient.get<ComplaintByCategoryApiResponse>(
        `/complaint/getByCategory/${category}`
      );

      const complaints = response.data.complaints.map(
        convertComplaintForCategoryToComplaint
      );

      return complaints;
    } catch (error) {
      console.error(
        `Error fetching complaints for category ${category}:`,
        error
      );
      throw error;
    }
  },
};
