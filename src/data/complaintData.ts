import type { Complaint } from '../types/complaint';

// 더미 데이터
export const complaints: Complaint[] = [
  {
    id: '1',
    address: '서울특별시 도봉구 방학로 101',
    datetime: '2025-01-15T09:38:00',
    category: '재활용',
    type: '재활용',
    content: '스티로폼 수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-1234-1234',
      bad: false,
    },
    notify: {
      usernames: ['김민수'],
    },
    coordinates: {
      latitude: 37.6634,
      longitude: 127.0444,
    },
    uploadedFiles: [
      {
        name: 'styrofoam_photo.jpg',
        url: '/uploads/styrofoam_photo.jpg',
        type: 'image/jpeg',
        size: 1024000,
      },
    ],
    status: true,
  },
  {
    id: '2',
    address: '서울특별시 도봉구 쌍문로 45길 20',
    datetime: '2025-01-14T14:22:31',
    category: '음식물',
    type: '음식물',
    content: '음식물 미수거 신고',
    route: '구청',
    source: {
      phone_no: '010-3300-2200',
      bad: true,
    },
    notify: {
      usernames: ['이서준'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    uploadedFiles: [],
    status: true,
  },
  {
    id: '3',
    address: '서울특별시 도봉구 시루봉로 59',
    datetime: '2025-01-13T07:15:12',
    category: '일반',
    type: '일반',
    content: '대형폐기물 수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-5553-7777',
      bad: false,
    },
    notify: {
      usernames: ['박지훈'],
    },
    coordinates: {
      latitude: 37.6589,
      longitude: 127.0398,
    },
    uploadedFiles: [
      {
        name: 'large_waste.jpg',
        url: '/uploads/large_waste.jpg',
        type: 'image/jpeg',
        size: 2048000,
      },
    ],
    status: true,
  },
  {
    id: '4',
    address: '서울특별시 도봉구 우이천로 152',
    datetime: '2025-01-12T19:48:00',
    category: '일반',
    type: '일반',
    content: '불법투기 신고',
    route: '경원환경',
    source: {
      phone_no: '010-7770-0000',
      bad: true,
    },
    notify: {
      usernames: ['최윤아'],
    },
    coordinates: {
      latitude: 37.6534,
      longitude: 127.0289,
    },
    uploadedFiles: [
      {
        name: 'illegal_dumping.jpg',
        url: '/uploads/illegal_dumping.jpg',
        type: 'image/jpeg',
        size: 1536000,
      },
    ],
    status: false,
  },
  {
    id: '5',
    address: '서울특별시 도봉구 도봉로 108가길 11',
    datetime: '2025-01-11T11:05:55',
    category: '음식물',
    type: '음식물',
    content: '골목 종량제 수거 요청',
    route: '주민센터',
    source: {
      phone_no: '02-120',
      bad: false,
    },
    notify: {
      usernames: ['정하늘'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    uploadedFiles: [],
    status: false,
  },
  {
    id: '6',
    address: '서울특별시 도봉구 덕릉로 63',
    datetime: '2025-01-10T06:30:00',
    category: '음식물',
    type: '음식물',
    content: '종량제 수거 요청',
    route: '120신고센터',
    source: {
      phone_no: '02-120',
      bad: false,
    },
    notify: {
      usernames: ['한지호'],
    },
    coordinates: {
      latitude: 37.6534,
      longitude: 127.0289,
    },
    uploadedFiles: [],
    status: false,
  },
  {
    id: '7',
    address: '서울특별시 도봉구 해등로 12길 9',
    datetime: '2025-01-09T17:12:45',
    category: '일반',
    type: '일반',
    content: '아파트 특수마대 수거 요청',
    route: '120신고센터',
    source: {
      phone_no: '02-120',
      bad: false,
    },
    notify: {
      usernames: ['서지민'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    uploadedFiles: [],
    status: false,
  },
  {
    id: '8',
    address: '서울특별시 도봉구 해등로 198',
    datetime: '2025-01-08T20:12:45',
    category: '일반',
    type: '일반',
    content: '한의원 앞 쓰레기 수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-7770-0000',
      bad: false,
    },
    notify: {
      usernames: ['김아무개'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    uploadedFiles: [],
    status: true,
  },
  {
    id: '9',
    address: '서울특별시 도봉구 방학로 203',
    datetime: '2025-01-16T08:30:00',
    category: '재활용',
    type: '재활용',
    content: '플라스틱 분리수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-9999-8888',
      bad: false,
    },
    notify: {
      usernames: ['이영희'],
    },
    coordinates: {
      latitude: 37.6634,
      longitude: 127.0444,
    },
    uploadedFiles: [],
    status: true,
  },
  {
    id: '10',
    address: '서울특별시 도봉구 쌍문로 78길 15',
    datetime: '2025-01-16T15:45:30',
    category: '음식물',
    type: '음식물',
    content: '음식물쓰레기 냄새 신고',
    route: '구청',
    source: {
      phone_no: '010-4444-5555',
      bad: true,
    },
    notify: {
      usernames: ['박철수'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    uploadedFiles: [],
    status: true,
  },
];
