import { useEffect, useState } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Tailwind의 md 브레이크포인트 (768px) 기준
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 체크
    checkIsMobile();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkIsMobile);

    // 클린업
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
