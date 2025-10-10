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
  place_name: string;
  address_name: string;
  road_address_name?: string;
  distance?: string;
  category_name?: string;
  phone?: string;
  place_url?: string;
}

// Kakao Maps API Status interface
export interface KakaoStatus {
  OK: string;
  ZERO_RESULT: string;
  ERROR: string;
}

// Kakao Places API response structure
export interface KakaoPlacesResponse {
  places: {
    x: string;
    y: string;
    place_name?: string;
    address_name?: string;
    road_address_name?: string;
    distance?: string;
    category_name?: string;
    phone?: string;
    place_url?: string;
  }[];
}

interface KakaoCoord2AddressResult {
  address: {
    address_name: string;
  };
}

export class AddressService {
  // 카카오맵 SDK 초기화 확인
  private static isKakaoSDKLoaded(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!window.kakao &&
      !!window.kakao.maps &&
      !!window.kakao.maps.services
    );
  }

  // Get coordinates from address string
  static async getCoordinatesFromAddress(
    address: string
  ): Promise<{ x: string; y: string } | null> {
    if (!this.isKakaoSDKLoaded()) {
      console.error('❌ 카카오맵 SDK가 로드되지 않았습니다.');
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(
        address,
        (result: KakaoAddressResult[], status: string) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            result.length > 0
          ) {
            const firstResult = result[0];
            resolve({
              x: firstResult.x,
              y: firstResult.y,
            });
          } else {
            console.warn('주소 검색 실패:', address, status);
            resolve(null);
          }
        }
      );
    });
  }

  // 카카오맵 주소 검색 (Geocoder 사용)
  static async searchAddress(query: string): Promise<Address[]> {
    // SDK가 로드되지 않았으면 빈 배열 반환
    if (!this.isKakaoSDKLoaded()) {
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

      // 카카오맵 응답을 통일된 형식으로 변환
      const addresses: Address[] = (searchResult || []).map((addr) => {
        const transformedAddress: Address = {
          roadAddress: addr.address_name || '', // 카카오맵은 도로명 주소를 별도로 제공하지 않음
          jibunAddress: addr.address_name || '',
          englishAddress: '',
          addressElements: [],
          x: addr.x, // 경도
          y: addr.y, // 위도
          distance: 0,
        };

        return transformedAddress;
      });

      return addresses;
    } catch (error) {
      console.error('❌ 카카오맵 주소 검색 오류:', error);
      throw error;
    }
  }

  // 카카오맵 SDK를 사용한 장소명 검색
  static async searchPlace(query: string): Promise<Address[]> {
    // SDK가 로드되지 않았으면 빈 배열 반환
    if (!this.isKakaoSDKLoaded()) {
      return [];
    }

    try {
      // 카카오맵 SDK의 Places 서비스 사용
      const places = new window.kakao.maps.services.Places();

      // Promise로 래핑하여 비동기 처리
      const searchResult = await new Promise<KakaoPlaceResult[]>(
        (resolve, reject) => {
          places.keywordSearch(
            query,
            (result: KakaoPlacesResponse, status: string) => {
              if (status === window.kakao.maps.services.Status.OK) {
                // 결과 구조 확인 및 올바른 데이터 추출
                let actualResults: KakaoPlaceResult[] = [];

                if (Array.isArray(result)) {
                  // result가 직접 배열인 경우
                  actualResults = result as KakaoPlaceResult[];
                } else if (result?.places && Array.isArray(result.places)) {
                  // result.places가 배열인 경우
                  actualResults = result.places as KakaoPlaceResult[];
                }

                resolve(actualResults);
              } else if (
                status === window.kakao.maps.services.Status.ZERO_RESULT
              ) {
                resolve([]);
              } else {
                reject(new Error(`카카오맵 장소명 검색 실패: ${status}`));
              }
            }
          );
        }
      );

      // 카카오맵 응답을 통일된 형식으로 변환 - 공식 문서 구조에 맞게 수정
      const addresses: Address[] = (searchResult || []).map((place) => {
        const transformedAddress: Address = {
          roadAddress: place.road_address_name || place.address_name || '',
          jibunAddress: place.address_name || '',
          englishAddress: '',
          addressElements: [],
          x: place.x, // 경도
          y: place.y, // 위도
          distance: place.distance ? parseInt(place.distance) : 0,
          name: place.place_name,
        };

        return transformedAddress;
      });

      return addresses;
    } catch (error) {
      console.error('❌ 카카오맵 장소명 검색 오류:', error);
      throw error;
    }
  }

  // 주소와 장소명을 모두 검색하는 통합 메서드
  static async searchAddressAndPlace(query: string): Promise<Address[]> {
    try {
      // 주소 검색과 장소명 검색을 병렬로 실행
      const [addressResults, placeResults] = await Promise.allSettled([
        this.searchAddress(query),
        this.searchPlace(query),
      ]);

      const results: Address[] = [];

      // 주소 검색 결과 추가
      if (addressResults.status === 'fulfilled') {
        results.push(...addressResults.value);
      }

      // 장소명 검색 결과 추가 (중복 제거)
      if (placeResults.status === 'fulfilled') {
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
      }

      return results;
    } catch (error) {
      console.error('❌ 카카오맵 통합 검색 오류:', error);
      throw error;
    }
  }

  // 좌표를 주소로 변환 (역지오코딩)
  static async coord2Address(lat: number, lng: number): Promise<Address[]> {
    if (!this.isKakaoSDKLoaded()) {
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
        englishAddress: '',
        addressElements: [],
        x: lng.toString(),
        y: lat.toString(),
        distance: 0,
      }));

      return addresses;
    } catch (error) {
      console.error('❌ 카카오맵 좌표 변환 오류:', error);
      throw error;
    }
  }
}
