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
  number: number;
  date: string;
  type: string;
  content: string;
  department: string;
  region_nm: string;
  address: string;
  contact: string;
  driver: string;
  status: "처리중" | "완료";
  onStatusChange?: (id: string) => void;
  [key: string]: unknown;
}
