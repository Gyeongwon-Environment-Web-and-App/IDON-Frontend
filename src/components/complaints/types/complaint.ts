// 민원 데이터 타입 정의
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