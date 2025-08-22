export interface ComplaintFormData {
  address: string;
  routeInput: string;
  selectedRoute: string;
  phone: string;
  selectedTrash: string;
  trashInput: string;
  trashDetail: string;
  content: string;
  isMalicious: boolean;
  forwardTargets: string[];
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
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
}
