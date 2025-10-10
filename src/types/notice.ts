export interface Notice {
  id: number;
  type: string;
  title: string;
  writer: string;
  datetime: string;
  content: string;
}

export interface NoticeFormData {
  title: string;
  category: string;
  content: string;
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  notify: string[];
}