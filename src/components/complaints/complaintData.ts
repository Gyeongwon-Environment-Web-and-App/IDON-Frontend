// 민원 데이터 타입 정의
export interface Complaint {
  id: string;
  number: number;
  date: string;
  type: string;
  content: string;
  department: string;
  address: string;
  contact: string;
  status: "처리중" | "완료";
  onStatusChange?: (id: string) => void;
}

// 더미 데이터
export const complaints: Complaint[] = [
  {
    id: "1",
    number: 7,
    date: "25.06.12",
    type: "재활용",
    content: "스티로폼 수거 요청",
    department: "경원환경",
    address: "방학 1동",
    contact: "010-1234-1234",
    status: "처리중",
  },
  {
    id: "2",
    number: 6,
    date: "25.06.11",
    type: "음식물",
    content: "음식물 미수거",
    department: "구청",
    address: "쌍문 3동",
    contact: "010-3300-2200",
    status: "처리중",
  },
  {
    id: "3",
    number: 5,
    date: "25.06.10",
    type: "일반",
    content: "음식물 미수거",
    department: "경원환경",
    address: "방학 2동",
    contact: "010-5553-7777",
    status: "처리중",
  },
  {
    id: "4",
    number: 4,
    date: "25.06.09",
    type: "일반",
    content: "음식물 미수거",
    department: "경원환경",
    address: "쌍문 1동",
    contact: "010-7770-0000",
    status: "완료",
  },
  {
    id: "5",
    number: 3,
    date: "25.06.05",
    type: "음식물",
    content: "골목 종량제 수거 요청",
    department: "주민센터",
    address: "쌍문 2동",
    contact: "120",
    status: "완료",
  },
  {
    id: "6",
    number: 2,
    date: "25.06.01",
    type: "음식물",
    content: "종량제 수거 요청",
    department: "120",
    address: "쌍문 1동",
    contact: "120",
    status: "완료",
  },
  {
    id: "7",
    number: 1,
    date: "25.06.01",
    type: "일반",
    content: "00빌라 특수마대 수거 요청",
    department: "120",
    address: "쌍문 3동",
    contact: "120",
    status: "완료",
  },
];
