import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface CacheInfo {
  cacheNames: string[];
}

const CacheManager: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    cacheNames: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateCacheInfo();
  }, []);

  const updateCacheInfo = async () => {
    let cacheNames: string[] = [];
    if ('caches' in window) {
      try {
        cacheNames = await caches.keys();
      } catch (error) {
        console.error('Failed to get cache names:', error);
      }
    }

    setCacheInfo({
      cacheNames,
    });
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      await updateCacheInfo();
      alert('캐시가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('캐시 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
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
          <span className="ml-2 px-2 py-1 rounded text-xs bg-red-100 text-red-800">
            비활성화됨
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
