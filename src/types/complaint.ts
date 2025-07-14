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
}
