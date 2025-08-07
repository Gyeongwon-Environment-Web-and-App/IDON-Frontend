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
  private static readonly API_KEY_ID =
    import.meta.env.VITE_NAVER_CLOUD_API_KEY_ID || "your_api_key_id";
  private static readonly API_KEY =
    import.meta.env.VITE_NAVER_CLOUD_API_KEY || "your_api_key";

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
