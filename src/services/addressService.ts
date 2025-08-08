interface AddressElement {
  types: string[];
  longName: string;
  shortName: string;
  code: string;
}

interface Address {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  addressElements: AddressElement[];
  x: string;
  y: string;
  distance: number;
}

interface GeocodingResponse {
  status: string;
  meta: {
    totalCount: number;
    page: number;
    count: number;
  };
  addresses: Address[];
  errorMessage: string;
}

export class AddressService {
  private static readonly API_BASE_URL = "/api/geocode";

  // API 키는 환경변수에서 가져오거나 직접 설정
  private static readonly API_KEY_ID = import.meta.env
    .VITE_NAVER_CLOUD_API_KEY_ID;
  private static readonly API_KEY = import.meta.env.VITE_NAVER_CLOUD_API_KEY;

  static async searchAddress(
    query: string,
    coordinate?: string
  ): Promise<Address[]> {
    try {
      const url = new URL(this.API_BASE_URL, window.location.origin);
      url.searchParams.append("query", query);
      url.searchParams.append("count", "10");
      url.searchParams.append("language", "kor");

      // 선택적 파라미터 추가
      if (coordinate) {
        url.searchParams.append("coordinate", coordinate);
      }

      // AbortController를 사용하여 3초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-api-key-id": this.API_KEY_ID,
          "x-api-key": this.API_KEY,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: GeocodingResponse = await response.json();

      // HTTP 상태 코드별 에러 처리
      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error("잘못된 요청입니다. 검색어를 확인해주세요.");
          case 401:
            throw new Error("API 키가 유효하지 않습니다.");
          case 403:
            throw new Error("API 사용 권한이 없습니다.");
          case 429:
            throw new Error("API 호출 한도를 초과했습니다.");
          case 500:
            throw new Error("서버 오류가 발생했습니다.");
          default:
            throw new Error(`HTTP 오류: ${response.status}`);
        }
      }

      // API 응답 상태 확인
      if (data.status === "OK") {
        return data.addresses;
      } else {
        throw new Error(data.errorMessage || "주소 검색에 실패했습니다.");
      }
    } catch (error) {
      console.error("주소 검색 오류:", error);

      // AbortError인 경우 타임아웃 에러로 처리
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("검색 시간이 초과되었습니다.");
      }

      throw error;
    }
  }
}

// 주소에서 동 정보 추출 함수
export const extractDongInfo = (address: string): string => {
  try {
    // 서울시 도봉구 방학로 101 -> 방학 1동
    // 서울시 도봉구 쌍문로 45길 20 -> 쌍문 3동

    // 서울시 도봉구 패턴 매칭
    const seoulDobongPattern = /서울특별시\s+도봉구\s+([가-힣]+)/;
    const match = address.match(seoulDobongPattern);

    if (match) {
      const roadName = match[1];

      // 도로명에 따른 동 매핑 (더 정확한 매핑)
      const dongMapping: { [key: string]: string } = {
        방학로: "방학 1동",
        시루봉로: "방학 2동",
        쌍문로: "쌍문 1동",
        도봉로: "쌍문 2동",
        해등로: "쌍문 3동",
        우이천로: "쌍문 1동",
        덕릉로: "쌍문 1동",
        방학동: "방학 1동",
        쌍문동: "쌍문 1동",
        // 더 많은 매핑 추가 가능
      };

      // 정확한 매칭 시도
      for (const [road, dong] of Object.entries(dongMapping)) {
        if (roadName.includes(road) || road.includes(roadName)) {
          return dong;
        }
      }

      // 부분 매칭 시도
      if (roadName.includes("방학")) {
        return "방학 1동";
      } else if (roadName.includes("쌍문")) {
        return "쌍문 1동";
      }
    }

    // 기본값
    return "도봉구";
  } catch (error) {
    console.error("동 정보 추출 오류:", error);
    return "도봉구";
  }
};

// 주소 포맷팅 함수 (동 정보 포함)
export const formatAddressWithDong = (address: string): string => {
  const dongInfo = extractDongInfo(address);
  return `${address} (${dongInfo})`;
};

// 네이버 API 응답에서 법정동 정보 추출
export const extractDongFromAddressElements = (
  addressElements: AddressElement[]
): string => {
  try {
    // 법정동 정보 찾기
    const dongElement = addressElements.find(
      (element) =>
        element.types.includes("SIGUNGU") ||
        element.types.includes("DONG") ||
        element.longName.includes("동")
    );

    if (dongElement) {
      return dongElement.longName;
    }

    return "도봉구";
  } catch (error) {
    console.error("법정동 정보 추출 오류:", error);
    return "도봉구";
  }
};

// 주소와 API 응답을 함께 받아서 정확한 동 정보 반환
export const getAccurateDongInfo = (
  address: string,
  addressElements?: AddressElement[]
): string => {
  // API 응답이 있으면 법정동 정보 사용
  if (addressElements && addressElements.length > 0) {
    return extractDongFromAddressElements(addressElements);
  }

  // 없으면 주소 파싱으로 추출
  return extractDongInfo(address);
};
