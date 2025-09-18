import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  clearServiceWorkerCache,
  serviceWorkerManager,
  unregisterServiceWorker,
  updateServiceWorker,
} from '@/lib/serviceWorker';

interface CacheInfo {
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  cacheNames: string[];
}

const CacheManager: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    isRegistered: false,
    registration: null,
    cacheNames: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateCacheInfo();
  }, []);

  const updateCacheInfo = async () => {
    const isRegistered = serviceWorkerManager.isRegistered();
    const registration = serviceWorkerManager.getRegistration();

    let cacheNames: string[] = [];
    if ('caches' in window) {
      try {
        cacheNames = await caches.keys();
      } catch (error) {
        console.error('Failed to get cache names:', error);
      }
    }

    setCacheInfo({
      isRegistered,
      registration,
      cacheNames,
    });
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await clearServiceWorkerCache();
      await updateCacheInfo();
      alert('캐시가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('캐시 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateServiceWorker = async () => {
    setIsLoading(true);
    try {
      await updateServiceWorker();
      alert('서비스 워커 업데이트가 요청되었습니다.');
    } catch (error) {
      console.error('Failed to update service worker:', error);
      alert('서비스 워커 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregisterServiceWorker = async () => {
    if (confirm('서비스 워커를 등록 해제하시겠습니까?')) {
      setIsLoading(true);
      try {
        const result = await unregisterServiceWorker();
        if (result) {
          alert('서비스 워커가 성공적으로 등록 해제되었습니다.');
          await updateCacheInfo();
        } else {
          alert('서비스 워커 등록 해제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
        alert('서비스 워커 등록 해제에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="text-lg font-semibold mb-3">캐시 관리</h3>

      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="font-medium">서비스 워커:</span>
          <span
            className={`ml-2 px-2 py-1 rounded text-xs ${
              cacheInfo.isRegistered
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {cacheInfo.isRegistered ? '등록됨' : '미등록'}
          </span>
        </div>

        <div className="text-sm">
          <span className="font-medium">캐시 개수:</span>
          <span className="ml-2">{cacheInfo.cacheNames.length}개</span>
        </div>

        {cacheInfo.cacheNames.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">캐시 목록:</span>
            <ul className="ml-2 mt-1 text-xs text-gray-600">
              {cacheInfo.cacheNames.map((name, index) => (
                <li key={index}>• {name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleClearCache}
          disabled={isLoading}
          className="w-full text-sm"
          variant="outline"
        >
          {isLoading ? '처리 중...' : '캐시 삭제'}
        </Button>

        <Button
          onClick={handleUpdateServiceWorker}
          disabled={isLoading || !cacheInfo.isRegistered}
          className="w-full text-sm"
          variant="outline"
        >
          {isLoading ? '처리 중...' : '서비스 워커 업데이트'}
        </Button>

        <Button
          onClick={handleUnregisterServiceWorker}
          disabled={isLoading || !cacheInfo.isRegistered}
          className="w-full text-sm"
          variant="destructive"
        >
          {isLoading ? '처리 중...' : '서비스 워커 등록 해제'}
        </Button>

        <Button
          onClick={updateCacheInfo}
          disabled={isLoading}
          className="w-full text-sm"
          variant="ghost"
        >
          정보 새로고침
        </Button>
      </div>
    </div>
  );
};

export default CacheManager;
