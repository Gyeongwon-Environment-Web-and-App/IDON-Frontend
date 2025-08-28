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

// Kakao Maps API 응답 타입 정의
interface KakaoAddressResult {
  x: string;
  y: string;
  address_name?: string;
}

interface KakaoPlaceResult {
  x: string;
  y: string;
  place_name?: string;
}

interface KakaoCoord2AddressResult {
  address: {
    address_name: string;
  };
}

export class AddressService {
  // 카카오맵 API 키 (JavaScript 키 사용)
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

  // API 키 유효성 검사 메서드
  private static validateApiKeys() {
    console.log("🔍 API 키 상태:", {
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

  // 카카오맵 주소 검색 (Geocoder 사용)
  static async searchAddress(
    query: string,
    coordinate?: string
  ): Promise<Address[]> {
    console.log("🔍 카카오맵 주소 검색:", { query, coordinate });

    // API 키 유효성 검사
    this.validateApiKeys();

    // SDK가 로드되지 않았으면 빈 배열 반환
    if (!this.isKakaoSDKLoaded()) {
      console.warn("⚠️ 카카오맵 SDK가 로드되지 않아 주소 검색을 건너뜁니다.");
      return [];
    }

    try {
      const geocoder = new window.kakao.maps.services.Geocoder();

      // Promise로 래핑하여 비동기 처리
      const searchResult = await new Promise<KakaoAddressResult[]>(
        (resolve, reject) => {
          geocoder.addressSearch(
            query,
            (result: KakaoAddressResult[], status: string) => {
              if (status === window.kakao.maps.services.Status.OK) {
                resolve(result);
              } else if (
                status === window.kakao.maps.services.Status.ZERO_RESULT
              ) {
                resolve([]);
              } else {
                reject(new Error(`카카오맵 주소 검색 실패: ${status}`));
              }
            }
          );
        }
      );

      console.log("✅ 카카오맵 주소 검색 응답:", {
        결과수: searchResult?.length || 0,
        결과: searchResult?.map((addr) => addr.address_name) || [],
      });

      // 카카오맵 응답을 통일된 형식으로 변환
      const addresses: Address[] = (searchResult || []).map((addr) => {
        const transformedAddress: Address = {
          roadAddress: addr.address_name || "", // 카카오맵은 도로명 주소를 별도로 제공하지 않음
          jibunAddress: addr.address_name || "",
          englishAddress: "",
          addressElements: [],
          x: addr.x, // 경도
          y: addr.y, // 위도
          distance: 0,
        };

        return transformedAddress;
      });

      return addresses;
    } catch (error) {
      console.error("❌ 카카오맵 주소 검색 오류:", error);
      throw error;
    }
  }

  // 카카오맵 SDK를 사용한 장소명 검색
  static async searchPlace(query: string): Promise<Address[]> {
    console.log("🔍 카카오맵 장소명 검색:", { query });

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
      const searchResult = await new Promise<{ places: KakaoPlaceResult[] }>(
        (resolve, reject) => {
          places.keywordSearch(
            query,
            (data: { places: KakaoPlaceResult[] }, status: string) => {
              if (status === window.kakao.maps.services.Status.OK) {
                resolve(data);
              } else if (
                status === window.kakao.maps.services.Status.ZERO_RESULT
              ) {
                resolve({ places: [] });
              } else {
                reject(new Error(`카카오맵 장소명 검색 실패: ${status}`));
              }
            }
          );
        }
      );

      console.log("✅ 카카오맵 장소명 검색 응답:", {
        결과수: searchResult?.places?.length || 0,
        결과: searchResult?.places?.map((place) => place.place_name) || [],
      });

      // 카카오맵 응답을 통일된 형식으로 변환
      const addresses: Address[] = (searchResult?.places || []).map((place) => {
        const transformedAddress: Address = {
          roadAddress: place.place_name || "",
          jibunAddress: place.place_name || "",
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
      console.error("❌ 카카오맵 장소명 검색 오류:", error);
      throw error;
    }
  }

  // 주소와 장소명을 모두 검색하는 통합 메서드
  static async searchAddressAndPlace(query: string): Promise<Address[]> {
    console.log("🔍 카카오맵 통합 검색 시작:", { query });

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
              addr.jibunAddress === place.jibunAddress ||
              (addr.name && addr.name === place.name)
          );

          return !isDuplicate;
        });

        results.push(...placeAddresses);
      } else {
        console.error("❌ 장소명 검색 실패:", placeResults.reason);
      }

      console.log("✅ 카카오맵 통합 검색 완료:", {
        검색어: query,
        최종결과수: results.length,
      });

      return results;
    } catch (error) {
      console.error("❌ 카카오맵 통합 검색 오류:", error);
      throw error;
    }
  }

  // 좌표를 주소로 변환 (역지오코딩)
  static async coord2Address(lat: number, lng: number): Promise<Address[]> {
    console.log("🔍 카카오맵 좌표→주소 변환:", { lat, lng });

    if (!this.isKakaoSDKLoaded()) {
      console.warn("⚠️ 카카오맵 SDK가 로드되지 않아 좌표 변환을 건너뜁니다.");
      return [];
    }

    try {
      const geocoder = new window.kakao.maps.services.Geocoder();

      const result = await new Promise<KakaoCoord2AddressResult[]>(
        (resolve, reject) => {
          geocoder.coord2Address(
            lng,
            lat,
            (result: KakaoCoord2AddressResult[], status: string) => {
              if (status === window.kakao.maps.services.Status.OK) {
                resolve(result);
              } else {
                reject(new Error(`좌표 변환 실패: ${status}`));
              }
            }
          );
        }
      );

      const addresses: Address[] = result.map((addr) => ({
        roadAddress: addr.address.address_name,
        jibunAddress: addr.address.address_name,
        englishAddress: "",
        addressElements: [],
        x: lng.toString(),
        y: lat.toString(),
        distance: 0,
      }));

      return addresses;
    } catch (error) {
      console.error("❌ 카카오맵 좌표 변환 오류:", error);
      throw error;
    }
  }
}
