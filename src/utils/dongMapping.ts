// 도봉구 동 정보 매핑 시스템 - Kakao Maps API 기반

// Kakao Maps API 타입 정의
declare global {
  interface Window {
    kakao: {
      maps: {
        // Core Map functionality
        Map: new (
          container: HTMLElement,
          options: {
            center: KakaoLatLng;
            level: number;
            mapTypeId?: KakaoMapTypeId;
          }
        ) => KakaoMap;

        // Marker functionality
        Marker: new (options: {
          position: KakaoLatLng;
          map: KakaoMap;
        }) => KakaoMarker;

        // InfoWindow functionality
        InfoWindow: new (options: { content: string }) => KakaoInfoWindow;

        // LatLng functionality
        LatLng: new (lat: number, lng: number) => KakaoLatLng;

        // MapTypeId constants
        MapTypeId: {
          ROADMAP: KakaoMapTypeId;
          SKYVIEW: KakaoMapTypeId;
          HYBRID: KakaoMapTypeId;
        };

        // Event system
        event: {
          addListener: (
            target: KakaoMap | KakaoMarker,
            type: string,
            handler: () => void
          ) => void;
          removeListener: (
            target: KakaoMap | KakaoMarker,
            type: string,
            handler: () => void
          ) => void;
        };

        // SDK loading
        load: (callback: () => void) => void;

        // Services
        services: {
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
          Geocoder: new () => {
            coord2RegionCode: (
              x: number,
              y: number,
              callback: (
                result: Array<{
                  region_type: string;
                  region_3depth_name: string;
                  region_2depth_name: string;
                  region_1depth_name: string;
                }>,
                status: string
              ) => void
            ) => void;
            coord2Address: (
              x: number,
              y: number,
              callback: (
                result: Array<{
                  address: {
                    address_name: string;
                  };
                }>,
                status: string
              ) => void
            ) => void;
            addressSearch: (
              address: string,
              callback: (
                result: Array<{
                  x: string;
                  y: string;
                  address_name?: string;
                }>,
                status: string
              ) => void
            ) => void;
          };
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (
                result: Array<{
                  x: string;
                  y: string;
                  place_name: string;
                  address_name: string;
                  road_address_name?: string;
                  distance?: string;
                  category_name?: string;
                  phone?: string;
                  place_url?: string;
                }>,
                status: string
              ) => void,
              options?: unknown
            ) => void;
          };
        };
      };
    };
  }
}

// Kakao Maps specific types
interface KakaoLatLng {
  lat: () => number;
  lng: () => number;
}

interface KakaoMap {
  setCenter: (position: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
}

interface KakaoMarker {
  setPosition: (position: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
  setMap: (map: KakaoMap | null) => void;
}

interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
  setContent: (content: string) => void;
}

type KakaoMapTypeId = string;

// 도봉구 주소인지 확인하는 함수
export const isDobongAddress = (address: string): boolean => {
  const dobongKeywords = ["도봉구", "방학", "쌍문", "창동", "도봉동", "마들"];

  return dobongKeywords.some((keyword) => address.includes(keyword));
};

// 주소를 검색에 최적화된 키워드로 변환
const formatSearchKeyword = (address: string): string => {
  // 1. 불필요한 공백 제거 및 정규화
  let keyword = address.trim().replace(/\s+/g, " ");

  // 2. 서울시 -> 서울로 변환 (더 일반적인 형식)
  keyword = keyword.replace(/서울시/g, "서울");
  keyword = keyword.replace(/서울특별시/g, "서울");

  // 3. 도봉구 주소인 경우 더 구체적인 검색어 생성
  if (keyword.includes("도봉구")) {
    // 도로명 주소 패턴 (개선): "서울 도봉구 [도로명길] [번호]"
    const roadPattern = /서울\s*도봉구\s*([가-힣]+로[가-힣]*길?)\s*(\d+)/;
    const match = keyword.match(roadPattern);

    if (match) {
      const roadName = match[1];
      const buildingNumber = match[2];
      // 도로명길 + 건물번호로 검색 (더 정확함)
      return `${roadName} ${buildingNumber}`;
    }

    // 일반 도로명 주소 패턴: "서울 도봉구 [도로명] [번호]"
    const simpleRoadPattern = /서울\s*도봉구\s*([가-힣]+로)\s*(\d+)/;
    const simpleMatch = keyword.match(simpleRoadPattern);

    if (simpleMatch) {
      const roadName = simpleMatch[1];
      const buildingNumber = simpleMatch[2];
      // 도로명 + 건물번호로 검색
      return `${roadName} ${buildingNumber}`;
    }

    // 일반적인 주소 패턴: "서울 도봉구 [동명] [상세주소]"
    const dongPattern = /서울\s*도봉구\s*([가-힣]+동)\s*(.+)/;
    const dongMatch = keyword.match(dongPattern);

    if (dongMatch) {
      const dongName = dongMatch[1];
      const detail = dongMatch[2].trim();
      // 동명 + 상세주소로 검색
      return `${dongName} ${detail}`;
    }
  }

  // 4. 기본적으로 도봉구 키워드 제거 (더 넓은 검색)
  keyword = keyword.replace(/서울\s*도봉구\s*/, "");

  return keyword;
};

// 주소를 좌표로 변환 (Geocoder API 사용)
const getCoordinatesFromAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services?.Geocoder) {
      console.error("Kakao Maps Geocoder not loaded");
      resolve(null);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    // 주소 검색 키워드 최적화
    const optimizedAddress = formatSearchKeyword(address);
    console.log(`🔍 주소 지오코딩: "${address}" -> "${optimizedAddress}"`);

    geocoder.addressSearch(optimizedAddress, (result, status) => {
      if (
        status === window.kakao.maps.services.Status.OK &&
        result &&
        Array.isArray(result) &&
        result.length &&
        result.length > 0
      ) {
        const addressInfo = result[0];
        if (addressInfo && addressInfo.x && addressInfo.y) {
          console.log(
            `✅ 주소 좌표 찾음: ${addressInfo.x}, ${addressInfo.y} (${addressInfo.address_name || "Unknown"})`
          );
          resolve({
            lat: parseFloat(addressInfo.y),
            lng: parseFloat(addressInfo.x),
          });
        } else {
          console.warn(`Invalid address data for: ${optimizedAddress}`);
          resolve(null);
        }
      } else {
        console.warn(
          `No address results found for: ${optimizedAddress}, status: ${status}`
        );
        resolve(null);
      }
    });
  });
};

// 좌표를 세부 행정동 정보로 변환 (coord2RegionCode 사용)
const getDetailedDongInfo = async (
  lat: number,
  lng: number
): Promise<string> => {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services?.Geocoder) {
      console.error("Kakao Maps Geocoder not loaded");
      resolve("");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    // coord2RegionCode는 x=lng, y=lat 순서로 매개변수를 받음
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (
        status === window.kakao.maps.services.Status.OK &&
        result &&
        Array.isArray(result) &&
        result.length > 0
      ) {
        // 3단계 행정구역(동 레벨) 찾기
        const dongRegion = result.find((region) => region.region_type === "H");
        if (dongRegion && dongRegion.region_3depth_name) {
          console.log(`✅ 세부 동 정보 찾음: ${dongRegion.region_3depth_name}`);
          resolve(dongRegion.region_3depth_name); // "방학2동" 형태로 반환
        } else {
          console.warn(
            `No 3-depth region found for coordinates: ${lat}, ${lng}`
          );
          resolve("");
        }
      } else {
        console.warn(
          `Failed to get region code for coordinates: ${lat}, ${lng}, status: ${status}`
        );
        resolve("");
      }
    });
  });
};

// 좌표를 주소로 변환하여 동 정보 추출 (기존 함수 - fallback용)
const getDongFromCoordinates = async (
  lat: number,
  lng: number
): Promise<string> => {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services?.Geocoder) {
      console.error("Kakao Maps Geocoder not loaded");
      resolve("");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    // coord2Address를 사용하여 주소 정보 얻기 (x=lng, y=lat)
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (
        status === window.kakao.maps.services.Status.OK &&
        result &&
        Array.isArray(result) &&
        result.length &&
        result.length > 0
      ) {
        const addressInfo = result[0];
        if (
          addressInfo &&
          addressInfo.address &&
          addressInfo.address.address_name
        ) {
          console.log(`✅ 주소 정보 찾음: ${addressInfo.address.address_name}`);

          // 주소에서 동 정보 추출
          const dongInfo = extractDongFromAddress(
            addressInfo.address.address_name
          );
          if (dongInfo) {
            resolve(dongInfo);
          } else {
            console.warn(
              `Could not extract dong from address: ${addressInfo.address.address_name}`
            );
            resolve("");
          }
        } else {
          console.warn(`No address info found for coordinates: ${lat}, ${lng}`);
          resolve("");
        }
      } else {
        console.warn(
          `Failed to get address for coordinates: ${lat}, ${lng}, status: ${status}`
        );
        resolve("");
      }
    });
  });
};

// 주소에서 동 정보 추출하는 헬퍼 함수
const extractDongFromAddress = (address: string): string => {
  try {
    // 서울시 도봉구 패턴 매칭
    const dobongPattern = /서울특별시\s*도봉구\s*([가-힣]+동)/;
    const match = address.match(dobongPattern);

    if (match) {
      const dongName = match[1];
      console.log(`✅ 동 정보 추출: ${dongName}`);
      return dongName;
    }

    // 도봉구 키워드가 있는 경우
    if (address.includes("도봉구")) {
      // 동 패턴 찾기 (방학동, 쌍문동, 창동, 도봉동, 마들동)
      const dongPatterns = [
        /방학\s*[1-2]?동/,
        /쌍문\s*[1-4]?동/,
        /창\s*[1-5]?동/,
        /도봉\s*[1-2]?동/,
        /마들\s*[1-2]?동/,
      ];

      for (const pattern of dongPatterns) {
        const dongMatch = address.match(pattern);
        if (dongMatch) {
          console.log(`✅ 동 정보 추출: ${dongMatch[0]}`);
          return dongMatch[0];
        }
      }
    }

    return "";
  } catch (error) {
    console.error("동 정보 추출 오류:", error);
    return "";
  }
};

// 주소에서 동 정보 추출 함수 (API 기반) - 업데이트됨
export const extractDongInfo = async (address: string): Promise<string> => {
  try {
    // 도봉구 주소가 아니면 빈 문자열 반환
    if (!isDobongAddress(address)) {
      return "";
    }

    // 1. 주소를 좌표로 변환
    const coords = await getCoordinatesFromAddress(address);
    if (!coords) {
      console.warn(`Could not find coordinates for address: ${address}`);
      return "";
    }

    // 2. 좌표를 세부 행정동 정보로 변환 (coord2RegionCode 사용)
    const detailedDongInfo = await getDetailedDongInfo(coords.lat, coords.lng);

    if (detailedDongInfo) {
      return detailedDongInfo;
    }

    // 3. fallback: 기존 coord2Address 방식 사용
    console.log("Falling back to coord2Address method");
    const dongInfo = await getDongFromCoordinates(coords.lat, coords.lng);

    if (dongInfo) {
      return dongInfo;
    }

    console.warn(`Could not extract dong info for address: ${address}`);
    return "";
  } catch (error) {
    console.error("동 정보 추출 오류:", error);
    return "";
  }
};

// 주소 포맷팅 함수 (동 정보 포함) - 비동기 버전
export const formatAddressWithDong = async (
  address: string
): Promise<string> => {
  const dongInfo = await extractDongInfo(address);
  if (!dongInfo) {
    return address;
  }
  return `${address} (${dongInfo})`;
};

// 동 정보만 반환하는 함수 - 비동기 버전
export const getDongInfo = async (address: string): Promise<string> => {
  return extractDongInfo(address);
};
