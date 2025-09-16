export interface ComplaintFormData {
  address: string;
  datetime: string;
  category: string;
  type: string;
  content: string;
  route: string;
  source: {
    phone_no: string;
    bad: boolean;
  };
  notify: {
    usernames: string[];
  };
  // Keep these for UI purposes (not sent to backend)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface Complaint {
  id: string;
  address: string;
  datetime: string;
  category: string;
  type: string;
  content: string;
  route: string;
  source: {
    phone_no: string;
    bad: boolean;
  };
  notify: {
    usernames: string[];
  };
  // Keep these for UI purposes (not sent to backend)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  // Legacy fields for backward compatibility
  number?: number;
  date?: string;
  department?: string;
  region_nm?: string;
  contact?: string;
  driver?: string;
  status?: '처리중' | '완료';
  onStatusChange?: (id: string) => void;
  [key: string]: unknown;
}
