// 도봉구 동 정보 매핑 시스템
interface DongMapping {
  [key: string]: string;
}

// 도봉구 전체 동 정보 매핑
const DOBONG_DONG_MAPPING: DongMapping = {
  // 방학동
  방학로: "방학 1동",
  시루봉로: "방학 2동",
  방학동: "방학 1동",
  방학1동: "방학 1동",
  방학2동: "방학 2동",

  // 쌍문동
  쌍문로: "쌍문 1동",
  도봉로: "쌍문 2동",
  해등로: "쌍문 3동",
  우이천로: "쌍문 1동",
  덕릉로: "쌍문 1동",
  쌍문동: "쌍문 1동",
  쌍문1동: "쌍문 1동",
  쌍문2동: "쌍문 2동",
  쌍문3동: "쌍문 3동",
  쌍문4동: "쌍문 4동",

  // 창동
  창동: "창 1동",
  창1동: "창 1동",
  창2동: "창 2동",
  창3동: "창 3동",
  창4동: "창 4동",
  창5동: "창 5동",

  // 도봉동
  도봉동: "도봉 1동",
  도봉1동: "도봉 1동",
  도봉2동: "도봉 2동",

  // 마들동
  마들동: "마들 1동",
  마들1동: "마들 1동",
  마들2동: "마들 2동",

  // 쌍문동 추가 도로명
  도봉산로: "쌍문 1동",
  도봉산길: "쌍문 1동",
  도봉산: "쌍문 1동",

  // 방학동 추가 도로명
  방학: "방학 1동",
  방학길: "방학 1동",

  // 창동 추가 도로명
  창: "창 1동",
  창길: "창 1동",

  // 도봉동 추가 도로명
  도봉: "도봉 1동",
  도봉길: "도봉 1동",

  // 마들동 추가 도로명
  마들: "마들 1동",
  마들길: "마들 1동",
};

// 도봉구 주소인지 확인하는 함수
export const isDobongAddress = (address: string): boolean => {
  const dobongKeywords = [
    "도봉구",
    "방학",
    "쌍문",
    "창동",
    "도봉동",
    "마들",
    "방학로",
    "시루봉로",
    "쌍문로",
    "도봉로",
    "해등로",
    "우이천로",
    "덕릉로",
    "도봉산로",
    "창동",
    "마들동",
  ];

  return dobongKeywords.some((keyword) => address.includes(keyword));
};

// 주소에서 동 정보 추출 함수
export const extractDongInfo = (address: string): string => {
  try {
    // 도봉구 주소가 아니면 빈 문자열 반환
    if (!isDobongAddress(address)) {
      return "";
    }

    // 도로명에 따른 동 매핑
    for (const [road, dong] of Object.entries(DOBONG_DONG_MAPPING)) {
      if (address.includes(road)) {
        return dong;
      }
    }

    // 서울시 도봉구 패턴 매칭 (백업)
    const seoulDobongPattern = /서울특별시\s+도봉구\s+([가-힣]+)/;
    const match = address.match(seoulDobongPattern);

    if (match) {
      const roadName = match[1];

      // 부분 매칭 시도
      if (roadName.includes("방학")) {
        return "방학 1동";
      } else if (roadName.includes("쌍문")) {
        return "쌍문 1동";
      } else if (roadName.includes("창")) {
        return "창 1동";
      } else if (roadName.includes("도봉")) {
        return "도봉 1동";
      } else if (roadName.includes("마들")) {
        return "마들 1동";
      }
    }

    // 기본값 (도봉구 내 주소이지만 매핑되지 않은 경우)
    return "도봉구";
  } catch (error) {
    console.error("동 정보 추출 오류:", error);
    return "";
  }
};

// 주소 포맷팅 함수 (동 정보 포함)
export const formatAddressWithDong = (address: string): string => {
  const dongInfo = extractDongInfo(address);
  if (!dongInfo) {
    return address;
  }
  return `${address} (${dongInfo})`;
};

// 동 정보만 반환하는 함수
export const getDongInfo = (address: string): string => {
  return extractDongInfo(address);
};
