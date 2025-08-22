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
  name?: string; // 장소명 추가
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

interface LocalSearchItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

interface LocalSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: LocalSearchItem[];
}

export class AddressService {
  // Vite 프록시를 통한 API 호출로 변경
  private static readonly GEOCODE_API_URL = "/api/geocode";
  // private static readonly LOCAL_SEARCH_API_URL = "/api/local";

  // API 키는 환경변수에서 가져오거나 직접 설정
  private static readonly API_KEY_ID = import.meta.env
    .VITE_NAVER_CLOUD_API_KEY_ID;
  private static readonly API_KEY = import.meta.env.VITE_NAVER_CLOUD_API_KEY;

  // 카카오맵 API 키 (장소명 검색용) - JavaScript 키 사용
  private static readonly KAKAO_JAVASCRIPT_KEY = import.meta.env
    .VITE_KAKAO_JAVASCRIPT_KEY;

  // 카카오맵 SDK 초기화 확인
  private static isKakaoSDKLoaded(): boolean {
    return (
      typeof window !== "undefined" &&
      !!window.kakao &&
      !!window.kakao.maps &&
      !!window.kakao.maps.services
    );
  }

  // API 키 유효성 검사 메서드 추가
  private static validateApiKeys() {
    console.log("🔍 API 키 상태:", {
      네이버_Maps: this.API_KEY_ID && this.API_KEY ? "✅" : "❌",
      카카오맵_SDK:
        this.KAKAO_JAVASCRIPT_KEY && this.isKakaoSDKLoaded() ? "✅" : "❌",
    });

    if (!this.KAKAO_JAVASCRIPT_KEY) {
      console.error("❌ 카카오맵 API 키가 설정되지 않았습니다!");
      console.error("📝 환경변수 설정 방법:");
      console.error("  1. .env 파일에 다음 추가:");
      console.error("     VITE_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key");
      console.error(
        "  2. 카카오 개발자 센터(https://developers.kakao.com)에서 애플리케이션 등록"
      );
      console.error("  3. 'JavaScript 키' 복사하여 설정");
      console.error("  4. 웹 플랫폼에 localhost:5173 도메인 등록");
    }

    if (!this.isKakaoSDKLoaded()) {
      console.error("❌ 카카오맵 SDK가 로드되지 않았습니다!");
      console.error("📝 SDK 로드 확인:");
      console.error(
        "  1. index.html에 카카오맵 SDK 스크립트가 포함되어 있는지 확인"
      );
      console.error("  2. JavaScript 키가 올바르게 설정되어 있는지 확인");
    }
  }

  static async searchAddress(
    query: string,
    coordinate?: string
  ): Promise<Address[]> {
    console.log("🔍 네이버 Maps API 검색:", { query, coordinate });

    try {
      const url = new URL(this.GEOCODE_API_URL, window.location.origin);
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

      console.log("✅ 네이버 Maps API 응답:", {
        status: data.status,
        결과수: data.addresses?.length || 0,
      });

      // HTTP 상태 코드별 에러 처리
      if (!response.ok) {
        console.error("❌ 네이버 Maps API HTTP 오류:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });

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
        console.error("❌ 네이버 Maps API 응답 오류:", {
          status: data.status,
          errorMessage: data.errorMessage,
        });
        throw new Error(data.errorMessage || "주소 검색에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 네이버 Maps API 주소 검색 오류:", error);

      // AbortError인 경우 타임아웃 에러로 처리
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("검색 시간이 초과되었습니다.");
      }

      throw error;
    }
  }

  // 카카오맵 SDK를 사용한 장소명 검색
  static async searchPlace(query: string): Promise<Address[]> {
    console.log("🔍 카카오맵 SDK 검색:", { query });

    // API 키 유효성 검사
    this.validateApiKeys();

    // SDK가 로드되지 않았으면 빈 배열 반환
    if (!this.isKakaoSDKLoaded()) {
      console.warn("⚠️ 카카오맵 SDK가 로드되지 않아 장소명 검색을 건너뜁니다.");
      return [];
    }

    try {
      // 카카오맵 SDK의 Places 서비스 사용
      const places = new window.kakao.maps.services.Places();

      // Promise로 래핑하여 비동기 처리
      const searchResult = await new Promise<any>((resolve, reject) => {
        places.keywordSearch(query, (data: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            resolve(data);
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            resolve([]);
          } else {
            reject(new Error(`카카오맵 검색 실패: ${status}`));
          }
        });
      });

      console.log("✅ 카카오맵 SDK 응답:", {
        결과수: searchResult?.length || 0,
        결과: searchResult?.map((place: any) => place.place_name) || [],
      });

      // 카카오맵 응답을 네이버맵 형식으로 변환
      const addresses: Address[] = (searchResult || []).map((place: any) => {
        const transformedAddress = {
          roadAddress: place.road_address_name || place.address_name,
          jibunAddress: place.address_name,
          englishAddress: "",
          addressElements: [],
          x: place.x, // 경도
          y: place.y, // 위도
          distance: 0,
          name: place.place_name,
        };

        return transformedAddress;
      });

      return addresses;
    } catch (error) {
      console.error("❌ 카카오맵 SDK 장소명 검색 오류:", error);
      throw error;
    }
  }

  // 주소와 장소명을 모두 검색하는 통합 메서드
  static async searchAddressAndPlace(query: string): Promise<Address[]> {
    console.log("🔍 통합 검색 시작:", { query });

    try {
      // 주소 검색과 장소명 검색을 병렬로 실행
      const [addressResults, placeResults] = await Promise.allSettled([
        this.searchAddress(query),
        this.searchPlace(query),
      ]);

      const results: Address[] = [];

      // 주소 검색 결과 추가
      if (addressResults.status === "fulfilled") {
        results.push(...addressResults.value);
      } else {
        console.error("❌ 주소 검색 실패:", addressResults.reason);
      }

      // 장소명 검색 결과 추가 (중복 제거)
      if (placeResults.status === "fulfilled") {
        const placeAddresses = placeResults.value.filter((place) => {
          // 주소 검색 결과와 중복되지 않는지 확인
          const isDuplicate = results.some(
            (addr) =>
              addr.roadAddress === place.roadAddress ||
              addr.jibunAddress === place.jibunAddress
          );

          return !isDuplicate;
        });

        results.push(...placeAddresses);
      } else {
        console.error("❌ 장소명 검색 실패:", placeResults.reason);
      }

      console.log("✅ 통합 검색 완료:", {
        검색어: query,
        최종결과수: results.length,
      });

      return results;
    } catch (error) {
      console.error("❌ 통합 검색 오류:", error);
      throw error;
    }
  }
}
